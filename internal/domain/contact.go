package domain

import (
	"context"
	"time"
	"uuid"

	"gorm.io/gorm"
)

type Contact struct {
	ID        string    `json:"id" gorm:"type:text;primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Phone     string    `json:"phone" gorm:"uniqueIndex;not null"` // WhatsApp JID
	AvatarURL string    `json:"avatar_url"`
	Tags      []Tag     `json:"tags,omitempty" gorm:"many2many:contact_tags;"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (c *Contact) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

type ContactRepository interface {
	Create(ctx context.Context, contact *Contact) error
	Update(ctx context.Context, contact *Contact) error
	GetByID(ctx context.Context, id string) (*Contact, error)
	GetByPhone(ctx context.Context, phone string) (*Contact, error)
	List(ctx context.Context) ([]Contact, error)
}

type ContactUseCase interface {
	CreateOrUpdate(ctx context.Context, phone, name, avatarURL string) (*Contact, error)
	GetByPhone(ctx context.Context, phone string) (*Contact, error)
	List(ctx context.Context) ([]Contact, error)
}
