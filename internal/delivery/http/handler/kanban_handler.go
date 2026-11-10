package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type KanbanHandler struct {
	kanbanUC domain.KanbanUseCase
}

func NewKanbanHandler(uc domain.KanbanUseCase) *KanbanHandler {
	return &KanbanHandler{kanbanUC: uc}
}

func (h *KanbanHandler) RegisterRoutes(r chi.Router) {
	r.Route("/kanban", func(r chi.Router) {
		r.Get("/board", h.GetBoard)
		r.Patch("/cards/{cardID}/move", h.MoveCard)
	})
}

func (h *KanbanHandler) GetBoard(w http.ResponseWriter, r *http.Request) {
	board, err := h.kanbanUC.ListBoard(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, board)
}

func (h *KanbanHandler) MoveCard(w http.ResponseWriter, r *http.Request) {
	cardID := chi.URLParam(r, "cardID")
	var req struct {
		TargetColumnID string `json:"target_column_id"`
		Position       int    `json:"position"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "payload inválido")
		return
	}

	if err := h.kanbanUC.MoveCard(r.Context(), cardID, req.TargetColumnID, req.Position); err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusNoContent, nil)
}
