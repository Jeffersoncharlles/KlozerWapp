package handler

import (
	"context"
	"net/http"

	"github.com/go-chi/chi/v5"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/infra/sse" // Import do Broker
)

type SessionHandler struct {
	waGateway domain.WhatsAppGateway
	sseBroker *sse.Broker // O Wire vai injetar o Broker aqui!
	flows     domain.FlowUseCase
}

func NewSessionHandler(wa domain.WhatsAppGateway, sseBroker *sse.Broker, flows domain.FlowUseCase) *SessionHandler {
	handler := &SessionHandler{
		waGateway: wa,
		sseBroker: sseBroker,
		flows:     flows,
	}

	go func() {
		qrChan := wa.GetQRCodeChannel(context.Background())
		for qrString := range qrChan {
			// 👇 Se for a palavra mágica, manda um novo tópico para fechar a tela!
			if qrString == "CONNECTED" {
				sseBroker.Publish("connection_status", map[string]string{
					"status": "connected", // minúsculo, igual o isConnected() do React espera
				})
			} else {
				// Se não for, é só o texto do QR Code mesmo
				sseBroker.Publish("qr_code", map[string]string{
					"code": qrString,
				})
			}
		}
	}()

	return handler
}

func (h *SessionHandler) RegisterRoutes(r chi.Router) {
	r.Route("/sessions", func(r chi.Router) {
		r.Get("/automation", h.GetAutomation)
		r.Put("/automation", h.SetAutomation)
		r.Get("/status", h.Status)

		// Conecta o frontend via SSE usando o método ServeHTTP do Broker
		r.Get("/stream", h.sseBroker.ServeHTTP)

		// 👇 AS ROTAS QUE FALTAVAM 👇
		r.Post("/connect", h.Connect)
		r.Post("/disconnect", h.Disconnect)
	})
}

func (h *SessionHandler) GetAutomation(w http.ResponseWriter, r *http.Request) {
	id, err := h.flows.GetBinding(r.Context())
	if err != nil {
		flowError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"flowId": id})
}
func (h *SessionHandler) SetAutomation(w http.ResponseWriter, r *http.Request) {
	var req struct {
		FlowID string `json:"flowId"`
	}
	if !decodeFlow(w, r, &req) {
		return
	}
	if err := h.flows.BindFlow(r.Context(), req.FlowID); err != nil {
		flowError(w, err)
		return
	}
	response.JSON(w, http.StatusOK, map[string]string{"flowId": req.FlowID})
}

func (h *SessionHandler) Status(w http.ResponseWriter, r *http.Request) {
	status := h.waGateway.GetConnectionStatus(r.Context())
	response.JSON(w, http.StatusOK, map[string]string{"status": status})
}

func (h *SessionHandler) Connect(w http.ResponseWriter, r *http.Request) {
	err := h.waGateway.Connect(r.Context())
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Falha ao iniciar conexão: " + err.Error(),
		})
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "Processo de conexão iniciado. Aguarde o QR Code via SSE.",
	})
}

// Disconnect desloga o aparelho do WhatsApp (Remove a sessão).
func (h *SessionHandler) Disconnect(w http.ResponseWriter, r *http.Request) {
	err := h.waGateway.Disconnect(r.Context())
	if err != nil {
		response.JSON(w, http.StatusInternalServerError, map[string]string{
			"error": "Falha ao desconectar: " + err.Error(),
		})
		return
	}

	response.JSON(w, http.StatusOK, map[string]string{
		"message": "Sessão do WhatsApp desconectada com sucesso.",
	})
}
