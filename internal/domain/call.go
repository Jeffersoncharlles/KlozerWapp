package domain

import (
	"context"
	"time"
)

type CallRecord struct {
	ID        string    `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Phone     string    `json:"phone" gorm:"not null"`
	Direction string    `json:"direction" gorm:"not null"` // INBOUND, OUTBOUND
	Status    string    `json:"status" gorm:"not null"`    // MISSED, ANSWERED, REJECTED
	Duration  int       `json:"duration"`
	CreatedAt time.Time `json:"created_at"`
}

type CallRepository interface {
	LogCall(ctx context.Context, call *CallRecord) error
	ListHistory(ctx context.Context, phone string) ([]CallRecord, error)
}

type CallUseCase interface {
	RegisterCall(ctx context.Context, phone, direction, status string, duration int) (*CallRecord, error)
	GetCallHistory(ctx context.Context, phone string) ([]CallRecord, error)
}
