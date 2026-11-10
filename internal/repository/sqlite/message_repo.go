package sqlite

import (
	"context"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
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
