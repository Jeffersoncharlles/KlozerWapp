package sqlite

import (
	"context"
	"uuid"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
)

type campaignRepository struct {
	provider repository.GormProvider
}

func NewCampaignRepository(provider repository.GormProvider) domain.CampaignRepository {
	return &campaignRepository{provider: provider}
}

func (r *campaignRepository) Create(ctx context.Context, campaign *domain.Campaign) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	if campaign.ID == "" {
		campaign.ID = uuid.New().String()
	}
	return db.Create(campaign).Error
}

func (r *campaignRepository) List(ctx context.Context) ([]domain.Campaign, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var campaigns []domain.Campaign
	err = db.Order("scheduled_at DESC").Find(&campaigns).Error
	return campaigns, err
}

func (r *campaignRepository) UpdateStatus(ctx context.Context, id, status string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Model(&domain.Campaign{}).Where("id = ?", id).Update("status", status).Error
}
