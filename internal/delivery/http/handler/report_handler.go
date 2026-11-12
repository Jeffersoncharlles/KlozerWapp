package handler

import (
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/usecase"
	"github.com/go-chi/chi/v5"
)

type ReportHandler struct {
	reportUC domain.ReportUseCase
}

func NewReportHandler(reportUC domain.ReportUseCase) *ReportHandler {
	return &ReportHandler{reportUC: reportUC}
}

func (h *ReportHandler) RegisterRoutes(r chi.Router) {
	r.Route("/reports", func(r chi.Router) {
		r.Get("/dashboard", h.GetDashboard)
	})
}

func (h *ReportHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	from, err := usecase.ReportDate(r.URL.Query().Get("from"), false)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	to, err := usecase.ReportDate(r.URL.Query().Get("to"), true)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	report, err := h.reportUC.GetDashboardReport(r.Context(), domain.ReportFilter{
		From:         from,
		To:           to,
		ConnectionID: r.URL.Query().Get("connection_id"),
	},
	)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, report)
}
