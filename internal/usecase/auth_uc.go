package usecase

import (
	"context"
	"errors"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/go-chi/jwtauth/v5"
	"golang.org/x/crypto/bcrypt"
)

type authUseCase struct {
	userRepo  domain.UserRepository
	tokenAuth *jwtauth.JWTAuth
}

func NewAuthUseCase(repo domain.UserRepository, tokenAuth *jwtauth.JWTAuth) domain.AuthUseCase {
	return &authUseCase{userRepo: repo, tokenAuth: tokenAuth}
}

func (uc *authUseCase) Authenticate(ctx context.Context, email, password string) (string, error) {
	user, err := uc.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return "", errors.New("credenciais inválidas")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return "", errors.New("credenciais inválidas")
	}

	// jwtauth cria e assina o token com os claims
	_, tokenString, err := uc.tokenAuth.Encode(map[string]interface{}{
		"sub":  user.ID,
		"role": user.Role,
	})

	return tokenString, err
}
