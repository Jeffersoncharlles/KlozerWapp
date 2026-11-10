package domain

import (
	"context"
)

type DashboardMetrics struct {
	TotalContacts   int64 `json:"total_contacts"`
	TotalMessages   int64 `json:"total_messages"`
	TotalCards      int64 `json:"total_cards"`
	ActiveWorkflows int64 `json:"active_workflows"`
}

type ReportRepository interface {
	GetDashboardMetrics(ctx context.Context) (*DashboardMetrics, error)
}

type ReportUseCase interface {
	GetDashboardSummary(ctx context.Context) (*DashboardMetrics, error)
}
