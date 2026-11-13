package usecase

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

var ErrInvalidSchedule = errors.New("agenda inválida")

type scheduleUseCase struct {
	repo domain.ScheduleRepository
}

func NewScheduleUseCase(repo domain.ScheduleRepository) domain.ScheduleUseCase {
	return &scheduleUseCase{repo: repo}
}

func (uc *scheduleUseCase) Get(ctx context.Context) (*domain.Schedule, error) {
	schedule, err := uc.repo.Get(ctx)
	if err != nil {
		return nil, err
	}
	normalizeSchedule(schedule)
	return schedule, nil
}

func (uc *scheduleUseCase) Update(ctx context.Context, schedule domain.Schedule) (*domain.Schedule, error) {
	schedule.Timezone = strings.TrimSpace(schedule.Timezone)
	schedule.WelcomeMessage = strings.TrimSpace(schedule.WelcomeMessage)
	schedule.ClosedMessage = strings.TrimSpace(schedule.ClosedMessage)
	normalizeSchedule(&schedule)
	if err := schedule.Validate(); err != nil {
		return nil, errors.Join(ErrInvalidSchedule, err)
	}
	if err := uc.repo.Save(ctx, &schedule); err != nil {
		return nil, err
	}
	return &schedule, nil
}

func normalizeSchedule(schedule *domain.Schedule) {
	if schedule.Days == nil {
		schedule.Days = []time.Weekday{}
	}
	if schedule.Intervals == nil {
		schedule.Intervals = []domain.ScheduleInterval{}
	}
}
