package handler

import (
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/infra/sse"
	"github.com/go-chi/chi/v5"
)

type ConversationHandler struct {
	chatUC domain.ChatUseCase
	broker *sse.Broker
}

func NewConversationHandler(chatUC domain.ChatUseCase, broker *sse.Broker) *ConversationHandler {
	return &ConversationHandler{chatUC: chatUC, broker: broker}
}

func (h *ConversationHandler) RegisterRoutes(r chi.Router) {
	r.Get("/conversations", h.List)
	r.Get("/conversations/stream", h.Stream)
}

func (h *ConversationHandler) List(w http.ResponseWriter, r *http.Request) {
	conversations, err := h.chatUC.ListConversations(r.Context())
	if err != nil {
		response.Error(w, http.StatusInternalServerError, "não foi possível carregar as conversas")
		return
	}
	response.JSON(w, http.StatusOK, conversations)
}

func (h *ConversationHandler) Stream(w http.ResponseWriter, r *http.Request) {
	h.broker.ServeHTTP(w, r)
}
