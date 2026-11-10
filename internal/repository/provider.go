package repository

import (
	"context"

	"gorm.io/gorm"
)

// GormProvider permite injetar diferentes bancos (SingleTenant SQLite vs MultiTenant Turso)
type GormProvider interface {
	GetDB(ctx context.Context) (*gorm.DB, error)
}
