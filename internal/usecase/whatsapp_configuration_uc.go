package usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

var (
	ErrInvalidWhatsAppConfiguration = errors.New("configuração do WhatsApp inválida")
	ErrFlowConfigurationNotFound    = errors.New("automação não encontrada ou não publicada")
	ErrFlowConfigurationInactive    = errors.New("a automação precisa estar ativa antes do vínculo")
	ErrQueueConfigurationNotFound   = errors.New("fila não encontrada")
	ErrQueueConfigurationInactive   = errors.New("a fila precisa estar ativa antes do vínculo")
)

type whatsappConfigurationUseCase struct {
	configRepo domain.WhatsAppConfigurationRepository
	schedules  domain.ScheduleRepository
	flows      domain.FlowRepository
	queues     domain.QueueRepository
}

type publishedFlowRepository interface {
	GetPublished(context.Context, string) (*domain.Flow, error)
}

func NewWhatsAppConfigurationUseCase(
	configRepo domain.WhatsAppConfigurationRepository,
	flows domain.FlowRepository,
	queues domain.QueueRepository,
) domain.WhatsAppConfigurationUseCase {
	return newWhatsAppConfigurationUseCase(configRepo, nil, flows, queues)
}

func NewWhatsAppConfigurationUseCaseWithSchedule(
	configRepo domain.WhatsAppConfigurationRepository,
	schedules domain.ScheduleRepository,
	flows domain.FlowRepository,
	queues domain.QueueRepository,
) domain.WhatsAppConfigurationUseCase {
	return newWhatsAppConfigurationUseCase(configRepo, schedules, flows, queues)
}

func newWhatsAppConfigurationUseCase(
	configRepo domain.WhatsAppConfigurationRepository,
	schedules domain.ScheduleRepository,
	flows domain.FlowRepository,
	queues domain.QueueRepository,
) domain.WhatsAppConfigurationUseCase {
	return &whatsappConfigurationUseCase{configRepo: configRepo, schedules: schedules, flows: flows, queues: queues}
}

func (uc *whatsappConfigurationUseCase) Get(ctx context.Context) (*domain.WhatsAppConfiguration, error) {
	configuration, err := uc.configRepo.Get(ctx)
	if err != nil {
		return nil, err
	}
	if uc.schedules == nil {
		return configuration, nil
	}
	schedule, err := uc.schedules.Get(ctx)
	if err != nil {
		return nil, err
	}
	if schedule.Timezone == "" && configuration.BusinessHours.Timezone != "" {
		schedule = scheduleFromBusinessHours(configuration.BusinessHours)
		if err := uc.schedules.Save(ctx, schedule); err != nil {
			return nil, err
		}
	}
	configuration.BusinessHours = businessHoursFromSchedule(*schedule)
	configuration.BusinessHoursEnabled = schedule.Enabled
	return configuration, nil
}

