package sqlite

import (
	"context"
	"encoding/json"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
	"gorm.io/gorm"
)

type whatsappConfigurationRecord struct {
	ID                   int `gorm:"primaryKey"`
	QueueID              string
	BusinessHoursEnabled bool
	BusinessHoursJSON    string
}

type whatsappConfigurationRepository struct {
	provider repository.GormProvider
}

func NewWhatsAppConfigurationRepository(provider repository.GormProvider) domain.WhatsAppConfigurationRepository {
	return &whatsappConfigurationRepository{provider: provider}
}

func (r *whatsappConfigurationRepository) Get(ctx context.Context) (*domain.WhatsAppConfiguration, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var record whatsappConfigurationRecord
	if err := db.FirstOrCreate(&record, whatsappConfigurationRecord{ID: 1}).Error; err != nil {
		return nil, err
	}
	var binding flowBinding
	if err := db.First(&binding, 1).Error; err != nil && err != gorm.ErrRecordNotFound {
		return nil, err
	}
	businessHours := decodeBusinessHours(record.BusinessHoursJSON)
	if record.BusinessHoursJSON == "" {
		businessHours.Enabled = record.BusinessHoursEnabled
	}
	return &domain.WhatsAppConfiguration{
		FlowID:               binding.FlowID,
		QueueID:              record.QueueID,
		BusinessHoursEnabled: record.BusinessHoursEnabled,
		BusinessHours:        businessHours,
	}, nil
}

func (r *whatsappConfigurationRepository) Save(ctx context.Context, configuration *domain.WhatsAppConfiguration) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Save(&whatsappConfigurationRecord{
			ID:                   1,
			QueueID:              configuration.QueueID,
			BusinessHoursEnabled: configuration.BusinessHoursEnabled,
			BusinessHoursJSON:    encodeBusinessHours(configuration.BusinessHours),
		}).Error; err != nil {
			return err
		}
		return tx.Save(&flowBinding{ID: 1, FlowID: configuration.FlowID}).Error
	})
}

func encodeBusinessHours(value domain.BusinessHours) string {
	bytes, _ := json.Marshal(value)
	return string(bytes)
}
func decodeBusinessHours(value string) domain.BusinessHours {
	var result domain.BusinessHours
	if value != "" {
		_ = json.Unmarshal([]byte(value), &result)
	}
	return result
}
