package whatsapp

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"

	"go.mau.fi/whatsmeow"
	waProto "go.mau.fi/whatsmeow/binary/proto"
	"go.mau.fi/whatsmeow/types"
	"google.golang.org/protobuf/proto"
)

type whatsAppManager struct {
	client *whatsmeow.Client
	qrChan chan string
}

func NewWhatsAppManager(client *whatsmeow.Client) domain.WhatsAppGateway {
	return &whatsAppManager{
		client: client,
		qrChan: make(chan string, 1),
	}
}

func parseJID(phone string) types.JID {
	if !strings.Contains(phone, "@") {
		phone = phone + "@s.whatsapp.net"
	}
	jid, _ := types.ParseJID(phone)
	return jid
}

func (m *whatsAppManager) SendMessage(ctx context.Context, phone, text string) error {
	if !m.client.IsConnected() {
		return errors.New("whatsapp não está conectado")
	}

	msg := &waProto.Message{
		Conversation: proto.String(text),
	}

	_, err := m.client.SendMessage(ctx, parseJID(phone), msg)
	return err
}

func (m *whatsAppManager) SendFlowMessage(ctx context.Context, phone, text, id string) error {
	if !m.client.IsConnected() {
		return errors.New("whatsapp não está conectado")
	}
	jid, err := types.ParseJID(phone)
	if err != nil || jid.Server == "" {
		jid = parseJID(phone)
	}
	hash := sha256.Sum256([]byte(id))
	_, err = m.client.SendMessage(ctx, jid, &waProto.Message{Conversation: proto.String(text)}, whatsmeow.SendRequestExtra{ID: strings.ToUpper(hex.EncodeToString(hash[:16])), Timeout: 10 * time.Second})
	return err
}

func (m *whatsAppManager) SendMedia(ctx context.Context, phone, mediaType string, data []byte) error {
	return errors.New("não implementado no MVP")
}

func (m *whatsAppManager) SendPresence(ctx context.Context, phone string, isComposing bool) error {
	jid := parseJID(phone)

	// A nova versão exige o contexto e o tipo de mídia como ChatPresenceMedia("").
	if isComposing {
		return m.client.SendChatPresence(ctx, jid, types.ChatPresenceComposing, types.ChatPresenceMedia(""))
	}
	return m.client.SendChatPresence(ctx, jid, types.ChatPresencePaused, types.ChatPresenceMedia(""))
}

func (m *whatsAppManager) Connect(ctx context.Context) error {
	if m.client.Store.ID == nil {
		qrChan, _ := m.client.GetQRChannel(ctx)
		err := m.client.Connect()
		if err != nil {
			return err
		}

		go func() {
			for evt := range qrChan {
				if evt.Event == "code" {
					m.qrChan <- evt.Code
				} else if evt.Event == "success" {
					// 🟢 O celular leu o QR Code com sucesso!
					// Avisa o handler que conectou!
					m.qrChan <- "CONNECTED"
				}
			}
		}()

		return nil
	}
	return m.client.Connect()
}

func (m *whatsAppManager) Disconnect(ctx context.Context) error {
	m.client.Disconnect()
	return nil
}

func (m *whatsAppManager) GetConnectionStatus(ctx context.Context) string {
	if m.client.IsConnected() {
		if m.client.IsLoggedIn() {
			return "CONNECTED"
		}
		return "QR_READY"
	}
	return "DISCONNECTED"
}

func (m *whatsAppManager) GetQRCodeChannel(ctx context.Context) <-chan string {
	return m.qrChan
}