func (uc *whatsappConfigurationUseCase) Update(ctx context.Context, configuration domain.WhatsAppConfiguration) (*domain.WhatsAppConfiguration, error) {
	configuration.FlowID = strings.TrimSpace(configuration.FlowID)
	configuration.QueueID = strings.TrimSpace(configuration.QueueID)

	var schedule *domain.Schedule
	if uc.schedules != nil {
		var err error
		schedule, err = uc.schedules.Get(ctx)
		if err != nil {
			return nil, err
		}
		if configuration.BusinessHours.Timezone != "" || len(configuration.BusinessHours.Days) > 0 || len(configuration.BusinessHours.Intervals) > 0 {
			schedule = scheduleFromBusinessHours(configuration.BusinessHours)
		}
		schedule.Enabled = configuration.BusinessHoursEnabled
		if configuration.FlowID != "" {
			schedule.AutoReplyEnabled = true
			schedule.ManualWelcomeEnabled = false
		}
		if err := normalizeAndValidateSchedule(schedule); err != nil {
			return nil, errors.Join(ErrInvalidWhatsAppConfiguration, err)
		}
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
		published := flow
		if publishedRepo, ok := uc.flows.(publishedFlowRepository); ok {
			published, err = publishedRepo.GetPublished(ctx, configuration.FlowID)
			if err != nil {
				return nil, ErrFlowConfigurationNotFound
			}
		}
		if !hasWelcomeNode(published) {
			return nil, ErrFlowConfigurationWelcome
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

	if schedule != nil {
		configuration.BusinessHours = businessHoursFromSchedule(*schedule)
		configuration.BusinessHoursEnabled = schedule.Enabled
		if err := uc.schedules.Save(ctx, schedule); err != nil {
			return nil, err
		}
	}
	if err := uc.configRepo.Save(ctx, &configuration); err != nil {
		return nil, err
	}
	return &configuration, nil
}

var ErrFlowConfigurationWelcome = errors.New("a automação precisa começar com uma mensagem de boas-vindas")

func hasWelcomeNode(flow *domain.Flow) bool {
	for _, node := range flow.Graph.Nodes {
		if node.ID == flow.Graph.StartNodeID {
			return node.Type == "message" && strings.TrimSpace(node.Data.Message) != ""
		}
	}
	return false
}

func normalizeAndValidateSchedule(schedule *domain.Schedule) error {
	configuredData := schedule.Timezone != "" || schedule.AllDay || len(schedule.Days) > 0 || len(schedule.Intervals) > 0 || schedule.WelcomeMessage != "" || schedule.ManualWelcomeMessage != "" || schedule.ClosedMessage != "" || schedule.OutsideHoursPolicy != ""
	if schedule.Timezone == "" {
		schedule.Timezone = "UTC"
	}
	schedule.WelcomeMessage = strings.TrimSpace(schedule.WelcomeMessage)
	schedule.ManualWelcomeMessage = strings.TrimSpace(schedule.ManualWelcomeMessage)
	if schedule.ManualWelcomeMessage == "" {
		schedule.ManualWelcomeMessage = schedule.WelcomeMessage
	}
	if schedule.WelcomeMessage == "" {
		schedule.WelcomeMessage = schedule.ManualWelcomeMessage
	}
	if schedule.OutsideHoursPolicy == "" {
		schedule.OutsideHoursPolicy = "send_and_close"
	}
	if schedule.Days == nil {
		schedule.Days = []time.Weekday{}
	}
	if schedule.Intervals == nil {
		schedule.Intervals = []domain.ScheduleInterval{}
	}
	if schedule.Exceptions == nil {
		schedule.Exceptions = []domain.ScheduleException{}
	}
	if !configuredData {
		return nil
	}
	return schedule.Validate()
}

func scheduleFromBusinessHours(hours domain.BusinessHours) *domain.Schedule {
	intervals := make([]domain.ScheduleInterval, 0, len(hours.Intervals))
	for _, interval := range hours.Intervals {
		intervals = append(intervals, domain.ScheduleInterval{Start: interval.Start, End: interval.End})
	}
	return &domain.Schedule{
		Enabled:              hours.Enabled,
		Timezone:             hours.Timezone,
		Days:                 hours.Days,
		Intervals:            intervals,
		AllDay:               hours.AllDay,
		AutoReplyEnabled:     true,
		ManualWelcomeEnabled: true,
		ClosedMessage:        hours.ManualMessage,
		OutsideHoursPolicy:   "send_and_close",
	}
}

func businessHoursFromSchedule(schedule domain.Schedule) domain.BusinessHours {
	intervals := make([]domain.BusinessHoursInterval, 0, len(schedule.Intervals))
	for _, interval := range schedule.Intervals {
		intervals = append(intervals, domain.BusinessHoursInterval{Start: interval.Start, End: interval.End})
	}
	return domain.BusinessHours{
		Enabled:       schedule.Enabled,
		Timezone:      schedule.Timezone,
		Days:          schedule.Days,
		Intervals:     intervals,
		AllDay:        schedule.AllDay,
		ManualMessage: schedule.ClosedMessage,
	}
}
