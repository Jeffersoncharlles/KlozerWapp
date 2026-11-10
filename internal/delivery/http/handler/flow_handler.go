package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type FlowHandler struct {
	flowUC domain.FlowUseCase
}

func NewFlowHandler(flowUC domain.FlowUseCase) *FlowHandler {
	return &FlowHandler{flowUC: flowUC}
}

func (h *FlowHandler) RegisterRoutes(r chi.Router) {
	r.Route("/flows", func(r chi.Router) {
		r.Get("/", h.List)
		r.Post("/", h.Create)
		r.Get("/{id}", h.GetByID)
		r.Delete("/{id}", h.Delete)
	})
}

func (h *FlowHandler) List(w http.ResponseWriter, r *http.Request) {
	flows, err := h.flowUC.ListFlows(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, flows)
}

func (h *FlowHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name           string            `json:"name"`
		TriggerKeyword string            `json:"trigger_keyword"`
		Nodes          []domain.FlowNode `json:"nodes"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "payload inválido")
		return
	}

	flow, err := h.flowUC.CreateFlow(r.Context(), req.Name, req.TriggerKeyword, req.Nodes)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusCreated, flow)
}

func (h *FlowHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	flow, err := h.flowUC.GetFlow(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusNotFound, "fluxo não encontrado")
		return
	}
	response.JSON(w, http.StatusOK, flow)
}

func (h *FlowHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	err := h.flowUC.DeleteFlow(r.Context(), id)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"message": "fluxo deletado com sucesso"})
}
