package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type QueueHandler struct {
	queueUC domain.QueueUseCase
}

func NewQueueHandler(queueUC domain.QueueUseCase) *QueueHandler {
	return &QueueHandler{queueUC: queueUC}
}

func (h *QueueHandler) RegisterRoutes(r chi.Router) {
	r.Route("/queues", func(r chi.Router) {
		r.Get("/", h.List)
		r.Post("/", h.Create)
		r.Get("/{id}", h.GetByID)
		r.Put("/{id}", h.Update)
		r.Delete("/{id}", h.Delete)
	})
}

func (h *QueueHandler) List(w http.ResponseWriter, r *http.Request) {
	queues, err := h.queueUC.ListQueues(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, queues)
}

func (h *QueueHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Color       string `json:"color"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "payload inválido")
		return
	}

	queue, err := h.queueUC.CreateQueue(r.Context(), req.Name, req.Description, req.Color)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, queue)
}

func (h *QueueHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	queue, err := h.queueUC.GetQueue(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusNotFound, "fila não encontrada")
		return
	}
	response.JSON(w, http.StatusOK, queue)
}

func (h *QueueHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Color       string `json:"color"`
		IsActive    bool   `json:"is_active"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "payload inválido")
		return
	}

	queue, err := h.queueUC.UpdateQueue(r.Context(), id, req.Name, req.Description, req.Color, req.IsActive)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, queue)
}

func (h *QueueHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	err := h.queueUC.DeleteQueue(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"message": "fila deletada com sucesso"})
}
