package sse

import (
	"fmt"
	"net/http"
	"sync"
)

// Broker gerencia os clientes conectados via Server-Sent Events (SSE)
type Broker struct {
	clients  map[chan string]bool
	mutex    sync.RWMutex
	Notifier chan string
}

func NewBroker() *Broker {
	broker := &Broker{
		clients:  make(map[chan string]bool),
		Notifier: make(chan string),
	}
	go broker.listen()
	return broker
}

func (b *Broker) listen() {
	for {
		select {
		case msg := <-b.Notifier:
			b.mutex.RLock()
			for clientMessageChan := range b.clients {
				// Envia a mensagem para todos os clientes conectados sem travar
				select {
				case clientMessageChan <- msg:
				default:
				}
			}
			b.mutex.RUnlock()
		}
	}
}

// ServeHTTP permite que o roteador Chi plugue o Broker direto numa rota (ex: /v1/api/sessions/stream)
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

	messageChan := make(chan string)
	b.mutex.Lock()
	b.clients[messageChan] = true
	b.mutex.Unlock()

	defer func() {
		b.mutex.Lock()
		delete(b.clients, messageChan)
		b.mutex.Unlock()
		close(messageChan)
	}()

	// Mantém a conexão aberta enviando eventos
	for {
		select {
		case <-r.Context().Done():
			return // Cliente fechou a aba do navegador
		case msg := <-messageChan:
			fmt.Fprintf(w, "data: %s\n\n", msg)
			flusher.Flush()
		}
	}
}
