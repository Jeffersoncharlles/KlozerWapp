package usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

var (
	ErrFlowConfigurationNotFound  = errors.New("automação não encontrada ou não publicada")
	ErrFlowConfigurationInactive  = errors.New("a automação precisa estar ativa antes do vínculo")
	ErrQueueConfigurationNotFound = errors.New("fila não encontrada")
	ErrQueueConfigurationInactive = errors.New("a fila precisa estar ativa antes do vínculo")
)

type whatsappConfigurationUseCase struct {
	configRepo domain.WhatsAppConfigurationRepository
	flows      domain.FlowRepository
	queues     domain.QueueRepository
}

func NewWhatsAppConfigurationUseCase(
	configRepo domain.WhatsAppConfigurationRepository,
	flows domain.FlowRepository,
	queues domain.QueueRepository,
) domain.WhatsAppConfigurationUseCase {
	return &whatsappConfigurationUseCase{configRepo: configRepo, flows: flows, queues: queues}
}

func (uc *whatsappConfigurationUseCase) Get(ctx context.Context) (*domain.WhatsAppConfiguration, error) {
	configuration, err := uc.configRepo.Get(ctx)
	if err != nil {
		return nil, err
	}
	return configuration, nil
}

func (uc *whatsappConfigurationUseCase) Update(ctx context.Context, configuration domain.WhatsAppConfiguration) (*domain.WhatsAppConfiguration, error) {
	configuration.FlowID = strings.TrimSpace(configuration.FlowID)
	configuration.QueueID = strings.TrimSpace(configuration.QueueID)
	if configuration.BusinessHours.Timezone == "" {
		configuration.BusinessHours.Timezone = "UTC"
	}
	if configuration.BusinessHours.Enabled {
		configuration.BusinessHoursEnabled = true
	}
	if configuration.BusinessHoursEnabled {
		configuration.BusinessHours.Enabled = true
	}
	if _, err := time.LoadLocation(configuration.BusinessHours.Timezone); err != nil {
		return nil, errors.New("timezone inválido")
	}

	if configuration.FlowID != "" {
		flow, err := uc.flows.GetByID(ctx, configuration.FlowID)
		if err != nil {
			return nil, ErrFlowConfigurationNotFound
		}
		if flow.PublishedRevision == 0 {
			return nil, ErrFlowConfigurationNotFound
		}
		if !flow.Enabled {
			return nil, ErrFlowConfigurationInactive
		}
	}

	if configuration.QueueID != "" {
		queue, err := uc.queues.GetByID(ctx, configuration.QueueID)
		if err != nil {
			return nil, ErrQueueConfigurationNotFound
		}
		if !queue.IsActive {
			return nil, ErrQueueConfigurationInactive
		}
	}

	if err := uc.configRepo.Save(ctx, &configuration); err != nil {
		return nil, err
	}
	return &configuration, nil
}
