package domain

import (
	"context"
	"time"
)

type ReportFilter struct {
	From         *time.Time
	To           *time.Time
	ConnectionID string
}

type ReportPeriod struct {
	From time.Time `json:"from"`
	To   time.Time `json:"to"`
}

type CallReport struct {
	Total          int64 `json:"total"`
	Outgoing       int64 `json:"outgoing"`
	Incoming       int64 `json:"incoming"`
	Answered       int64 `json:"answered"`
	Missed         int64 `json:"missed"`
	Rejected       int64 `json:"rejected"`
	AverageSeconds int64 `json:"average_seconds"`
}

type DailyCallReport struct {
	Date     string `json:"date"`
	Outgoing int64  `json:"outgoing"`
	Incoming int64  `json:"incoming"`
}

type CallStatusReport struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

type ChatReport struct {
	Messages int64 `json:"messages"`
	Received int64 `json:"received"`
	Sent     int64 `json:"sent"`
	Open     int64 `json:"open"`
	Waiting  int64 `json:"waiting"`
	Finished int64 `json:"finished"`
}

type DailyMessageReport struct {
	Date     string `json:"date"`
	Received int64  `json:"received"`
	Sent     int64  `json:"sent"`
}

type TicketStatusReport struct {
	Status string `json:"status"`
	Count  int64  `json:"count"`
}

type ReportSLA struct {
	Available bool `json:"available"`
}

type ReportRecordings struct {
	Available bool  `json:"available"`
	Count     int64 `json:"count"`
}

type DashboardReport struct {
	// Legacy fields keep the existing dashboard loader compatible while the
	// reports page consumes the richer sections below.
	TotalContacts   int64                `json:"total_contacts"`
	TotalMessages   int64                `json:"total_messages"`
	TotalCards      int64                `json:"total_cards"`
	ActiveWorkflows int64                `json:"active_workflows"`
	Period          ReportPeriod         `json:"period"`
	Calls           CallReport           `json:"calls"`
	CallsByDay      []DailyCallReport    `json:"calls_by_day"`
	CallsByStatus   []CallStatusReport   `json:"calls_by_status"`
	Chat            ChatReport           `json:"chat"`
	MessagesByDay   []DailyMessageReport `json:"messages_by_day"`
	TicketsByStatus []TicketStatusReport `json:"tickets_by_status"`
	SLA             *ReportSLA           `json:"sla"`
	Recordings      ReportRecordings     `json:"recordings"`
}

type ReportRepository interface {
	GetDashboardReport(ctx context.Context, filter ReportFilter) (*DashboardReport, error)
}

type ReportUseCase interface {
	GetDashboardReport(ctx context.Context, filter ReportFilter) (*DashboardReport, error)
}
