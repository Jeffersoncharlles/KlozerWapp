package sqlite

import (
	"context"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
	"gorm.io/gorm"
)

type reportRepository struct {
	provider repository.GormProvider
}

func NewReportRepository(provider repository.GormProvider) domain.ReportRepository {
	return &reportRepository{provider: provider}
}

type reportCallDay struct {
	Date     string
	Outgoing int64
	Incoming int64
}

type reportCount struct {
	Status string
	Count  int64
}

type reportMessageDay struct {
	Date     string
	Received int64
	Sent     int64
}

type reportTicketStatus struct {
	Status string
	Count  int64
}

func applyReportPeriod(query *gorm.DB, column string, filter domain.ReportFilter) *gorm.DB {
	if filter.From != nil {
		query = query.Where(column+" >= ?", *filter.From)
	}
	if filter.To != nil {
		query = query.Where(column+" < ?", *filter.To)
	}
	return query
}

func (r *reportRepository) GetDashboardReport(ctx context.Context, filter domain.ReportFilter) (*domain.DashboardReport, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	report := &domain.DashboardReport{
		CallsByDay:      []domain.DailyCallReport{},
		CallsByStatus:   []domain.CallStatusReport{},
		MessagesByDay:   []domain.DailyMessageReport{},
		TicketsByStatus: []domain.TicketStatusReport{},
		SLA:             nil,
		Recordings:      domain.ReportRecordings{},
	}
	if err := db.Model(&domain.Contact{}).Count(&report.TotalContacts).Error; err != nil {
		return nil, err
	}
	if err := db.Model(&domain.KanbanCard{}).Count(&report.TotalCards).Error; err != nil {
		return nil, err
	}
	if err := db.Model(&conversationFlow{}).Where("enabled = ? AND deleted = ? AND published_revision > 0", true, false).Count(&report.ActiveWorkflows).Error; err != nil {
		return nil, err
	}
	if filter.From != nil {
		report.Period.From = *filter.From
	}
	if filter.To != nil {
		report.Period.To = *filter.To
	}

	callQuery := applyReportPeriod(db.Model(&domain.CallRecord{}), "created_at", filter)
	if err := callQuery.Count(&report.Calls.Total).Error; err != nil {
		return nil, err
	}
	if err := applyReportPeriod(db.Model(&domain.CallRecord{}).Where("UPPER(direction) = ?", "OUTBOUND"), "created_at", filter).Count(&report.Calls.Outgoing).Error; err != nil {
		return nil, err
	}
	if err := applyReportPeriod(db.Model(&domain.CallRecord{}).Where("UPPER(direction) = ?", "INBOUND"), "created_at", filter).Count(&report.Calls.Incoming).Error; err != nil {
		return nil, err
	}
	if err := applyReportPeriod(db.Model(&domain.CallRecord{}).Where("UPPER(status) = ?", "ANSWERED"), "created_at", filter).Count(&report.Calls.Answered).Error; err != nil {
		return nil, err
	}
	if err := applyReportPeriod(db.Model(&domain.CallRecord{}).Where("UPPER(status) = ?", "MISSED"), "created_at", filter).Count(&report.Calls.Missed).Error; err != nil {
		return nil, err
	}
	if err := applyReportPeriod(db.Model(&domain.CallRecord{}).Where("UPPER(status) = ?", "REJECTED"), "created_at", filter).Count(&report.Calls.Rejected).Error; err != nil {
		return nil, err
	}
	var average struct{ Value float64 }
	if err := applyReportPeriod(db.Model(&domain.CallRecord{}), "created_at", filter).Select("COALESCE(AVG(duration), 0) AS value").Scan(&average).Error; err != nil {
		return nil, err
	}
	report.Calls.AverageSeconds = int64(average.Value)

	var callDays []reportCallDay
	if err := applyReportPeriod(db.Model(&domain.CallRecord{}), "created_at", filter).
		Select("date(created_at) AS date, SUM(CASE WHEN UPPER(direction) = 'OUTBOUND' THEN 1 ELSE 0 END) AS outgoing, SUM(CASE WHEN UPPER(direction) = 'INBOUND' THEN 1 ELSE 0 END) AS incoming").
		Group("date(created_at)").Order("date(created_at) ASC").Find(&callDays).Error; err != nil {
		return nil, err
	}
	for _, day := range callDays {
		report.CallsByDay = append(report.CallsByDay, domain.DailyCallReport{Date: day.Date, Outgoing: day.Outgoing, Incoming: day.Incoming})
	}

	var callStatuses []reportCount
	if err := applyReportPeriod(db.Model(&domain.CallRecord{}), "created_at", filter).
		Select("UPPER(status) AS status, COUNT(*) AS count").Group("UPPER(status)").Order("status ASC").Find(&callStatuses).Error; err != nil {
		return nil, err
	}
	for _, status := range callStatuses {
		report.CallsByStatus = append(report.CallsByStatus, domain.CallStatusReport{Status: status.Status, Count: status.Count})
	}

	messageQuery := applyReportPeriod(db.Model(&domain.Message{}), "timestamp", filter)
	if err := messageQuery.Count(&report.Chat.Messages).Error; err != nil {
		return nil, err
	}
	report.TotalMessages = report.Chat.Messages
	if err := applyReportPeriod(db.Model(&domain.Message{}).Where("is_from_me = ?", false), "timestamp", filter).Count(&report.Chat.Received).Error; err != nil {
		return nil, err
	}
	if err := applyReportPeriod(db.Model(&domain.Message{}).Where("is_from_me = ?", true), "timestamp", filter).Count(&report.Chat.Sent).Error; err != nil {
		return nil, err
	}

	var messageDays []reportMessageDay
	if err := applyReportPeriod(db.Model(&domain.Message{}), "timestamp", filter).
		Select("date(timestamp) AS date, SUM(CASE WHEN is_from_me = 0 THEN 1 ELSE 0 END) AS received, SUM(CASE WHEN is_from_me = 1 THEN 1 ELSE 0 END) AS sent").
		Group("date(timestamp)").Order("date(timestamp) ASC").Find(&messageDays).Error; err != nil {
		return nil, err
	}
	for _, day := range messageDays {
		report.MessagesByDay = append(report.MessagesByDay, domain.DailyMessageReport{Date: day.Date, Received: day.Received, Sent: day.Sent})
	}

	var ticketStatuses []reportTicketStatus
	if err := db.Table("kanban_cards AS cards").Select("columns.name AS status, COUNT(*) AS count").Joins("JOIN kanban_columns AS columns ON columns.id = cards.column_id").Group("columns.name").Order("columns.position ASC").Find(&ticketStatuses).Error; err != nil {
		return nil, err
	}
	for _, status := range ticketStatuses {
		report.TicketsByStatus = append(report.TicketsByStatus, domain.TicketStatusReport{Status: status.Status, Count: status.Count})
		switch status.Status {
		case "Em Atendimento":
			report.Chat.Open = status.Count
		case "Aguardando Resposta":
			report.Chat.Waiting = status.Count
		case "Fechado/Ganho":
			report.Chat.Finished = status.Count
		}
	}

	return report, nil
}
