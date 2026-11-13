package handler

import (
	"net/http"
	"strconv"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type ContactHandler struct {
	useCase domain.ContactUseCase
}

func NewContactHandler(useCase domain.ContactUseCase) *ContactHandler {
	return &ContactHandler{useCase: useCase}
}

func (h *ContactHandler) RegisterRoutes(r chi.Router) {
	r.Route("/contacts", func(r chi.Router) {
		r.Get("/", h.List)
		r.Post("/", h.Create)
		r.Get("/{id}", h.GetByID)
		r.Patch("/{id}", h.Update)
		r.Patch("/{id}/archive", h.Archive)
	})
}

func (h *ContactHandler) List(w http.ResponseWriter, r *http.Request) {
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	contacts, err := h.useCase.ListFiltered(r.Context(), domain.ContactFilter{Search: r.URL.Query().Get("search"), Type: r.URL.Query().Get("type"), Archived: r.URL.Query().Get("archived"), Page: page, Limit: limit})
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "não foi possível carregar os contatos")
		return
	}
	response.JSON(w, http.StatusOK, contacts)
}

func (h *ContactHandler) Create(w http.ResponseWriter, r *http.Request) {
	var contact domain.Contact
	if !decodeFlow(w, r, &contact) {
		return
	}
	if err := h.useCase.CreateManual(r.Context(), &contact); err != nil {
		response.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, contact)
}

func (h *ContactHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	contact, err := h.useCase.GetByID(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusNotFound, "contato não encontrado")
		return
	}
	response.JSON(w, http.StatusOK, contact)
}

func (h *ContactHandler) Update(w http.ResponseWriter, r *http.Request) {
	contact, err := h.useCase.GetByID(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusNotFound, "contato não encontrado")
		return
	}
	if !decodeFlow(w, r, contact) {
		return
	}
	contact.ID = chi.URLParam(r, "id")
	if err := h.useCase.Update(r.Context(), contact); err != nil {
		response.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, contact)
}

func (h *ContactHandler) Archive(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Archived bool `json:"archived"`
	}
	if !decodeFlow(w, r, &req) {
		return
	}
	if err := h.useCase.Archive(r.Context(), chi.URLParam(r, "id"), req.Archived); err != nil {
		response.Error(w, http.StatusNotFound, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"archived": req.Archived})
}
