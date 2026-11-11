package usecase

import (
	"context"
	"errors"
	"log/slog"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type campaignUseCase struct {
	campaignRepo domain.CampaignRepository
	waGateway    domain.WhatsAppGateway
}

func NewCampaignUseCase(campaignRepo domain.CampaignRepository, wa domain.WhatsAppGateway) domain.CampaignUseCase {
	return &campaignUseCase{
		campaignRepo: campaignRepo,
		waGateway:    wa,
	}
}

func (uc *campaignUseCase) CreateCampaign(ctx context.Context, name, message string, scheduledAt time.Time) (*domain.Campaign, error) {
	if name == "" || message == "" {
		return nil, errors.New("nome e mensagem são obrigatórios")
	}

	campaign := &domain.Campaign{
		Name:        name,
		Message:     message,
		Status:      "PENDING",
		ScheduledAt: scheduledAt,
	}

	err := uc.campaignRepo.Create(ctx, campaign)
	return campaign, err
}

func (uc *campaignUseCase) ListCampaigns(ctx context.Context) ([]domain.Campaign, error) {
	return uc.campaignRepo.List(ctx)
}

func (uc *campaignUseCase) ExecuteCampaign(ctx context.Context, id string) error {
	uc.campaignRepo.UpdateStatus(ctx, id, "RUNNING")
	slog.Info("Campanha iniciada (Simulação)", "campaign_id", id)
	uc.campaignRepo.UpdateStatus(ctx, id, "COMPLETED")
	return nil
}
