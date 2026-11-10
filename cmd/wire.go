//go:build wireinject
// +build wireinject

package main

import (
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/infra/sse"
	"github.com/go-chi/jwtauth/v5"
	"github.com/google/wire"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/config"
	deliveryHttp "github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/handler"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/infra/whatsapp"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository/sqlite"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/usecase"
)

// ==============================================================================
// PROVIDERS AUXILIARES
// ==============================================================================

// ProvideJWTAuth cria a instância do jwtauth usando o segredo do .env
func ProvideJWTAuth(cfg *config.Config) *jwtauth.JWTAuth {
	return jwtauth.New("HS256", []byte(cfg.JWTSecret), nil)
}

// ==============================================================================
// SETS DO GOOGLE WIRE (Agrupamento por Camadas)
// ==============================================================================

var ConfigSet = wire.NewSet(
	ProvideJWTAuth,
)

var InfraWhatsAppSet = wire.NewSet(
	whatsapp.ProvideWhatsmeowClient,
	whatsapp.NewWhatsAppManager,
	whatsapp.NewWhatsAppListener,
)

var InfraSSESet = wire.NewSet(
	sse.NewBroker,
	wire.Bind(new(domain.Broker), new(*sse.Broker)),
)

var RepositorySet = wire.NewSet(
	sqlite.NewGormProvider,
	sqlite.NewUserRepository,
	sqlite.NewKanbanRepository,
	sqlite.NewMessageRepository,
	sqlite.NewQuickReplyRepository,
	sqlite.NewTagRepository,
	sqlite.NewContactRepository,
	sqlite.NewFlowRepository,
	sqlite.NewQueueRepository,
	sqlite.NewReportRepository,
	sqlite.NewCampaignRepository,
	sqlite.NewCallRepository,
)

var UseCaseSet = wire.NewSet(
	usecase.NewAuthUseCase,
	usecase.NewUserUseCase,
	usecase.NewKanbanUseCase,
	usecase.NewChatUseCase,
	usecase.NewQuickReplyUseCase,
	usecase.NewAutoReplyUseCase,
	usecase.NewContactUseCase,
	usecase.NewTagUseCase,
	usecase.NewFlowUseCase,
	usecase.NewQueueUseCase,
	usecase.NewReportUseCase,
	usecase.NewCampaignUseCase,
	usecase.NewCallUseCase,
)

var HandlerSet = wire.NewSet(
	handler.NewAuthHandler,
	handler.NewKanbanHandler,
	handler.NewMessageHandler,
	handler.NewQuickReplyHandler,
	handler.NewTagHandler,
	handler.NewSessionHandler,
	handler.NewFlowHandler,
	handler.NewQueueHandler,
	handler.NewReportHandler,
	handler.NewCampaignHandler,
	handler.NewCallHandler,
	wire.Struct(new(deliveryHttp.RouterHandlers), "*"),
)

// ==============================================================================
// AGRUPADOR DA APLICAÇÃO
// ==============================================================================

// App agrupa os serviços principais que precisam ficar rodando
type App struct {
	Router   http.Handler
	Listener *whatsapp.WhatsAppListener
}

func NewApp(router http.Handler, listener *whatsapp.WhatsAppListener) *App {
	return &App{
		Router:   router,
		Listener: listener,
	}
}

// ==============================================================================
// INJETOR DO WIRE
// ==============================================================================

// Agora retornamos apenas o *App e o error
func InitializeApp(cfg *config.Config) (*App, error) {
	wire.Build(
		ConfigSet,
		InfraWhatsAppSet,
		InfraSSESet,
		RepositorySet,
		UseCaseSet,
		HandlerSet,
		deliveryHttp.NewRouter,
		NewApp, // Ensina o Wire a construir a struct App
	)
	return nil, nil
}
