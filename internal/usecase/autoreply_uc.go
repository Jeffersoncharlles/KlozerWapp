package usecase

import (
	"context"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

// Interface ajustada
type AutoReplyUseCase interface {
	ProcessWelcomeMessage(ctx context.Context, contact *domain.Contact) error
}

type autoReplyUseCase struct {
	waGateway domain.WhatsAppGateway
	msgRepo   domain.MessageRepository
}

func NewAutoReplyUseCase(wa domain.WhatsAppGateway, msgRepo domain.MessageRepository) AutoReplyUseCase {
	return &autoReplyUseCase{
		waGateway: wa,
		msgRepo:   msgRepo,
	}
}

func (uc *autoReplyUseCase) ProcessWelcomeMessage(ctx context.Context, contact *domain.Contact) error {
	// 1. REGRA DO INTERVALO (Anti-Spam de Boas-vindas):
	// Busca a última mensagem enviada por nós (Atendente ou Bot) para esse contato
	lastMsgs, err := uc.msgRepo.ListByContactID(ctx, contact.ID, 1, 0)

	if err == nil && len(lastMsgs) > 0 {
		lastMsg := lastMsgs[0]
		hoursSinceLastMsg := time.Since(lastMsg.Timestamp).Hours()

		// Se conversamos com ele nas últimas 24 horas, NÃO manda menu de novo.
		// O fluxo segue normal para o atendente ler.
		if hoursSinceLastMsg < 24 {
			return nil
		}
	}

	// 2. REGRA DE HORÁRIO DE ATENDIMENTO:
	// No futuro, você pode buscar isso de um 'SettingsRepository'
	now := time.Now()
	// Exemplo: Sabado (6) e Domingo (0) ou fora das 8h às 18h
	isWeekend := now.Weekday() == time.Saturday || now.Weekday() == time.Sunday
	isOutOfHours := now.Hour() < 8 || now.Hour() >= 18

	if isWeekend || isOutOfHours {
		msgForaDeHora := "Olá! Nosso horário de atendimento é de segunda a sexta, das 8h às 18h. Deixe sua dúvida e retornaremos no próximo dia útil."
		return uc.waGateway.SendMessage(ctx, contact.Phone, msgForaDeHora)
	}

	// 3. REGRA DE BOAS-VINDAS (Dentro do horário e após 24h sem falar):
	msgBoasVindas := "Olá! Seja bem-vindo. Como podemos te ajudar hoje?\n1 - Comercial\n2 - Suporte"
	return uc.waGateway.SendMessage(ctx, contact.Phone, msgBoasVindas)
}
