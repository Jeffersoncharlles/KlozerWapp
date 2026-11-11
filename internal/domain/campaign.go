package domain

import (
	"context"
	"time"
)

type Campaign struct {
	ID          string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Name        string    `json:"name" gorm:"not null"`
	Message     string    `json:"message" gorm:"type:text;not null"`
	Status      string    `json:"status" gorm:"default:'PENDING'"`
	ScheduledAt time.Time `json:"scheduled_at"`
	CreatedAt   time.Time `json:"created_at"`
}

type CampaignRepository interface {
	Create(ctx context.Context, campaign *Campaign) error
	List(ctx context.Context) ([]Campaign, error)
	UpdateStatus(ctx context.Context, id, status string) error
}

type CampaignUseCase interface {
	CreateCampaign(ctx context.Context, name, message string, scheduledAt time.Time) (*Campaign, error)
	ListCampaigns(ctx context.Context) ([]Campaign, error)
	ExecuteCampaign(ctx context.Context, id string) error
}
