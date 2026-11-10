package handler

import (
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
		// r.Post("/", h.Create)
	})
}

func (h *TagHandler) List(w http.ResponseWriter, r *http.Request) {
	tags, _ := h.tagUC.List(r.Context())
	response.JSON(w, http.StatusOK, tags)
}
