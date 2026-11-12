package sse

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"sync"
)

type Broker struct {
	clients  map[chan string]bool
	mutex    sync.RWMutex
	Notifier chan string
}

func NewBroker() *Broker {
	broker := &Broker{
		clients:  make(map[chan string]bool),
		Notifier: make(chan string, 100), // Buffer no Notifier para não travar
	}
	go broker.listen()
	return broker
}

func (b *Broker) listen() {
	// Substituímos o select infinito por um range limpo
	for msg := range b.Notifier {
		b.mutex.RLock()
		clientesConectados := len(b.clients)

		slog.Info("📡 SSE Broker: Distribuindo nova mensagem", "clientes_conectados", clientesConectados)

		for clientMessageChan := range b.clients {
			select {
			case clientMessageChan <- msg:
				slog.Info("✅ SSE Broker: Mensagem entregue ao canal do cliente com sucesso")
			default:
				// Se cair aqui, era isso que estava escondendo o seu QR Code!
				slog.Warn("🚨 SSE Broker: Mensagem DESCARTADA! O cliente estava bloqueado ou sem buffer")
			}
		}
		b.mutex.RUnlock()
	}
}

func (b *Broker) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported!", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	// 👇 O SEGREDO ABSOLUTO ESTÁ AQUI: BUFFER DE 50 👇
	// Sem esse 50, o select lá em cima descarta a mensagem na menor oscilação
	messageChan := make(chan string, 50)

	b.mutex.Lock()
	b.clients[messageChan] = true
	b.mutex.Unlock()

	slog.Info("🟢 SSE Broker: Novo cliente conectado e escutando!")

	defer func() {
		b.mutex.Lock()
		delete(b.clients, messageChan)
		b.mutex.Unlock()
		close(messageChan)
		slog.Info("🔴 SSE Broker: Cliente desconectado!")
	}()

	// Envia um comentário vazio para forçar a abertura da conexão imediatamente no navegador
	fmt.Fprintf(w, ": heartbeat\n\n")
	flusher.Flush()

	for {
		select {
		case <-r.Context().Done():
			return
		case msg := <-messageChan:
			fmt.Fprintf(w, "data: %s\n\n", msg)
			flusher.Flush()
		}
	}
}

func (b *Broker) Publish(topic string, data interface{}) error {
	payload := map[string]interface{}{
		"topic": topic,
		"data":  data,
	}

	bytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	b.Notifier <- string(bytes)
	return nil
}
