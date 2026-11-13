package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type TagHandler struct {
	tagUC domain.TagUseCase
}

func NewTagHandler(uc domain.TagUseCase) *TagHandler {
	return &TagHandler{tagUC: uc}
}

func (h *TagHandler) RegisterRoutes(r chi.Router) {
	r.Route("/tags", func(r chi.Router) {
		r.Get("/", h.List)
		r.Post("/", h.Create)
		r.Delete("/{tagID}", h.Delete)
		r.Post("/{tagID}/contacts/{contactID}", h.AddToContact)
		r.Delete("/{tagID}/contacts/{contactID}", h.RemoveFromContact)
	})
}

func (h *TagHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name  string `json:"name"`
		Color string `json:"color"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "payload inválido")
		return
	}
	tag, err := h.tagUC.Create(r.Context(), req.Name, req.Color)
	if err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, tag)
}

func (h *TagHandler) AddToContact(w http.ResponseWriter, r *http.Request) {
	if err := h.tagUC.AddToContact(r.Context(), chi.URLParam(r, "contactID"), chi.URLParam(r, "tagID")); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusNoContent, nil)
}

func (h *TagHandler) RemoveFromContact(w http.ResponseWriter, r *http.Request) {
	if err := h.tagUC.RemoveFromContact(r.Context(), chi.URLParam(r, "contactID"), chi.URLParam(r, "tagID")); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusNoContent, nil)
}

func (h *TagHandler) List(w http.ResponseWriter, r *http.Request) {
	tags, err := h.tagUC.List(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "não foi possível carregar as tags")
		return
	}
	response.JSON(w, http.StatusOK, tags)
}

func (h *TagHandler) Delete(w http.ResponseWriter, r *http.Request) {
	if err := h.tagUC.Delete(r.Context(), chi.URLParam(r, "tagID")); err != nil {
		response.Error(w, http.StatusBadRequest, err.Error())
		return
	}
	response.JSON(w, http.StatusNoContent, nil)
}
