package handler

import (
	"encoding/json"
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/jwtauth/v5" // Adicione este import
)

type MessageHandler struct {
	chatUC domain.ChatUseCase
}

func NewMessageHandler(uc domain.ChatUseCase) *MessageHandler {
	return &MessageHandler{chatUC: uc}
}

func (h *MessageHandler) RegisterRoutes(r chi.Router) {
	r.Route("/messages", func(r chi.Router) {
		r.Get("/{contactID}", h.ListHistory)
		r.Post("/", h.SendMessage)
	})
}

func (h *MessageHandler) SendMessage(w http.ResponseWriter, r *http.Request) {
	// 1. Pega os claims injetados pelo jwtauth no contexto
	_, claims, _ := jwtauth.FromContext(r.Context())

	// 2. Extrai o userID do claim "sub" (subject)
	userID, ok := claims["sub"].(string)
	if !ok {
		response.Error(w, http.StatusUnauthorized, "usuário não identificado no token")
		return
	}

	var req struct {
		ContactID string `json:"contact_id"`
		Content   string `json:"content"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.Error(w, http.StatusBadRequest, "payload inválido")
		return
	}

	msg, err := h.chatUC.SendMessage(r.Context(), req.ContactID, userID, req.Content)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	response.JSON(w, http.StatusCreated, msg)
}

func (h *MessageHandler) ListHistory(w http.ResponseWriter, r *http.Request) {
	// Pega o ID do contato direto da URL: /v1/api/messages/12345
	contactID := chi.URLParam(r, "contactID")

	// Você pode depois pegar esses valores da query string (ex: ?limit=20&offset=0)
	// Por enquanto, vamos usar um padrão de buscar as últimas 50 mensagens.
	limit := 50
	offset := 0

	msgs, err := h.chatUC.ListChat(r.Context(), contactID, limit, offset)
	if err != nil {
		response.Error(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.JSON(w, http.StatusOK, msgs)
}
