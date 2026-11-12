package whatsapp

import (
	"context"
	"encoding/json"
	"log/slog"
	"sync"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/types/events"
)

type WhatsAppListener struct {
	client  *whatsmeow.Client
	chatUC  domain.ChatUseCase
	ctx     context.Context
	mu      sync.Mutex
	stopped bool
	wg      sync.WaitGroup
}

func NewWhatsAppListener(client *whatsmeow.Client, chat domain.ChatUseCase) (*WhatsAppListener, func()) {
	ctx, cancel := context.WithCancel(context.Background())
	l := &WhatsAppListener{client: client, chatUC: chat, ctx: ctx}
	id := client.AddEventHandlerWithSuccessStatus(l.eventHandler)
	return l, func() {
		l.mu.Lock()
		l.stopped = true
		l.mu.Unlock()
		cancel()
		client.RemoveEventHandler(id)
		l.wg.Wait()
	}
}

func (l *WhatsAppListener) eventHandler(evt interface{}) bool {
	v, ok := evt.(*events.Message)
	if !ok || v.Info.IsFromMe || v.Info.IsGroup || l.client.Store.ID == nil {
		return true
	}
	l.mu.Lock()
	if l.stopped {
		l.mu.Unlock()
		return false
	}
	l.wg.Add(1)
	l.mu.Unlock()
	defer l.wg.Done()
	message := v.Message
	content := message.GetConversation()
	if content == "" {
		content = message.GetExtendedTextMessage().GetText()
	}
	option := message.GetButtonsResponseMessage().GetSelectedButtonID()
	if option == "" {
		option = message.GetListResponseMessage().GetSingleSelectReply().GetSelectedRowID()
	}
	if interactive := message.GetInteractiveResponseMessage().GetNativeFlowResponseMessage(); interactive != nil {
		var selected struct {
			ID string `json:"id"`
		}
		if json.Unmarshal([]byte(interactive.GetParamsJSON()), &selected) == nil {
			option = selected.ID
		}
	}
	if content == "" {
		content = option
	}
	if content == "" {
		content = "[Mídia Recebida]"
	}
	e := domain.FlowIncoming{ID: string(v.Info.ID), ConnectionID: l.client.Store.ID.String(), ChatID: v.Info.Chat.String(), Phone: v.Info.Sender.String(), Text: content, OptionID: option, Timestamp: v.Info.Timestamp}
	// Persist before returning; no lossy in-memory queue between the protocol
	// event and the durable inbox. The runtime worker performs network effects.
	if err := l.chatUC.HandleIncomingMessage(l.ctx, e); err != nil {
		slog.Error("persistir evento WhatsApp", "message_id", e.ID, "err", err)
		return false
	}
	return true
}
