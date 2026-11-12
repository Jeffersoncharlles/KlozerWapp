package whatsapp

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
	"sync"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"

	"go.mau.fi/whatsmeow"
	waProto "go.mau.fi/whatsmeow/binary/proto"
	"go.mau.fi/whatsmeow/types"
	"go.mau.fi/whatsmeow/types/events"
	"google.golang.org/protobuf/proto"
)

type whatsAppManager struct {
	runtime       *WhatsAppRuntime
	qrChan        chan string
	mu            sync.Mutex
	cancelPairing context.CancelFunc
}

func NewWhatsAppManager(runtime *WhatsAppRuntime) domain.WhatsAppGateway {
	manager := &whatsAppManager{
		runtime: runtime,
		qrChan:  make(chan string, 8),
	}
	runtime.AddEventHandler(func(evt interface{}) bool {
		switch evt.(type) {
		case *events.Connected:
			manager.publish("CONNECTED")
		case *events.Disconnected:
			manager.publish("DISCONNECTED")
		case *events.LoggedOut:
			manager.publish("DISCONNECTED")
			go func() {
				if err := runtime.Recreate(context.Background()); err != nil {
					manager.publish("ERROR: " + err.Error())
				}
			}()
		}
		return true
	})
	return manager
}

func (m *whatsAppManager) publish(value string) {
	select {
	case m.qrChan <- value:
	default:
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
	client := m.runtime.Current()
	if !client.IsConnected() {
		return errors.New("whatsapp não está conectado")
	}

	msg := &waProto.Message{
		Conversation: proto.String(text),
	}

	_, err := client.SendMessage(ctx, parseJID(phone), msg)
	return err
}

func (m *whatsAppManager) SendFlowMessage(ctx context.Context, phone, text, id string) error {
	client := m.runtime.Current()
	if !client.IsConnected() {
		return errors.New("whatsapp não está conectado")
	}
	jid, err := types.ParseJID(phone)
	if err != nil || jid.Server == "" {
		jid = parseJID(phone)
	}
	hash := sha256.Sum256([]byte(id))
	_, err = client.SendMessage(ctx, jid, &waProto.Message{Conversation: proto.String(text)}, whatsmeow.SendRequestExtra{ID: strings.ToUpper(hex.EncodeToString(hash[:16])), Timeout: 10 * time.Second})
	return err
}

func (m *whatsAppManager) SendMedia(ctx context.Context, phone, mediaType string, data []byte) error {
	return errors.New("não implementado no MVP")
}

func (m *whatsAppManager) SendPresence(ctx context.Context, phone string, isComposing bool) error {
	client := m.runtime.Current()
	jid := parseJID(phone)

	// A nova versão exige o contexto e o tipo de mídia como ChatPresenceMedia("").
	if isComposing {
		return client.SendChatPresence(ctx, jid, types.ChatPresenceComposing, types.ChatPresenceMedia(""))
	}
	return client.SendChatPresence(ctx, jid, types.ChatPresencePaused, types.ChatPresenceMedia(""))
}

func (m *whatsAppManager) Connect(ctx context.Context) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	client := m.runtime.Current()
	if client.Store.Deleted {
		if err := m.runtime.Recreate(context.Background()); err != nil {
			return err
		}
		client = m.runtime.Current()
	}

	if client.Store.ID == nil {
		if m.cancelPairing != nil {
			m.cancelPairing()
		}
		pairingCtx, cancel := context.WithCancel(context.Background())
		qrChan, err := client.GetQRChannel(pairingCtx)
		if err != nil {
			cancel()
			return err
		}
		m.cancelPairing = cancel

		err = client.Connect()
		if err != nil {
			cancel()
			m.cancelPairing = nil
			return err
		}

		go func() {
			for evt := range qrChan {
				switch evt.Event {
				case whatsmeow.QRChannelEventCode:
					m.publish(evt.Code)
				case whatsmeow.QRChannelEventError:
					m.publish("ERROR: " + evt.Error.Error())
				}
			}
		}()

		return nil
	}
	return client.Connect()
}

func (m *whatsAppManager) Disconnect(ctx context.Context) error {
	m.mu.Lock()
	if m.cancelPairing != nil {
		m.cancelPairing()
		m.cancelPairing = nil
	}
	m.mu.Unlock()
	client := m.runtime.Current()
	client.Disconnect()
	return nil
}

func (m *whatsAppManager) Logout(ctx context.Context) error {
	m.mu.Lock()
	if m.cancelPairing != nil {
		m.cancelPairing()
		m.cancelPairing = nil
	}
	m.mu.Unlock()

	client := m.runtime.Current()
	if !client.IsLoggedIn() {
		return errors.New("whatsapp não está autenticado")
	}
	if err := client.Logout(ctx); err != nil {
		return err
	}
	return m.runtime.Recreate(context.Background())
}

func (m *whatsAppManager) GetConnectionStatus(ctx context.Context) string {
	client := m.runtime.Current()
	if client.IsConnected() {
		if client.IsLoggedIn() {
			return "CONNECTED"
		}
		return "QR_READY"
	}
	return "DISCONNECTED"
}

func (m *whatsAppManager) GetQRCodeChannel(ctx context.Context) <-chan string {
	return m.qrChan
}
