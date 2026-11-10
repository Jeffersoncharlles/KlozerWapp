package handler

import (
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
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
	metrics, err := h.reportUC.GetDashboardSummary(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, metrics)
}
