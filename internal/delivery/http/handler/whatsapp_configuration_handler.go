package handler

import (
	"errors"
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/usecase"
	"github.com/go-chi/chi/v5"
)

type WhatsAppConfigurationHandler struct {
	useCase domain.WhatsAppConfigurationUseCase
}

func NewWhatsAppConfigurationHandler(useCase domain.WhatsAppConfigurationUseCase) *WhatsAppConfigurationHandler {
	return &WhatsAppConfigurationHandler{useCase: useCase}
}

func (h *WhatsAppConfigurationHandler) RegisterRoutes(r chi.Router) {
	r.Get("/sessions/configuration", h.Get)
	r.Put("/sessions/configuration", h.Update)
}

func (h *WhatsAppConfigurationHandler) Get(w http.ResponseWriter, r *http.Request) {
	configuration, err := h.useCase.Get(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "não foi possível carregar a configuração do WhatsApp")
		return
	}
	response.JSON(w, http.StatusOK, configuration)
}

func (h *WhatsAppConfigurationHandler) Update(w http.ResponseWriter, r *http.Request) {
	var configuration domain.WhatsAppConfiguration
	if !decodeFlow(w, r, &configuration) {
		return
	}

	updated, err := h.useCase.Update(r.Context(), configuration)
	if err != nil {
		status := http.StatusInternalServerError
		message := "não foi possível salvar a configuração do WhatsApp"
		switch {
		case errors.Is(err, usecase.ErrFlowConfigurationNotFound), errors.Is(err, usecase.ErrQueueConfigurationNotFound):
			status = http.StatusNotFound
			message = err.Error()
		case errors.Is(err, usecase.ErrFlowConfigurationInactive), errors.Is(err, usecase.ErrQueueConfigurationInactive):
			status = http.StatusUnprocessableEntity
			message = err.Error()
		}
		response.Error(w, status, message)
		return
	}
	response.JSON(w, http.StatusOK, updated)
}
