package sqlite

import (
	"context"
	"uuid"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
)

type flowRepository struct {
	provider repository.GormProvider
}

func NewFlowRepository(provider repository.GormProvider) domain.FlowRepository {
	return &flowRepository{provider: provider}
}

func (r *flowRepository) Create(ctx context.Context, flow *domain.Flow) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	if flow.ID == "" {
		flow.ID = uuid.New().String()
	}
	return db.Create(flow).Error
}

func (r *flowRepository) GetByID(ctx context.Context, id string) (*domain.Flow, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var flow domain.Flow
	err = db.Preload("Nodes").First(&flow, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &flow, nil
}

func (r *flowRepository) GetByKeyword(ctx context.Context, keyword string) (*domain.Flow, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var flow domain.Flow
	err = db.Preload("Nodes").First(&flow, "trigger_keyword = ? AND is_active = ?", keyword, true).Error
	if err != nil {
		return nil, err
	}
	return &flow, nil
}

func (r *flowRepository) List(ctx context.Context) ([]domain.Flow, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var flows []domain.Flow
	err = db.Preload("Nodes").Find(&flows).Error
	return flows, err
}

func (r *flowRepository) Delete(ctx context.Context, id string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Delete(&domain.Flow{}, "id = ?", id).Error
}
