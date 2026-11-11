package whatsapp

import (
	"context"
	"log/slog"
	"time"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/types/events"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type incomingMessageTask struct {
	Phone     string
	Content   string
	MsgType   string
	Timestamp time.Time
}

type WhatsAppListener struct {
	client *whatsmeow.Client
	chatUC domain.ChatUseCase
	queue  chan incomingMessageTask // <-- A Fila nativa do Go (Channel)
}

// O Google Wire chama isso e injeta o UseCase!
func NewWhatsAppListener(client *whatsmeow.Client, chatUC domain.ChatUseCase) *WhatsAppListener {
	listener := &WhatsAppListener{
		client: client,
		chatUC: chatUC,
		queue:  make(chan incomingMessageTask, 1000),
		// Cria um canal com um "buffer" de 1000 posições.
		// Suporta um pico de 1000 mensagens simultâneas sem engasgar o WhatsApp.
	}
	client.AddEventHandler(listener.eventHandler)
	go listener.processQueue()
	return listener
}

func (l *WhatsAppListener) eventHandler(evt interface{}) {
	switch v := evt.(type) {
	case *events.Message:
		if v.Info.IsFromMe || v.Info.IsGroup {
			return
		}

		phone := v.Info.Sender.User
		content := v.Message.GetConversation()

		if content == "" {
			content = "[Mídia Recebida]"
		}

		// Prepara a tarefa
		task := incomingMessageTask{
			Phone:     phone,
			Content:   content,
			MsgType:   "text",
			Timestamp: v.Info.Timestamp,
		}

		// Tenta jogar na fila sem bloquear (padrão de proteção)
		select {
		case l.queue <- task:
			// Sucesso! A mensagem já está na memória do Go.
		default:
			// Se o buffer de 1000 encher (algo raro, tipo um ataque de spam),
			// ele ignora a mensagem aqui em vez de derrubar a aplicação.
			slog.Warn("ALERTA: Fila de mensagens lotada! Mensagem descartada.", "phone", phone)
		}
	}
}

func (l *WhatsAppListener) processQueue() {
	ctx := context.Background()

	// O `for range` fica "dormindo" sem gastar CPU até chegar algo na fila.
	// Quando chega, ele acorda, pega a tarefa e processa.
	for task := range l.queue {
		slog.Info("Processando mensagem da fila", "phone", task.Phone)

		err := l.chatUC.HandleIncomingMessage(ctx, task.Phone, task.Content, task.MsgType, task.Timestamp)
		if err != nil {
			slog.Error("Erro ao processar mensagem da fila", "phone", task.Phone, "err", err)
		} else {
			slog.Info("✅ Mensagem salva e processada com sucesso!", "phone", task.Phone)
		}
	}
}
