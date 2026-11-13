package handler

import (
	"errors"
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/usecase"
	"github.com/go-chi/chi/v5"
)

type ScheduleHandler struct {
	useCase domain.ScheduleUseCase
}

func NewScheduleHandler(useCase domain.ScheduleUseCase) *ScheduleHandler {
	return &ScheduleHandler{useCase: useCase}
}

func (h *ScheduleHandler) RegisterRoutes(r chi.Router) {
	r.Get("/schedule", h.Get)
	r.Put("/schedule", h.Update)
}

func (h *ScheduleHandler) Get(w http.ResponseWriter, r *http.Request) {
	schedule, err := h.useCase.Get(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "não foi possível carregar a agenda")
		return
	}
	response.JSON(w, http.StatusOK, schedule)
}

func (h *ScheduleHandler) Update(w http.ResponseWriter, r *http.Request) {
	var schedule domain.Schedule
	if !decodeFlow(w, r, &schedule) {
		return
	}
	updated, err := h.useCase.Update(r.Context(), schedule)
	if err != nil {
		if !errors.Is(err, usecase.ErrInvalidSchedule) {
			response.Error(w, http.StatusInternalServerError, "não foi possível salvar a agenda")
			return
		}
		response.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, updated)
}
