package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/config"
)

func main() {
	// 1. Configura o Logger estruturado (nativo do Go 1.21+)
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	slog.Info("iniciando sistema de CRM...")

	// 2. Carrega as variáveis de ambiente e limites (Viper)
	cfg, err := config.Load()
	if err != nil {
		slog.Error("erro fatal ao carregar configurações", "err", err)
		os.Exit(1)
	}

	// 3. Injeta todas as dependências geradas pelo Google Wire
	// Gere os providers com: go run github.com/google/wire/cmd/wire@v0.7.0 ./cmd
	app, cleanup, err := InitializeApp(cfg)
	if err != nil {
		slog.Error("erro fatal ao inicializar injecao de dependencias", "err", err)
		os.Exit(1)
	}
	defer cleanup()

	// 4. Configura o Servidor HTTP com regras de Timeout (Proteção contra Slowloris)
	srv := &http.Server{
		Addr:        ":" + cfg.Port,
		Handler:     app.Router, // Agora pega o router de dentro do App
		ReadTimeout: 15 * time.Second,
		// WriteTimeout: 15 * time.Second,
		IdleTimeout: 60 * time.Second,
	}

	// 5. Inicia o servidor em uma goroutine separada para não bloquear o fluxo
	serveErrors := make(chan error, 1)
	go func() {
		slog.Info("🚀 Servidor HTTP online", "url", "http://localhost:"+cfg.Port+"/v1/api")
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			serveErrors <- err
		}
	}()

	// 6. Graceful Shutdown: Canal aguardando sinal de interrupção (Ctrl+C, Docker stop)
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(quit)
	select {
	case <-quit:
	case err := <-serveErrors:
		slog.Error("falha critica no servidor HTTP", "err", err)
		return // Deferred cleanup still stops workers/client and closes SQLite.
	}

	slog.Info("sinal de desligamento recebido. Encerrando processos graciosamente...")

	// Dá um prazo de 10 segundos para requisições em andamento terminarem
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("erro ao forçar desligamento do servidor HTTP", "err", err)
	}

	slog.Info("servidor encerrado com segurança.")
}
