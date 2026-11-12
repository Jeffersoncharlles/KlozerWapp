package sqlite

import (
	"context"
	"database/sql"
	"log/slog"
	"net/url"
	"path/filepath"
	"sync"

	"golang.org/x/crypto/bcrypt"
	gormsqlite "gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/config"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
)

type singleTenantProvider struct {
	db *gorm.DB
}

// NewGormProvider owns the only connection pool in this single-tenant app.
// Whatsmeow receives the same pool through ProvideSQLDB; it never opens a file.
func NewGormProvider(cfg *config.Config) (repository.GormProvider, func(), error) {
	path, err := filepath.Abs(cfg.DatabasePath)
	if err != nil {
		return nil, nil, err
	}
	dsn := (&url.URL{Scheme: "file", Path: path, RawQuery: "_journal_mode=WAL&_busy_timeout=5000&_foreign_keys=on"}).String()
	db, err := gorm.Open(gormsqlite.Open(dsn), &gorm.Config{PrepareStmt: true})
	if err != nil {
		return nil, nil, err
	}
	pool, err := db.DB()
	if err != nil {
		return nil, nil, err
	}
	pool.SetMaxOpenConns(4)
	pool.SetMaxIdleConns(4)
	cleanup := sync.OnceFunc(func() {
		if err := pool.Close(); err != nil {
			slog.Error("fechar SQLite", "err", err)
		}
	})

	// =========================================================================
	// MIGRAÇÃO AUTOMÁTICA (Roda sozinho ao subir a API)
	// Inicializa o esquema do CRM. O SQLStore inicializa suas próprias tabelas
	// ao construir o cliente Whatsmeow, usando este mesmo pool.
	// =========================================================================
	err = db.AutoMigrate(
		&domain.User{},
		&domain.Contact{},
		&domain.Tag{},
		&domain.KanbanColumn{},
		&domain.KanbanCard{},
		&domain.Message{},
		&domain.QuickReply{},
		&conversationFlow{},
		&flowVersion{},
		&flowBinding{},
		&flowSessionRecord{},
		&flowInbox{},
		&flowOutbox{},
		&domain.Queue{},
		&domain.DashboardMetrics{},
		&domain.Campaign{},
		&domain.CallRecord{},
	)
	if err != nil {
		slog.Error("Erro ao sincronizar tabelas do banco", "err", err)
		cleanup()
		return nil, nil, err
	}

	// Popula os dados iniciais caso o banco seja novo
	seedDefaultKanbanColumns(db)
	// 3. SEED: Cria o usuário padrão se o banco estiver vazio
	seedDefaultUser(db)

	return &singleTenantProvider{db: db}, cleanup, nil
}

// ProvideSQLDB exposes the existing underlying pool for SQL-based adapters.
// It does not create a second connection pool or own cleanup.
func ProvideSQLDB(provider repository.GormProvider) (*sql.DB, error) {
	db, err := provider.GetDB(context.Background())
	if err != nil {
		return nil, err
	}
	return db.DB()
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

// seedDefaultUser verifica se existe algum usuário e injeta o Admin inicial
func seedDefaultUser(db *gorm.DB) {
	var count int64
	db.Model(&domain.User{}).Count(&count)

	// Se a contagem for 0, significa que é a primeira vez rodando o sistema
	if count == 0 {
		slog.Info("Nenhum usuário encontrado. Criando administrador padrão...")

		// Gera o hash da senha padrão
		hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		if err != nil {
			slog.Error("Erro ao gerar senha do usuário padrão", "err", err)
			return
		}

		defaultUser := domain.User{
			Name:         "Administrador Padrão",
			Email:        "admin@admin.com", // E-mail padrão
			PasswordHash: string(hash),      // Senha: admin123
			Role:         "ADMIN",
			IsActive:     true,
		}

		if err := db.Create(&defaultUser).Error; err != nil {
			slog.Error("Erro ao criar usuário padrão", "err", err)
		} else {
			slog.Info("✅ Usuário padrão criado com sucesso!")
			slog.Info("👉 E-mail: admin@admin.com")
			slog.Info("👉 Senha: admin123")
			slog.Warn("⚠️ IMPORTANTE: Altere esta senha e e-mail no primeiro login!")
		}
	}
}
