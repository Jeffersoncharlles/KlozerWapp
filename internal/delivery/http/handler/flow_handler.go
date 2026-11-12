package handler

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"strconv"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/middleware"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type FlowHandler struct {
	flowUC  domain.FlowUseCase
	runtime domain.FlowRuntimeUseCase
}

func NewFlowHandler(uc domain.FlowUseCase, runtime domain.FlowRuntimeUseCase) *FlowHandler {
	return &FlowHandler{uc, runtime}
}

func (h *FlowHandler) RegisterRoutes(r chi.Router) {
	r.Route("/flows", func(r chi.Router) {
		r.Get("/", h.List)
		r.Post("/", h.Create)
		r.Get("/{id}", h.GetByID)
		r.Patch("/{id}", h.Update)
		r.Delete("/{id}", h.Delete)
		r.Post("/{id}/duplicate", h.Duplicate)
		r.With(middleware.RequireAdmin).Post("/{id}/publish", h.Publish)
		r.Post("/{id}/simulate", h.Simulate)
	})
}

func decodeFlow(w http.ResponseWriter, r *http.Request, value any) bool {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(value); err != nil {
		response.JSON(w, http.StatusBadRequest, map[string]any{"code": "invalid_payload", "message": "payload inválido ou maior que 1 MiB"})
		return false
	}
	if err := decoder.Decode(&struct{}{}); err != io.EOF {
		response.JSON(w, http.StatusBadRequest, map[string]any{"code": "invalid_payload", "message": "envie um único objeto JSON"})
		return false
	}
	return true
}

func flowError(w http.ResponseWriter, err error) {
	var e *domain.FlowError
	if errors.As(err, &e) {
		status := http.StatusUnprocessableEntity
		if e.Code == "not_found" {
			status = http.StatusNotFound
		}
		if e.Code == "revision_conflict" {
			status = http.StatusConflict
		}
		response.JSON(w, status, map[string]any{"code": e.Code, "message": e.Message, "fields": e.Fields})
		return
	}
	slog.Error("falha na operação de automação", "err", err)
	response.JSON(w, http.StatusInternalServerError, map[string]string{"code": "internal_error", "message": "não foi possível concluir a operação"})
}

func (h *FlowHandler) List(w http.ResponseWriter, r *http.Request) {
	flows, err := h.flowUC.ListFlows(r.Context(), r.URL.Query().Get("kind"))
	if err != nil {
		flowError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, flows)
}

func (h *FlowHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name string `json:"name"`
	}
	if !decodeFlow(w, r, &req) {
		return
	}
	f, err := h.flowUC.CreateFlow(r.Context(), req.Name)
	if err != nil {
		flowError(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, f)
}

func (h *FlowHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	f, err := h.flowUC.GetFlow(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		flowError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, f)
}

func (h *FlowHandler) Update(w http.ResponseWriter, r *http.Request) {
	var req domain.FlowPatch
	if !decodeFlow(w, r, &req) {
		return
	}
	f, err := h.flowUC.UpdateFlow(r.Context(), chi.URLParam(r, "id"), req)
	if err != nil {
		flowError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, f)
}

func (h *FlowHandler) Publish(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Revision int64 `json:"revision"`
	}
	if !decodeFlow(w, r, &req) {
		return
	}
	f, err := h.flowUC.PublishFlow(r.Context(), chi.URLParam(r, "id"), req.Revision)
	if err != nil {
		flowError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, f)
}

func (h *FlowHandler) Duplicate(w http.ResponseWriter, r *http.Request) {
	f, err := h.flowUC.DuplicateFlow(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		flowError(w, err)
		return
	}
	response.JSON(w, http.StatusCreated, f)
}

func (h *FlowHandler) Delete(w http.ResponseWriter, r *http.Request) {
	revision, err := strconv.ParseInt(r.URL.Query().Get("revision"), 10, 64)
	if err != nil || revision < 1 {
		response.JSON(w, http.StatusBadRequest, map[string]string{"code": "revision_required", "message": "informe a revisão esperada"})
		return
	}
	if err := h.flowUC.DeleteFlow(r.Context(), chi.URLParam(r, "id"), revision); err != nil {
		flowError(w, err)
		return
	}
	response.JSON(w, http.StatusNoContent, nil)
}

func (h *FlowHandler) Simulate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Inputs []string `json:"inputs"`
	}
	if !decodeFlow(w, r, &req) {
		return
	}
	if len(req.Inputs) > 100 {
		response.Error(w, http.StatusBadRequest, "limite de 100 entradas")
		return
	}
	messages, err := h.runtime.Simulate(r.Context(), chi.URLParam(r, "id"), req.Inputs)
	if err != nil {
		flowError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]any{"messages": messages})
}
