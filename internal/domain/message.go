package domain

import (
	"context"
	"time"
	"uuid"

	"gorm.io/gorm"
)

type Message struct {
	ID         string    `json:"id" gorm:"type:text;primaryKey"`
	ContactID  string    `json:"contact_id" gorm:"index;not null"`
	SenderID   *string   `json:"sender_id" gorm:"index"` // Null se foi o lead que enviou, ID do User se foi o atendente
	Content    string    `json:"content" gorm:"type:text;not null"`
	Type       string    `json:"type" gorm:"default:'text'"` // text, image, audio, document
	IsFromMe   bool      `json:"is_from_me" gorm:"not null"`
	Timestamp  time.Time `json:"timestamp" gorm:"not null"`
	CreatedAt  time.Time `json:"created_at" gorm:"autoCreateTime"`
	ExternalID *string   `json:"-" gorm:"uniqueIndex"`
}

type ConversationSummary struct {
	Contact     Contact     `json:"contact"`
	LastMessage *Message    `json:"last_message,omitempty"`
	Card        *KanbanCard `json:"card,omitempty"`
}

func (m *Message) BeforeCreate(tx *gorm.DB) error {
	if m.ID == "" {
		m.ID = uuid.New().String()
	}
	return nil
}

type MessageRepository interface {
	Create(ctx context.Context, msg *Message) error
	ListByContactID(ctx context.Context, contactID string, limit, offset int) ([]Message, error)
	LatestByContactID(ctx context.Context, contactID string) (*Message, error)
}

type ChatUseCase interface {
	// Chamado pelo Frontend/Atendente
	SendMessage(ctx context.Context, contactID, senderUserID, content string) (*Message, error)
	// Chamado pelo Bridge/Listener do WhatsApp
	HandleIncomingMessage(ctx context.Context, event FlowIncoming) error
	ListChat(ctx context.Context, contactID string, limit, offset int) ([]Message, error)
	ListConversations(ctx context.Context) ([]ConversationSummary, error)
}
