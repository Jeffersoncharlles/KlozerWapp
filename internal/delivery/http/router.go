package http

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/handler"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/middleware"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
)

// RouterHandlers agrupa todos os controllers. Injetado pelo Wire!
type RouterHandlers struct {
	Auth       *handler.AuthHandler
	Kanban     *handler.KanbanHandler
	Message    *handler.MessageHandler
	QuickReply *handler.QuickReplyHandler
	Tag        *handler.TagHandler
	Session    *handler.SessionHandler
	Flow       *handler.FlowHandler
	Queue      *handler.QueueHandler
	Report     *handler.ReportHandler
	Campaign   *handler.CampaignHandler
	Call       *handler.CallHandler
}

// Note que agora injetamos o tokenAuth (*jwtauth.JWTAuth) gerado pelo Wire
func NewRouter(h RouterHandlers, tokenAuth *jwtauth.JWTAuth) http.Handler {
	r := chi.NewRouter()

	// 1. Middlewares Globais de Segurança e Log
	r.Use(chiMiddleware.RequestID)
	r.Use(chiMiddleware.RealIP)
	r.Use(chiMiddleware.Logger)
	r.Use(chiMiddleware.Recoverer)
	r.Use(chiMiddleware.Timeout(60 * time.Second))

	// CORS para o frontend em React Router conseguir chamar a API
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5173", "http://localhost:3002"}, // Vite/Next
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		response.JSON(w, http.StatusOK, map[string]string{"status": "online"})
	})

	// ==========================================
	// 2. ROOT GROUP: /v1/api
	// ==========================================
	r.Route("/v1/api", func(r chi.Router) {
		// 2.1 Rotas Públicas
		r.Group(func(r chi.Router) {
			h.Auth.RegisterRoutes(r) // POST /v1/api/auth/login
		})

		// 2.2 Rotas Autenticadas (Atendentes do CRM)
		r.Group(func(r chi.Router) {
			// Middlewares nativos do jwtauth para validar o token
			r.Use(jwtauth.Verifier(tokenAuth))
			r.Use(jwtauth.Authenticator(tokenAuth))

			h.Kanban.RegisterRoutes(r)     // /v1/api/kanban/*
			h.Message.RegisterRoutes(r)    // /v1/api/messages/*
			h.QuickReply.RegisterRoutes(r) // /v1/api/quick-replies/*
			h.Tag.RegisterRoutes(r)        // /v1/api/tags/*
			h.Flow.RegisterRoutes(r)       // /v1/api/flows/*
			h.Queue.RegisterRoutes(r)      // /v1/api/queues/*
			h.Report.RegisterRoutes(r)     // /v1/api/reports/*
			h.Campaign.RegisterRoutes(r)   // /v1/api/campaigns/*
			h.Call.RegisterRoutes(r)       // /v1/api/calls/*
		})

		// 2.3 Rotas Restritas (Apenas ADMIN)
		r.Group(func(r chi.Router) {
			r.Use(jwtauth.Verifier(tokenAuth))
			r.Use(jwtauth.Authenticator(tokenAuth))
			r.Use(middleware.RequireAdmin) // Nosso middleware para checar a role "ADMIN"

			// Ex: Somente o dono/admin da clínica/loja pode ler o QR Code ou derrubar a sessão
			h.Session.RegisterRoutes(r) // /v1/api/sessions/*
		})
	})

	return r
}
