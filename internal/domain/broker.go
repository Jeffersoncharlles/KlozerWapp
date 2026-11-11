package domain

// Broker define o contrato para o sistema de mensageria em tempo real (SSE ou WebSocket)
type Broker interface {
	// Publish envia um evento/mensagem para um tópico específico (ex: "chat_123")
	Publish(topic string, data interface{}) error
}
