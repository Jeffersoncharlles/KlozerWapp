package domain

import (
	"context"
	"time"
)

// Queue representa uma fila de atendimento (ex: Suporte, Vendas)
type Queue struct {
	ID          string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Name        string    `json:"name" gorm:"not null;unique"`
	Description string    `json:"description"`
	Color       string    `json:"color" gorm:"default:#3B82F6"`
	IsActive    bool      `json:"is_active" gorm:"default:true"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// QueueRepository define o contrato de persistência para as filas
type QueueRepository interface {
	Create(ctx context.Context, queue *Queue) error
	GetByID(ctx context.Context, id string) (*Queue, error)
	List(ctx context.Context) ([]Queue, error)
	Update(ctx context.Context, queue *Queue) error
	Delete(ctx context.Context, id string) error
}

// QueueUseCase define as regras de negócio das filas
type QueueUseCase interface {
	CreateQueue(ctx context.Context, name, description, color string) (*Queue, error)
	ListQueues(ctx context.Context) ([]Queue, error)
	GetQueue(ctx context.Context, id string) (*Queue, error)
	UpdateQueue(ctx context.Context, id, name, description, color string, isActive bool) (*Queue, error)
	DeleteQueue(ctx context.Context, id string) error
}
