package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type CallHandler struct {
	callUC domain.CallUseCase
}

func NewCallHandler(uc domain.CallUseCase) *CallHandler {
	return &CallHandler{callUC: uc}
}

func (h *CallHandler) RegisterRoutes(r chi.Router) {
	r.Route("/calls", func(r chi.Router) {
		r.Get("/{phone}", h.History)
		r.Post("/", h.Register)
	})
}

func (h *CallHandler) History(w http.ResponseWriter, r *http.Request) {
	phone := chi.URLParam(r, "phone")
	calls, err := h.callUC.GetCallHistory(r.Context(), phone)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, calls)
}

func (h *CallHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Phone     string `json:"phone"`
		Direction string `json:"direction"`
		Status    string `json:"status"`
		Duration  int    `json:"duration"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "payload inválido")
		return
	}
	call, err := h.callUC.RegisterCall(r.Context(), req.Phone, req.Direction, req.Status, req.Duration)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, call)
}
