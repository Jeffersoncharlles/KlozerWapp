package domain

import (
	"context"
	"time"
	"uuid"

	"gorm.io/gorm"
)

type QuickReply struct {
	ID        string    `json:"id" gorm:"type:text;primaryKey"`
	Shortcut  string    `json:"shortcut" gorm:"uniqueIndex;not null"`
	Title     string    `json:"title" gorm:"not null"`
	Content   string    `json:"content" gorm:"not null;type:text"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (qr *QuickReply) BeforeCreate(tx *gorm.DB) error {
	if qr.ID == "" {
		qr.ID = uuid.New().String()
	}
	return nil
}

type QuickReplyRepository interface {
	Create(ctx context.Context, qr *QuickReply) error
	List(ctx context.Context) ([]QuickReply, error)
	Delete(ctx context.Context, id string) error
}

type QuickReplyUseCase interface {
	Create(ctx context.Context, shortcut, title, content string) (*QuickReply, error)
	List(ctx context.Context) ([]QuickReply, error)
	Delete(ctx context.Context, id string) error
	// ProcessContent substitui variáveis dinâmicas (ex: {{nome}}) antes de enviar
	ProcessContent(ctx context.Context, shortcut string, contact *Contact) (string, error)
}
