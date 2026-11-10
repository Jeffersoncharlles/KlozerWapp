package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type CampaignHandler struct {
	campaignUC domain.CampaignUseCase
}

func NewCampaignHandler(uc domain.CampaignUseCase) *CampaignHandler {
	return &CampaignHandler{campaignUC: uc}
}

func (h *CampaignHandler) RegisterRoutes(r chi.Router) {
	r.Route("/campaigns", func(r chi.Router) {
		r.Get("/", h.List)
		r.Post("/", h.Create)
		r.Post("/{id}/execute", h.Execute)
	})
}

func (h *CampaignHandler) List(w http.ResponseWriter, r *http.Request) {
	campaigns, err := h.campaignUC.ListCampaigns(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, campaigns)
}

func (h *CampaignHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string    `json:"name"`
		Message     string    `json:"message"`
		ScheduledAt time.Time `json:"scheduled_at"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "payload inválido")
		return
	}
	campaign, err := h.campaignUC.CreateCampaign(r.Context(), req.Name, req.Message, req.ScheduledAt)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, campaign)
}

func (h *CampaignHandler) Execute(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	go h.campaignUC.ExecuteCampaign(context.Background(), id)
	response.JSON(w, http.StatusOK, map[string]string{"message": "campanha enfileirada para execução"})
}
