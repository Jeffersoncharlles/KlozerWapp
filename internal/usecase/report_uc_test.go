package usecase

import (
	"context"
	"testing"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type reportRepositoryStub struct {
	filter domain.ReportFilter
}

func (s *reportRepositoryStub) GetDashboardReport(_ context.Context, filter domain.ReportFilter) (*domain.DashboardReport, error) {
	s.filter = filter
	return &domain.DashboardReport{}, nil
}

func TestReportDate(t *testing.T) {
	from, err := ReportDate("2026-11-01", false)
	if err != nil {
		t.Fatalf("ReportDate() error = %v", err)
	}
	if got := from.Format(time.RFC3339); got != "2026-11-01T00:00:00Z" {
		t.Fatalf("ReportDate() = %s, want start of day", got)
	}

	to, err := ReportDate("2026-11-01", true)
	if err != nil {
		t.Fatalf("ReportDate() error = %v", err)
	}
	if got := to.Format(time.RFC3339); got != "2026-11-02T00:00:00Z" {
		t.Fatalf("ReportDate() = %s, want exclusive next day", got)
	}
}

func TestReportDateRejectsInvalidDate(t *testing.T) {
	if _, err := ReportDate("01-11-2026", false); err == nil {
		t.Fatal("expected invalid report date error")
	}
}

func TestGetDashboardReportRejectsInvertedPeriod(t *testing.T) {
	repo := &reportRepositoryStub{}
	uc := NewReportUseCase(repo)
	from := time.Date(2026, 11, 2, 0, 0, 0, 0, time.UTC)
	to := time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC)

	if _, err := uc.GetDashboardReport(context.Background(), domain.ReportFilter{From: &from, To: &to}); err == nil {
		t.Fatal("expected inverted period error")
	}
	if repo.filter.From != nil || repo.filter.To != nil {
		t.Fatal("repository should not be called for an invalid period")
	}
}

func TestGetDashboardReportPassesFilterToRepository(t *testing.T) {
	repo := &reportRepositoryStub{}
	uc := NewReportUseCase(repo)
	from := time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC)
	to := time.Date(2026, 11, 2, 0, 0, 0, 0, time.UTC)

	if _, err := uc.GetDashboardReport(context.Background(), domain.ReportFilter{From: &from, To: &to, ConnectionID: "connection"}); err != nil {
		t.Fatalf("GetDashboardReport() error = %v", err)
	}
	if !repo.filter.From.Equal(from) || !repo.filter.To.Equal(to) || repo.filter.ConnectionID != "connection" {
		t.Fatal("repository did not receive the report filter")
	}
}
