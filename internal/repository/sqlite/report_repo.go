package sqlite

import (
	"context"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
)

type reportRepository struct {
	provider repository.GormProvider
}

func NewReportRepository(provider repository.GormProvider) domain.ReportRepository {
	return &reportRepository{provider: provider}
}

func (r *reportRepository) GetDashboardMetrics(ctx context.Context) (*domain.DashboardMetrics, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var metrics domain.DashboardMetrics

	db.Model(&domain.Contact{}).Count(&metrics.TotalContacts)
	db.Model(&domain.Message{}).Count(&metrics.TotalMessages)
	db.Model(&domain.KanbanCard{}).Count(&metrics.TotalCards)
	db.Model(&domain.Flow{}).Where("is_active = ?", true).Count(&metrics.ActiveWorkflows)

	return &metrics, nil
}
