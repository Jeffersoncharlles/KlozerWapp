package domain

import (
	"context"
	"time"
	"uuid"

	"gorm.io/gorm"
)

type User struct {
	ID           string    `json:"id" gorm:"type:text;primaryKey"`
	Name         string    `json:"name" gorm:"not null"`
	Email        string    `json:"email" gorm:"uniqueIndex;not null"`
	PasswordHash string    `json:"-" gorm:"not null"`           // "-" oculta no JSON de saída
	Role         string    `json:"role" gorm:"default:'AGENT'"` // ADMIN ou AGENT
	IsActive     bool      `json:"is_active" gorm:"default:true"`
	CreatedAt    time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id string) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	List(ctx context.Context) ([]User, error)
	CountActiveUsers(ctx context.Context) (int64, error)
}

type AuthUseCase interface {
	Authenticate(ctx context.Context, email, password string) (string, error)
}
type UserUseCase interface {
	Create(ctx context.Context, name, email, password, role string) (*User, error)
	List(ctx context.Context) ([]User, error)
}
