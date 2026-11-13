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
	schedules domain.ScheduleRepository
}

func NewAutoReplyUseCase(wa domain.WhatsAppGateway, msgRepo domain.MessageRepository, schedules domain.ScheduleRepository) AutoReplyUseCase {
	return &autoReplyUseCase{
		waGateway: wa,
		msgRepo:   msgRepo,
		schedules: schedules,
	}
}

func (uc *autoReplyUseCase) ProcessWelcomeMessage(ctx context.Context, contact *domain.Contact) error {
	schedule, err := uc.schedules.Get(ctx)
	if err != nil {
		return err
	}
	if !schedule.Enabled || !schedule.IsConfigured() || !schedule.AutoReplyEnabled {
		return nil
	}

	// 1. REGRA DO INTERVALO (Anti-Spam de Boas-vindas):
	// Busca a última mensagem enviada por nós (Atendente ou Bot) para esse contato
	lastMsgs, err := uc.msgRepo.ListByContactID(ctx, contact.ID, 50, 0)
	if err != nil {
		return err
	}

	if err == nil && len(lastMsgs) > 0 {
		for _, lastMsg := range lastMsgs {
			if lastMsg.IsFromMe && time.Since(lastMsg.Timestamp) < 24*time.Hour {
				return nil
			}
		}
	}

	// 2. REGRA DE HORÁRIO DE ATENDIMENTO:
	if !schedule.IsOpen(time.Now()) {
		if schedule.ClosedMessage == "" {
			return nil
		}
		return uc.sendWelcome(ctx, contact, schedule.ClosedMessage)
	}

	// 3. REGRA DE BOAS-VINDAS (Dentro do horário e após 24h sem falar):
	if schedule.WelcomeMessage == "" {
		return nil
	}
	return uc.sendWelcome(ctx, contact, schedule.WelcomeMessage)
}

func (uc *autoReplyUseCase) sendWelcome(ctx context.Context, contact *domain.Contact, text string) error {
	id := "welcome:" + contact.ID + ":" + time.Now().UTC().Format("2006-01-02")
	if err := uc.waGateway.SendFlowMessage(ctx, contact.Phone, text, id); err != nil {
		return err
	}
	return uc.msgRepo.Create(ctx, &domain.Message{ContactID: contact.ID, Content: text, Type: "text", IsFromMe: true, Timestamp: time.Now().UTC(), ExternalID: &id})
}
