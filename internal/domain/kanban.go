package domain

import (
	"context"
	"errors"
	"time"
	"uuid"

	"gorm.io/gorm"
)

type KanbanColumn struct {
	ID        string       `json:"id" gorm:"type:text;primaryKey"`
	Name      string       `json:"name" gorm:"not null"`
	Position  int          `json:"position" gorm:"not null"`
	Cards     []KanbanCard `json:"cards,omitempty" gorm:"foreignKey:ColumnID"`
	Color     string       `json:"color" gorm:"not null;default:'#3B82F6'"` // Cor padrão azul
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
	ID               string     `json:"id" gorm:"type:text;primaryKey"`
	ContactID        string     `json:"contact_id" gorm:"index;not null"`
	ColumnID         string     `json:"column_id" gorm:"index;not null"`
	AssignedToUserID *string    `json:"assigned_to_user_id" gorm:"index"` // Null = Sem atendente
	QueueID          *string    `json:"queue_id" gorm:"index"`
	AssignmentOrigin string     `json:"assignment_origin" gorm:"not null;default:'manual'"`
	Position         int        `json:"position" gorm:"not null"`
	IsActive         bool       `json:"is_active" gorm:"not null;default:true;index:idx_kanban_cards_active_column"`
	FinishedAt       *time.Time `json:"finished_at,omitempty"`
	FinishedByUserID *string    `json:"finished_by_user_id,omitempty" gorm:"index"`

	// Relacionamentos para facilitar o retorno do GORM
	Contact  *Contact `json:"contact,omitempty" gorm:"foreignKey:ContactID"`
	Assignee *User    `json:"assignee,omitempty" gorm:"foreignKey:AssignedToUserID"`

	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

var (
	ErrCardNotFound   = errors.New("card não encontrado")
	ErrColumnNotFound = errors.New("coluna não encontrada")
	ErrForbidden      = errors.New("operação não permitida para este usuário")
	ErrCardFinished   = errors.New("card finalizado")
	ErrInvalidActor   = errors.New("usuário autenticado inválido")
)

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
	MoveCardAs(ctx context.Context, cardID, targetColumnID string, newPosition int, actorID, actorRole string) (*KanbanCard, error)
	GetCardByContactID(ctx context.Context, contactID string) (*KanbanCard, error)
	GetCardByID(ctx context.Context, cardID string) (*KanbanCard, error)
	AssignUserToCard(ctx context.Context, cardID, userID string) error
	AssignQueueToCard(ctx context.Context, cardID, queueID, origin string) error
	GetFirstColumn(ctx context.Context) (*KanbanColumn, error)
	GetColumnByID(ctx context.Context, id string) (*KanbanColumn, error)
	TakeAttendance(ctx context.Context, cardID, actorID, actorRole string) (*KanbanCard, error)
	FinishAttendance(ctx context.Context, cardID, actorID, actorRole string) (*KanbanCard, error)
	ListAttendanceEvents(ctx context.Context, cardID string, limit, offset int) ([]AttendanceEvent, error)
}

type KanbanUseCase interface {
	CreateColumn(ctx context.Context, name string, position int) (*KanbanColumn, error)
	ListBoard(ctx context.Context) ([]KanbanColumn, error)
	EnsureContactHasCard(ctx context.Context, contactID string) (*KanbanCard, error)
	MoveCard(ctx context.Context, cardID, targetColumnID string, newPosition int) error
	MoveCardAs(ctx context.Context, cardID, targetColumnID string, newPosition int, actorID, actorRole string) (*KanbanCard, error)
	TakeAttendance(ctx context.Context, cardID, userID string) error
	Take(ctx context.Context, cardID, actorID, actorRole string) (*KanbanCard, error)
	Finish(ctx context.Context, cardID, actorID, actorRole string) (*KanbanCard, error)
	ListEvents(ctx context.Context, cardID string, limit, offset int) ([]AttendanceEvent, error)
	AssignQueue(ctx context.Context, cardID, queueID, origin string) error
}

type AttendanceEvent struct {
	ID           string    `json:"id" gorm:"type:text;primaryKey"`
	CardID       string    `json:"card_id" gorm:"index;not null"`
	ContactID    string    `json:"contact_id" gorm:"index;not null"`
	ActorUserID  *string   `json:"actor_user_id,omitempty" gorm:"index"`
	Type         string    `json:"type" gorm:"not null;index"`
	FromColumnID *string   `json:"from_column_id,omitempty"`
	ToColumnID   *string   `json:"to_column_id,omitempty"`
	Metadata     string    `json:"metadata,omitempty" gorm:"type:text"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime;index"`
	Actor        *User     `json:"actor,omitempty" gorm:"foreignKey:ActorUserID"`
}

func (e *AttendanceEvent) BeforeCreate(tx *gorm.DB) error {
	if e.ID == "" {
		e.ID = uuid.New().String()
	}
	return nil
}
