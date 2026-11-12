package domain

import (
	"context"
)

// WhatsAppGateway é a interface de saída que permite o Core do CRM
// disparar ações no WhatsApp sem saber se é whatsmeow ou Cloud API Meta.
type WhatsAppGateway interface {
	FlowSender
	// Ações de Mensageria
	SendMessage(ctx context.Context, phone, text string) error
	SendMedia(ctx context.Context, phone, mediaType string, data []byte) error
	SendPresence(ctx context.Context, phone string, isComposing bool) error

	// Gerenciamento da Conexão
	Connect(ctx context.Context) error
	Disconnect(ctx context.Context) error
	Logout(ctx context.Context) error

	// Estado e QRCode (Canal para enviar SSE/WebSocket pro Frontend)
	GetConnectionStatus(ctx context.Context) string
	GetQRCodeChannel(ctx context.Context) <-chan string
}
