package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type TagKanbanRuleHandler struct{ uc domain.TagKanbanRuleUseCase }

func NewTagKanbanRuleHandler(uc domain.TagKanbanRuleUseCase) *TagKanbanRuleHandler {
	return &TagKanbanRuleHandler{uc: uc}
}

func (h *TagKanbanRuleHandler) RegisterRoutes(r chi.Router) {
	r.Route("/tag-kanban-rules", func(r chi.Router) {
		r.Get("/", h.List)
		r.Post("/", h.Create)
		r.Put("/{id}", h.Update)
		r.Delete("/{id}", h.Delete)
	})
}

type tagKanbanRuleRequest struct {
	TagID          string `json:"tag_id"`
	TargetColumnID string `json:"target_column_id"`
	Priority       int    `json:"priority"`
	Enabled        *bool  `json:"enabled"`
}

func (h *TagKanbanRuleHandler) List(w http.ResponseWriter, r *http.Request) {
	rules, err := h.uc.List(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, rules)
}

func (h *TagKanbanRuleHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req tagKanbanRuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "payload inválido")
		return
	}
	rule, err := h.uc.Create(r.Context(), req.TagID, req.TargetColumnID, req.Priority)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, rule)
}

func (h *TagKanbanRuleHandler) Update(w http.ResponseWriter, r *http.Request) {
	var req tagKanbanRuleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Enabled == nil {
		response.Error(w, http.StatusBadRequest, "payload inválido")
		return
	}
	rule, err := h.uc.Update(r.Context(), chi.URLParam(r, "id"), req.TagID, req.TargetColumnID, req.Priority, *req.Enabled)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, rule)
}

func (h *TagKanbanRuleHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.uc.Delete(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
