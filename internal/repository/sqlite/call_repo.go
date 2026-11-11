package sqlite

import (
	"context"
	"uuid"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
)

type callRepository struct {
	provider repository.GormProvider
}

func NewCallRepository(provider repository.GormProvider) domain.CallRepository {
	return &callRepository{provider: provider}
}

func (r *callRepository) LogCall(ctx context.Context, call *domain.CallRecord) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	if call.ID == "" {
		call.ID = uuid.New().String()
	}
	return db.Create(call).Error
}

func (r *callRepository) ListHistory(ctx context.Context, phone string) ([]domain.CallRecord, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var calls []domain.CallRecord
	err = db.Where("phone = ?", phone).Order("created_at DESC").Find(&calls).Error
	return calls, err
}
