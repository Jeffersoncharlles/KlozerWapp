package handler

import (
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type QueueAssignmentHandler struct {
	queues domain.QueueUseCase
	kanban domain.KanbanUseCase
}

func NewQueueAssignmentHandler(queues domain.QueueUseCase, kanban domain.KanbanUseCase) *QueueAssignmentHandler {
	return &QueueAssignmentHandler{queues: queues, kanban: kanban}
}

func (h *QueueAssignmentHandler) RegisterRoutes(r chi.Router) {
	r.Put("/kanban/cards/{cardID}/queue/{queueID}", h.Assign)
}

func (h *QueueAssignmentHandler) Assign(w http.ResponseWriter, r *http.Request) {
	queue, err := h.queues.GetQueue(r.Context(), chi.URLParam(r, "queueID"))
	if err != nil {
		response.Error(w, http.StatusNotFound, "fila não encontrada")
		return
	}
	if !queue.IsActive {
		response.Error(w, http.StatusUnprocessableEntity, "a fila está inativa")
		return
	}
	cardID := chi.URLParam(r, "cardID")
	if err := h.kanban.AssignQueue(r.Context(), cardID, queue.ID, "manual"); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"card_id": cardID, "queue_id": queue.ID, "assignment_origin": "manual"})
}
