package sqlite

import (
	"context"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/config"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type singleTenantProvider struct {
	db *gorm.DB
}

func NewGormProvider(cfg *config.Config) (repository.GormProvider, error) {
	dsn := cfg.DatabasePath + "?_journal_mode=WAL&_busy_timeout=5000&_foreign_keys=on"

	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{
		PrepareStmt: true,
	})
	if err != nil {
		return nil, err
	}

	return &singleTenantProvider{db: db}, nil
}

func (p *singleTenantProvider) GetDB(ctx context.Context) (*gorm.DB, error) {
	return p.db.WithContext(ctx), nil
}
