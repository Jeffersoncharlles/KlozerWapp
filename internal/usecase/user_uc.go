package usecase

import (
	"context"
	"errors"
	"fmt"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"golang.org/x/crypto/bcrypt"
)

type userUseCase struct {
	repo domain.UserRepository
}

// O Google Wire vai usar este construtor
func NewUserUseCase(r domain.UserRepository) domain.UserUseCase {
	return &userUseCase{repo: r}
}

func (uc *userUseCase) Create(ctx context.Context, name, email, password, role string) (*domain.User, error) {
	// 1. REGRA DE NEGÓCIO: Trava de 3 usuários para a versão Community
	count, err := uc.repo.CountActiveUsers(ctx)
	if err != nil {
		return nil, fmt.Errorf("erro ao verificar limite de usuários: %w", err)
	}
	if count >= 3 {
		return nil, errors.New("limite de 3 usuários atingido na versão Community. Faça upgrade para adicionar mais atendentes")
	}

	// 2. Hash da senha
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("erro ao criptografar senha")
	}

	user := &domain.User{
		Name:         name,
		Email:        email,
		PasswordHash: string(hash),
		Role:         role,
		IsActive:     true,
	}

	// 3. Persiste no banco
	if err := uc.repo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (uc *userUseCase) List(ctx context.Context) ([]domain.User, error) {
	return uc.repo.List(ctx)
}
