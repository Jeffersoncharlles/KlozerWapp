package whatsapp

import (
	"context"
	"log/slog"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/types/events"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type WhatsAppListener struct {
	client *whatsmeow.Client
	chatUC domain.ChatUseCase
}

// O Google Wire chama isso e injeta o UseCase!
func NewWhatsAppListener(client *whatsmeow.Client, chatUC domain.ChatUseCase) *WhatsAppListener {
	listener := &WhatsAppListener{
		client: client,
		chatUC: chatUC,
	}

	// Adiciona o gatilho de eventos no Whatsmeow
	client.AddEventHandler(listener.eventHandler)
	return listener
}

func (l *WhatsAppListener) eventHandler(evt interface{}) {
	switch v := evt.(type) {
	case *events.Message:
		// Ignora mensagens enviadas pelo próprio usuário em outro aparelho ou mensagens de grupos
		if v.Info.IsFromMe || v.Info.IsGroup {
			return
		}

		phone := v.Info.Sender.User
		content := v.Message.GetConversation() // Texto simples

		// Se for mensagem de imagem, áudio ou template, precisaria de uma tratativa maior
		if content == "" {
			content = "[Mídia Recebida]"
		}

		ctx := context.Background()
		timestamp := v.Info.Timestamp

		err := l.chatUC.HandleIncomingMessage(ctx, phone, content, "text", timestamp)
		if err != nil {
			slog.Error("Erro ao processar mensagem recebida", "phone", phone, "err", err)
		} else {
			slog.Info("Mensagem recebida com sucesso", "phone", phone)
		}
	}
}
