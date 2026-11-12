package usecase

import (
	"context"
	"errors"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type reportUseCase struct {
	reportRepo domain.ReportRepository
}

func NewReportUseCase(reportRepo domain.ReportRepository) domain.ReportUseCase {
	return &reportUseCase{reportRepo: reportRepo}
}

func (uc *reportUseCase) GetDashboardReport(ctx context.Context, filter domain.ReportFilter) (*domain.DashboardReport, error) {
	if filter.From != nil && filter.To != nil && !filter.From.Before(*filter.To) {
		return nil, errors.New("o período do relatório é inválido")
	}
	if filter.From != nil && filter.From.IsZero() {
		return nil, errors.New("a data inicial do relatório é inválida")
	}
	if filter.To != nil && filter.To.IsZero() {
		return nil, errors.New("a data final do relatório é inválida")
	}
	return uc.reportRepo.GetDashboardReport(ctx, filter)
}

func ReportDate(value string, endOfDay bool) (*time.Time, error) {
	if value == "" {
		return nil, nil
	}
	date, err := time.ParseInLocation("2006-01-02", value, time.UTC)
	if err != nil {
		return nil, errors.New("data do relatório inválida; use AAAA-MM-DD")
	}
	if endOfDay {
		date = date.AddDate(0, 0, 1)
	}
	return &date, nil
}
