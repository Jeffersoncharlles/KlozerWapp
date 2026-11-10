package usecase

import (
	"context"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

// Interface que deve existir no domain
type AutoReplyUseCase interface {
	ProcessWelcomeMessage(ctx context.Context, contact *domain.Contact) error
}

type autoReplyUseCase struct {
	waGateway domain.WhatsAppGateway
}

func NewAutoReplyUseCase(wa domain.WhatsAppGateway) AutoReplyUseCase {
	return &autoReplyUseCase{waGateway: wa}
}

func (uc *autoReplyUseCase) ProcessWelcomeMessage(ctx context.Context, contact *domain.Contact) error {
	// REGRA 1: É fim de semana ou fora do horário comercial (simulado)?
	now := time.Now()
	if now.Hour() < 8 || now.Hour() >= 18 {
		msg := "Olá! Nosso horário de atendimento é de seg a sex, das 8h às 18h. Deixe sua dúvida e responderemos amanhã."
		return uc.waGateway.SendMessage(ctx, contact.Phone, msg)
	}

	// REGRA 2: (No futuro) Verificar no repositório de mensagens se é a primeira interação em 24h
	// Se for, manda menu inicial:
	msg := "Olá! Seja bem-vindo. Como podemos te ajudar hoje?\n1 - Comercial\n2 - Suporte"
	return uc.waGateway.SendMessage(ctx, contact.Phone, msg)
}
