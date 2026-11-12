package sqlite

import (
	"context"
	"errors"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type messageRepo struct {
	provider repository.GormProvider
}

func NewMessageRepository(p repository.GormProvider) domain.MessageRepository {
	return &messageRepo{provider: p}
}

func (r *messageRepo) Create(ctx context.Context, msg *domain.Message) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	if msg.ExternalID != nil {
		result := db.Clauses(clause.OnConflict{Columns: []clause.Column{{Name: "external_id"}}, DoNothing: true}).Create(msg)
		if result.Error != nil {
			return result.Error
		}
		if result.RowsAffected == 0 {
			var existing domain.Message
			if err := db.First(&existing, "external_id=?", *msg.ExternalID).Error; err != nil {
				return err
			}
			*msg = existing
		}
		return nil
	}
	return db.Create(msg).Error
}

func (r *messageRepo) ListByContactID(ctx context.Context, contactID string, limit, offset int) ([]domain.Message, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var messages []domain.Message
	err = db.Where("contact_id = ?", contactID).
		Order("timestamp DESC").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error
	if err != nil {
		return nil, err
	}

	return messages, nil
}

func (r *messageRepo) LatestByContactID(ctx context.Context, contactID string) (*domain.Message, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var message domain.Message
	if err := db.Where("contact_id = ?", contactID).Order("timestamp DESC, created_at DESC").First(&message).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &message, nil
}
