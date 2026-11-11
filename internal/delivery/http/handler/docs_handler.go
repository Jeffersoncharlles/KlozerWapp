package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
)

type DocsHandler struct{}

func NewDocsHandler() *DocsHandler {
	return &DocsHandler{}
}

func (h *DocsHandler) RegisterRoutes(r chi.Router) {
	// ATENÇÃO: Estas rotas devem ficar PÚBLICAS (fora do middleware JWT)
	r.Get("/docs", h.ScalarUI)
	r.Get("/swagger.json", h.SwaggerJSON)
}

// ScalarUI renderiza a interface moderna do Scalar via CDN
func (h *DocsHandler) ScalarUI(w http.ResponseWriter, r *http.Request) {
	html := `<!doctype html>
<html>
  <head>
    <title>KlozerWapp API - Referência</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>body { margin: 0; padding: 0; }</style>
  </head>
  <body>
    <!-- Aponta para a rota do seu swagger.json -->
    <script id="api-reference" data-url="/swagger.json"></script>
    
    <!-- Carrega o motor do Scalar -->
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Write([]byte(html))
}

// SwaggerJSON serve o arquivo JSON gerado pelo Swaggo
func (h *DocsHandler) SwaggerJSON(w http.ResponseWriter, r *http.Request) {
	// Serve o arquivo físico gerado na pasta docs/ na raiz do projeto
	http.ServeFile(w, r, "docs/swagger.json")
}