package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type QuickReplyHandler struct {
	qrUC domain.QuickReplyUseCase
}

func NewQuickReplyHandler(uc domain.QuickReplyUseCase) *QuickReplyHandler {
	return &QuickReplyHandler{qrUC: uc}
}

func (h *QuickReplyHandler) RegisterRoutes(r chi.Router) {
	r.Route("/quick-replies", func(r chi.Router) {
		r.Get("/", h.List)
		r.Post("/", h.Create)
	})
}

func (h *QuickReplyHandler) List(w http.ResponseWriter, r *http.Request) {
	qrs, _ := h.qrUC.List(r.Context())
	response.JSON(w, http.StatusOK, qrs)
}

func (h *QuickReplyHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Shortcut string `json:"shortcut"`
		Title    string `json:"title"`
		Content  string `json:"content"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	qr, err := h.qrUC.Create(r.Context(), req.Shortcut, req.Title, req.Content)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, qr)
}
