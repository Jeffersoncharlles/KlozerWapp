package domain

import (
	"context"
	"time"
	"uuid"

	"gorm.io/gorm"
)

type Tag struct {
	ID        string    `json:"id" gorm:"type:text;primaryKey"`
	Name      string    `json:"name" gorm:"uniqueIndex;not null"`
	Color     string    `json:"color" gorm:"default:'#000000'"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (t *Tag) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}

type TagRepository interface {
	Create(ctx context.Context, tag *Tag) error
	List(ctx context.Context) ([]Tag, error)
	Delete(ctx context.Context, id string) error
	AssignToContact(ctx context.Context, tagID, contactID string) error
	RemoveFromContact(ctx context.Context, tagID, contactID string) error
	GetByID(ctx context.Context, id string) (*Tag, error)
	AttachToContact(ctx context.Context, contactID string, tagID string) error
}

type TagUseCase interface {
	Create(ctx context.Context, name, color string) (*Tag, error)
	List(ctx context.Context) ([]Tag, error)
	Delete(ctx context.Context, id string) error
	ToggleContactTag(ctx context.Context, tagID, contactID string) error
}
