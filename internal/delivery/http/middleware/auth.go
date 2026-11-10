package middleware

import (
	"net/http"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/delivery/http/response"
	"github.com/go-chi/jwtauth/v5"
)

// As chaves para injetar informações no contexto de forma segura (se precisar fora do jwtauth)
type contextKey string

const (
	UserIDKey   contextKey = "user_id"
	UserRoleKey contextKey = "user_role"
)

// RequireAdmin deve ser usado em grupos onde jwtauth.Authenticator já foi acionado
func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// O jwtauth extrai as informações do token já parseado
		_, claims, _ := jwtauth.FromContext(r.Context())

		role, ok := claims["role"].(string)
		if !ok || role != "ADMIN" {
			response.Error(w, http.StatusForbidden, "acesso negado: requer privilégios de administrador")
			return
		}

		next.ServeHTTP(w, r)
	})
}
