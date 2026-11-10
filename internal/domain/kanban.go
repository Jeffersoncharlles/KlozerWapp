package domain

import (
	"context"
	"time"
	"uuid"

	"gorm.io/gorm"
)

type KanbanColumn struct {
	ID        string       `json:"id" gorm:"type:text;primaryKey"`
	Name      string       `json:"name" gorm:"not null"`
	Position  int          `json:"position" gorm:"not null"`
	Cards     []KanbanCard `json:"cards,omitempty" gorm:"foreignKey:ColumnID"`
	CreatedAt time.Time    `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time    `json:"updated_at" gorm:"autoUpdateTime"`
}

func (c *KanbanColumn) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

type KanbanCard struct {
	ID               string  `json:"id" gorm:"type:text;primaryKey"`
	ContactID        string  `json:"contact_id" gorm:"index;not null"`
	ColumnID         string  `json:"column_id" gorm:"index;not null"`
	AssignedToUserID *string `json:"assigned_to_user_id" gorm:"index"` // Null = Sem atendente
	Position         int     `json:"position" gorm:"not null"`

	// Relacionamentos para facilitar o retorno do GORM
	Contact  *Contact `json:"contact,omitempty" gorm:"foreignKey:ContactID"`
	Assignee *User    `json:"assignee,omitempty" gorm:"foreignKey:AssignedToUserID"`

	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (c *KanbanCard) BeforeCreate(tx *gorm.DB) error {
	if c.ID == "" {
		c.ID = uuid.New().String()
	}
	return nil
}

type KanbanRepository interface {
	CreateColumn(ctx context.Context, col *KanbanColumn) error
	ListColumnsWithCards(ctx context.Context) ([]KanbanColumn, error)
	CreateCard(ctx context.Context, card *KanbanCard) error
	MoveCard(ctx context.Context, cardID, targetColumnID string, newPosition int) error
	GetCardByContactID(ctx context.Context, contactID string) (*KanbanCard, error)
	AssignUserToCard(ctx context.Context, cardID, userID string) error
}

type KanbanUseCase interface {
	CreateColumn(ctx context.Context, name string, position int) (*KanbanColumn, error)
	ListBoard(ctx context.Context) ([]KanbanColumn, error)
	EnsureContactHasCard(ctx context.Context, contactID string) (*KanbanCard, error)
	MoveCard(ctx context.Context, cardID, targetColumnID string, newPosition int) error
	TakeAttendance(ctx context.Context, cardID, userID string) error
}
