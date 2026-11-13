package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
)

type UserHandler struct {
	useCase domain.UserUseCase
}

func NewUserHandler(useCase domain.UserUseCase) *UserHandler {
	return &UserHandler{useCase: useCase}
}

func (h *UserHandler) RegisterRoutes(r chi.Router) {
	r.Route("/users", func(r chi.Router) {
		r.Get("/", h.List)
		r.Post("/", h.Create)
		r.Get("/{id}", h.GetByID)
		r.Patch("/{id}", h.Update)
		r.Patch("/{id}/status", h.UpdateStatus)
	})
}

func (h *UserHandler) List(w http.ResponseWriter, r *http.Request) {
	users, err := h.useCase.List(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "não foi possível carregar os usuários")
		return
	}
	response.JSON(w, http.StatusOK, users)
}

func (h *UserHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if !decodeFlow(w, r, &req) {
		return
	}
	user, err := h.useCase.Create(r.Context(), req.Name, req.Email, req.Password, req.Role)
	if err != nil {
		response.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, user)
}

func (h *UserHandler) GetByID(w http.ResponseWriter, r *http.Request) {
	user, err := h.useCase.GetByID(r.Context(), chi.URLParam(r, "id"))
	if err != nil {
		response.Error(w, http.StatusNotFound, "usuário não encontrado")
		return
	}
	response.JSON(w, http.StatusOK, user)
}

func (h *UserHandler) Update(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if !decodeFlow(w, r, &req) {
		return
	}
	updated, err := h.useCase.Update(r.Context(), "ADMIN", chi.URLParam(r, "id"), req.Name, req.Email, req.Password, req.Role)
	if err != nil {
		response.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, updated)
}

func (h *UserHandler) UpdateStatus(w http.ResponseWriter, r *http.Request) {
	var req struct {
		IsActive bool `json:"is_active"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "payload inválido")
		return
	}
	if req.IsActive {
		if err := h.useCase.Activate(r.Context(), chi.URLParam(r, "id")); err != nil {
			response.Error(w, http.StatusUnprocessableEntity, err.Error())
			return
		}
		response.JSON(w, http.StatusOK, map[string]bool{"is_active": true})
		return
	}
	if err := h.useCase.Deactivate(r.Context(), chi.URLParam(r, "id")); err != nil {
		response.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	response.JSON(w, http.StatusOK, map[string]bool{"is_active": false})
}
