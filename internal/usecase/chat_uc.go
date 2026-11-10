package usecase

import (
	"context"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type chatUseCase struct {
	msgRepo   domain.MessageRepository
	contactUC domain.ContactUseCase
	kanbanUC  domain.KanbanUseCase
	autoRepUC AutoReplyUseCase
	waGateway domain.WhatsAppGateway // Comunica direto com whatsmeow ou Cloud API
}

func NewChatUseCase(
	mr domain.MessageRepository,
	cuc domain.ContactUseCase,
	kuc domain.KanbanUseCase,
	arc AutoReplyUseCase,
	wa domain.WhatsAppGateway,
) domain.ChatUseCase {
	return &chatUseCase{
		msgRepo:   mr,
		contactUC: cuc,
		kanbanUC:  kuc,
		autoRepUC: arc,
		waGateway: wa,
	}
}

// HandleIncomingMessage é chamado pelo Bridge/Listener quando o WhatsMeow recebe uma msg
func (uc *chatUseCase) HandleIncomingMessage(ctx context.Context, phone, content, msgType string, timestamp time.Time) error {
	// 1. Garante que o Contato existe no banco
	contact, err := uc.contactUC.CreateOrUpdate(ctx, phone, "Cliente "+phone, "")
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
		Type:      msgType,
		IsFromMe:  false,
		Timestamp: timestamp,
	}
	if err := uc.msgRepo.Create(ctx, msg); err != nil {
		return err
	}

	// 4. (Opcional) Publicar via SSE para o Front-end React atualizar a tela
	// eventBroker.Publish(contact.ID, msg)

	// 5. Avalia auto-resposta (fora de hora, saudação, menu)
	return uc.autoRepUC.ProcessWelcomeMessage(ctx, contact)
}

// SendMessage é chamado pelo React (via HTTP) quando o Atendente responde
func (uc *chatUseCase) SendMessage(ctx context.Context, contactID, senderUserID, content string) (*domain.Message, error) {
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
	contact, err := uc.contactUC.GetByPhone(ctx, contactID) // Adapte conforme seu repo
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
	return msg, err
}

func (uc *chatUseCase) ListChat(ctx context.Context, contactID string, limit, offset int) ([]domain.Message, error) {
	return uc.msgRepo.ListByContactID(ctx, contactID, limit, offset)
}
