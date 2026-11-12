package usecase

import (
	"context"
	"errors"
	"sort"
	"strings"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type chatUseCase struct {
	msgRepo   domain.MessageRepository
	contactUC domain.ContactUseCase
	kanbanUC  domain.KanbanUseCase
	autoRepUC AutoReplyUseCase
	waGateway domain.WhatsAppGateway // Comunica direto com whatsmeow ou Cloud API
	flowUC    domain.FlowRuntimeUseCase
	broker    domain.Broker // <-- ADICIONADO: Para o React atualizar em tempo real
}

func NewChatUseCase(
	mr domain.MessageRepository,
	cuc domain.ContactUseCase,
	kuc domain.KanbanUseCase,
	arc AutoReplyUseCase,
	fuc domain.FlowRuntimeUseCase,
	brk domain.Broker,
	wa domain.WhatsAppGateway,
) domain.ChatUseCase {
	return &chatUseCase{
		msgRepo:   mr,
		contactUC: cuc,
		kanbanUC:  kuc,
		autoRepUC: arc,
		flowUC:    fuc,
		broker:    brk,
		waGateway: wa,
	}
}

// HandleIncomingMessage é chamado pelo Bridge/Listener quando o WhatsMeow recebe uma msg
func (uc *chatUseCase) HandleIncomingMessage(ctx context.Context, event domain.FlowIncoming) error {
	phone, content := event.Phone, event.Text
	// 1. Garante que o Contato existe no banco
	contact, err := uc.contactUC.CreateOrUpdate(ctx, phone, normalizeWhatsAppPhone(phone), "")
	if err != nil {
		return err
	}

	// 2. Garante que o Contato tem um Card no Kanban
	_, err = uc.kanbanUC.EnsureContactHasCard(ctx, contact.ID)
	if err != nil {
		return err
	}

	// 3. Salva a mensagem recebida no banco
	msg := &domain.Message{
		ContactID: contact.ID,
		Content:   content,
		Type:      "text",
		IsFromMe:  false,
		Timestamp: event.Timestamp,
	}
	key := IncomingKey(event)
	msg.ExternalID = &key
	if err := uc.msgRepo.Create(ctx, msg); err != nil {
		return err
	}

	// 4. Publicar via SSE para o Front-end React atualizar a tela IMEDIATAMENTE
	// Assumindo que seu broker tenha um método Publish
	_ = uc.broker.Publish("chat_"+contact.ID, msg)

	// 5. Tenta processar pelo Flow Builder (Chatbot) primeiro
	// Se a mensagem for "Menu", por exemplo, o bot assume.
	return uc.flowUC.Receive(ctx, event)
}

// SendMessage é chamado pelo React (via HTTP) quando o Atendente responde
func (uc *chatUseCase) SendMessage(ctx context.Context, contactID, senderUserID, content string) (*domain.Message, error) {
	content = strings.TrimSpace(content)
	if contactID == "" {
		return nil, errors.New("contato é obrigatório")
	}
	if content == "" {
		return nil, errors.New("mensagem não pode ser vazia")
	}
	// 1. Salva a mensagem no banco do CRM como enviada por um Atendente
	msg := &domain.Message{
		ContactID: contactID,
		SenderID:  &senderUserID,
		Content:   content,
		Type:      "text",
		IsFromMe:  true,
		Timestamp: time.Now(),
	}
	if err := uc.msgRepo.Create(ctx, msg); err != nil {
		return nil, err
	}

	// 2. Busca o telefone real do contato
	contact, err := uc.contactUC.GetByID(ctx, contactID)
	if err != nil {
		return nil, err
	}

	// 3. Opcional: Adiciona a assinatura do atendente no topo se quiser
	// content = fmt.Sprintf("*Atendente:*\n%s", content)

	// 4. Dispara a mensagem de fato para o celular via WhatsMeow
	// Simula que está digitando antes de mandar
	uc.waGateway.SendPresence(ctx, contact.Phone, true)
	time.Sleep(1 * time.Second) // Delay de humanização

	err = uc.waGateway.SendMessage(ctx, contact.Phone, content)

	// Notifica o frontend que a mensagem do atendente foi enviada com sucesso
	_ = uc.broker.Publish("chat_"+contact.ID, msg)

	return msg, err
}

func (uc *chatUseCase) ListChat(ctx context.Context, contactID string, limit, offset int) ([]domain.Message, error) {
	return uc.msgRepo.ListByContactID(ctx, contactID, limit, offset)
}

func (uc *chatUseCase) ListConversations(ctx context.Context) ([]domain.ConversationSummary, error) {
	contacts, err := uc.contactUC.List(ctx)
	if err != nil {
		return nil, err
	}
	board, err := uc.kanbanUC.ListBoard(ctx)
	if err != nil {
		return nil, err
	}
	cardsByContact := make(map[string]*domain.KanbanCard)
	for _, column := range board {
		for i := range column.Cards {
			card := column.Cards[i]
			cardsByContact[card.ContactID] = &card
		}
	}
	conversations := make([]domain.ConversationSummary, 0, len(contacts))
	for _, contact := range contacts {
		lastMessage, err := uc.msgRepo.LatestByContactID(ctx, contact.ID)
		if err != nil {
			return nil, err
		}
		conversations = append(conversations, domain.ConversationSummary{Contact: contact, LastMessage: lastMessage, Card: cardsByContact[contact.ID]})
	}
	sort.SliceStable(conversations, func(i, j int) bool {
		left, right := conversations[i].LastMessage, conversations[j].LastMessage
		if left == nil {
			return false
		}
		if right == nil {
			return true
		}
		return left.Timestamp.After(right.Timestamp)
	})
	return conversations, nil
}
