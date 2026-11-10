package sqlite

import (
	"context"
	"log/slog"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/config"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
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

	// =========================================================================
	// MIGRAÇÃO AUTOMÁTICA (Roda sozinho ao subir a API)
	// O GORM verifica se as tabelas existem. Se não, cria.
	// Se existirem, ele não apaga dados, só adiciona colunas novas se houver.
	// =========================================================================
	err = db.AutoMigrate(
		&domain.User{},
		&domain.Contact{},
		&domain.Tag{},
		&domain.KanbanColumn{},
		&domain.KanbanCard{},
		&domain.Message{},
		&domain.QuickReply{},
		&domain.Flow{},
		&domain.FlowNode{},
		&domain.Queue{},
		&domain.DashboardMetrics{},
		&domain.Campaign{},
		&domain.CallRecord{},
	)
	if err != nil {
		slog.Error("Erro ao sincronizar tabelas do banco", "err", err)
		return nil, err
	}

	// Popula os dados iniciais caso o banco seja novo
	seedDefaultKanbanColumns(db)

	return &singleTenantProvider{db: db}, nil
}

func (p *singleTenantProvider) GetDB(ctx context.Context) (*gorm.DB, error) {
	return p.db.WithContext(ctx), nil
}

// seedDefaultKanbanColumns verifica se o Kanban está vazio e cria as colunas base
func seedDefaultKanbanColumns(db *gorm.DB) {
	var count int64
	db.Model(&domain.KanbanColumn{}).Count(&count)

	if count == 0 {
		slog.Info("Banco novo detectado: Criando colunas padrão do Kanban...")
		defaultColumns := []domain.KanbanColumn{
			{Name: "Novos Leads", Position: 0, Color: "#3B82F6"},
			{Name: "Em Atendimento", Position: 1, Color: "#F59E0B"},
			{Name: "Aguardando Resposta", Position: 2, Color: "#8B5CF6"},
			{Name: "Fechado/Ganho", Position: 3, Color: "#10B981"},
		}

		for _, col := range defaultColumns {
			db.Create(&col)
		}
	}
}
