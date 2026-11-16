package sqlite

import (
	"context"
	"encoding/json"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
	"gorm.io/gorm"
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
		var configuration whatsappConfigurationRecord
		if err := db.First(&configuration, 1).Error; err == nil && configuration.BusinessHoursJSON != "" {
			hours := decodeBusinessHours(configuration.BusinessHoursJSON)
			intervals := make([]domain.ScheduleInterval, 0, len(hours.Intervals))
			for _, interval := range hours.Intervals {
				intervals = append(intervals, domain.ScheduleInterval{Start: interval.Start, End: interval.End})
			}
			schedule := &domain.Schedule{Enabled: hours.Enabled, Timezone: hours.Timezone, Days: hours.Days, Intervals: intervals, AllDay: hours.AllDay, AutoReplyEnabled: true, ManualWelcomeEnabled: true, OutsideHoursPolicy: "send_and_close", ClosedMessage: hours.ManualMessage}
			if err := r.Save(ctx, schedule); err != nil {
				return nil, err
			}
			return schedule, nil
		}
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
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&scheduleRecord{ID: 1, Document: string(document)}).Error; err != nil {
			return err
		}
		return tx.Model(&whatsappConfigurationRecord{}).Where("id = ?", 1).Updates(map[string]any{
			"business_hours_enabled": schedule.Enabled,
			"business_hours_json":    encodeScheduleBusinessHours(*schedule),
		}).Error
	})
}

func encodeScheduleBusinessHours(schedule domain.Schedule) string {
	intervals := make([]domain.BusinessHoursInterval, 0, len(schedule.Intervals))
	for _, interval := range schedule.Intervals {
		intervals = append(intervals, domain.BusinessHoursInterval{Start: interval.Start, End: interval.End})
	}
	return encodeBusinessHours(domain.BusinessHours{Enabled: schedule.Enabled, Timezone: schedule.Timezone, Days: schedule.Days, Intervals: intervals, AllDay: schedule.AllDay, ManualMessage: schedule.ClosedMessage})
}
