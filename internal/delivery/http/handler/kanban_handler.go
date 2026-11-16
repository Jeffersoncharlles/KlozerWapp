package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5"
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
		r.Patch("/cards/{cardID}/take", h.TakeAttendance)
		r.Patch("/cards/{cardID}/finish", h.FinishAttendance)
		r.Get("/cards/{cardID}/events", h.ListEvents)
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
		response.Error(w, http.StatusUnprocessableEntity, "payload inválido")
		return
	}

	userID, role, ok := authenticatedUser(r)
	if !ok {
		response.Error(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}
	if err := validateKanbanPayload(req.TargetColumnID); err != nil {
		response.Error(w, http.StatusUnprocessableEntity, err.Error())
		return
	}
	if _, err := h.kanbanUC.MoveCardAs(r.Context(), cardID, req.TargetColumnID, req.Position, userID, role); err != nil {
		h.writeKanbanError(w, err)
		return
	}
	response.JSON(w, http.StatusNoContent, nil)
}

func (h *KanbanHandler) TakeAttendance(w http.ResponseWriter, r *http.Request) {
	userID, role, ok := authenticatedUser(r)
	if !ok {
		response.Error(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}
	card, err := h.kanbanUC.Take(r.Context(), chi.URLParam(r, "cardID"), userID, role)
	if err != nil {
		h.writeKanbanError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, card)
}

func (h *KanbanHandler) FinishAttendance(w http.ResponseWriter, r *http.Request) {
	userID, role, ok := authenticatedUser(r)
	if !ok {
		response.Error(w, http.StatusUnauthorized, "usuário não autenticado")
		return
	}
	card, err := h.kanbanUC.Finish(r.Context(), chi.URLParam(r, "cardID"), userID, role)
	if err != nil {
		h.writeKanbanError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, card)
}

func (h *KanbanHandler) ListEvents(w http.ResponseWriter, r *http.Request) {
	limit, offset := queryPagination(r)
	events, err := h.kanbanUC.ListEvents(r.Context(), chi.URLParam(r, "cardID"), limit, offset)
	if err != nil {
		h.writeKanbanError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, events)
}

func authenticatedUser(r *http.Request) (string, string, bool) {
	_, claims, _ := jwtauth.FromContext(r.Context())
	userID, idOK := claims["sub"].(string)
	role, roleOK := claims["role"].(string)
	return userID, role, idOK && roleOK && userID != "" && role != ""
}

func queryPagination(r *http.Request) (int, int) {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	return limit, offset
}

func validateKanbanPayload(columnID string) error {
	if columnID == "" {
		return errors.New("target_column_id é obrigatório")
	}
	return nil
}

func (h *KanbanHandler) writeKanbanError(w http.ResponseWriter, err error) {
	status := http.StatusInternalServerError
	switch {
	case errors.Is(err, domain.ErrCardNotFound), errors.Is(err, domain.ErrColumnNotFound):
		status = http.StatusNotFound
	case errors.Is(err, domain.ErrForbidden):
		status = http.StatusForbidden
	case errors.Is(err, domain.ErrCardFinished):
		status = http.StatusConflict
	case errors.Is(err, domain.ErrInvalidActor):
		status = http.StatusUnauthorized
	}
	response.Error(w, status, err.Error())
}
