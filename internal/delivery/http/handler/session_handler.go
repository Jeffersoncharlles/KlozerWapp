package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/infra/sse" // Import do Broker
)

type SessionHandler struct {
	waGateway domain.WhatsAppGateway
	sseBroker *sse.Broker // O Wire vai injetar o Broker aqui!
}

func NewSessionHandler(wa domain.WhatsAppGateway, sseBroker *sse.Broker) *SessionHandler {
	return &SessionHandler{
		waGateway: wa,
		sseBroker: sseBroker,
	}
}

func (h *SessionHandler) RegisterRoutes(r chi.Router) {
	r.Route("/sessions", func(r chi.Router) {
		r.Get("/status", h.Status)

		// Conecta o frontend via SSE usando o método ServeHTTP do Broker
		r.Get("/stream", h.sseBroker.ServeHTTP)
	})
}

func (h *SessionHandler) Status(w http.ResponseWriter, r *http.Request) {
	status := h.waGateway.GetConnectionStatus(r.Context())
	response.JSON(w, http.StatusOK, map[string]string{"status": status})
}
