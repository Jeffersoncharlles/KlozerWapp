package domain

import (
	"context"
	"time"
	"uuid"

	"gorm.io/gorm"
)

type Contact struct {
	ID         string     `json:"id" gorm:"type:text;primaryKey"`
	Name       string     `json:"name" gorm:"not null"`
	Phone      string     `json:"phone" gorm:"uniqueIndex;not null"` // WhatsApp JID
	AvatarURL  string     `json:"avatar_url"`
	Type       string     `json:"type" gorm:"default:'person'"`
	ArchivedAt *time.Time `json:"archived_at,omitempty"`
	Tags       []Tag      `json:"tags,omitempty" gorm:"many2many:contact_tags;"`
	CreatedAt  time.Time  `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt  time.Time  `json:"updated_at" gorm:"autoUpdateTime"`
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
	ListFiltered(ctx context.Context, filter ContactFilter) (*ContactList, error)
	Archive(ctx context.Context, id string, archived bool) error
}

type ContactFilter struct {
	Search   string
	Type     string
	Archived string
	Page     int
	Limit    int
}

type ContactList struct {
	Items  []Contact `json:"items"`
	Total  int64     `json:"total"`
	People int64     `json:"people"`
	Groups int64     `json:"groups"`
	Page   int       `json:"page"`
	Limit  int       `json:"limit"`
}

type ContactUseCase interface {
	CreateOrUpdate(ctx context.Context, phone, name, avatarURL string) (*Contact, error)
	GetByID(ctx context.Context, id string) (*Contact, error)
	GetByPhone(ctx context.Context, phone string) (*Contact, error)
	List(ctx context.Context) ([]Contact, error)
	ListFiltered(ctx context.Context, filter ContactFilter) (*ContactList, error)
	CreateManual(ctx context.Context, contact *Contact) error
	Update(ctx context.Context, contact *Contact) error
	Archive(ctx context.Context, id string, archived bool) error
}
