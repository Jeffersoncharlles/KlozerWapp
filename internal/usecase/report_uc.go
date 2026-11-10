package usecase

import (
	"context"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type reportUseCase struct {
	reportRepo domain.ReportRepository
}

func NewReportUseCase(reportRepo domain.ReportRepository) domain.ReportUseCase {
	return &reportUseCase{reportRepo: reportRepo}
}

func (uc *reportUseCase) GetDashboardSummary(ctx context.Context) (*domain.DashboardMetrics, error) {
	return uc.reportRepo.GetDashboardMetrics(ctx)
}
