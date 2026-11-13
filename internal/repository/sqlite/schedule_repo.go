package sqlite

import (
	"context"
	"encoding/json"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
)

type scheduleRecord struct {
	ID       int `gorm:"primaryKey"`
	Document string
}

type scheduleRepository struct {
	provider repository.GormProvider
}

func NewScheduleRepository(provider repository.GormProvider) domain.ScheduleRepository {
	return &scheduleRepository{provider: provider}
}

func (r *scheduleRepository) Get(ctx context.Context) (*domain.Schedule, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var record scheduleRecord
	if err := db.FirstOrCreate(&record, scheduleRecord{ID: 1}).Error; err != nil {
		return nil, err
	}
	if record.Document == "" {
		return &domain.Schedule{}, nil
	}
	var schedule domain.Schedule
	if err := json.Unmarshal([]byte(record.Document), &schedule); err != nil {
		return nil, err
	}
	return &schedule, nil
}

func (r *scheduleRepository) Save(ctx context.Context, schedule *domain.Schedule) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	document, err := json.Marshal(schedule)
	if err != nil {
		return err
	}
	return db.Save(&scheduleRecord{ID: 1, Document: string(document)}).Error
}
