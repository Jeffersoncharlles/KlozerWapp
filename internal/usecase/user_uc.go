package usecase

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"golang.org/x/crypto/bcrypt"
)

type userUseCase struct {
	repo domain.UserRepository
}

var validUserRoles = map[string]bool{"ADMIN": true, "ATTENDANT": true}

func NewUserUseCase(r domain.UserRepository) domain.UserUseCase {
	return &userUseCase{repo: r}
}

func (uc *userUseCase) Create(ctx context.Context, name, email, password, role string) (*domain.User, error) {
	name = strings.TrimSpace(name)
	email = strings.ToLower(strings.TrimSpace(email))
	role = strings.ToUpper(strings.TrimSpace(role))
	// 1. Validação básica de integridade
	if name == "" || email == "" || password == "" {
		return nil, errors.New("nome, e-mail e senha são campos obrigatórios")
	}

	if len(password) < 6 {
		return nil, errors.New("a senha deve ter pelo menos 6 caracteres")
	}

	if role == "" {
		role = "ATTENDANT"
	}
	if !validUserRoles[role] {
		return nil, errors.New("papel inválido: use ADMIN ou ATTENDANT")
	}

	// 2. REGRA DE NEGÓCIO: Trava de 3 usuários para a versão Community
	count, err := uc.repo.CountActiveUsers(ctx)
	if err != nil {
		return nil, fmt.Errorf("erro ao verificar limite de usuários: %w", err)
	}
	if count >= 3 {
		return nil, errors.New("limite de 3 usuários atingido na versão Community. Faça upgrade para adicionar mais atendentes")
	}

	// 3. Hash da senha
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

	// 4. Persiste no banco (O repo deve lidar com o erro de E-mail Duplicado)
	if err := uc.repo.Create(ctx, user); err != nil {
		return nil, err
	}
	return user, nil
}

func (uc *userUseCase) List(ctx context.Context) ([]domain.User, error) {
	return uc.repo.List(ctx)
}

// GetByID busca os dados de um usuário específico para o perfil
func (uc *userUseCase) GetByID(ctx context.Context, id string) (*domain.User, error) {
	if id == "" {
		return nil, errors.New("id do usuário é obrigatório")
	}
	return uc.repo.GetByID(ctx, id)
}

// Deactivate bloqueia o acesso de um atendente (Soft Delete)
func (uc *userUseCase) Deactivate(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("id do usuário é obrigatório")
	}
	user, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if user.Role == "ADMIN" && user.IsActive {
		count, err := uc.repo.CountActiveAdmins(ctx)
		if err != nil {
			return err
		}
		if count <= 1 {
			return errors.New("não é possível desativar o último administrador ativo")
		}
	}
	return uc.repo.UpdateStatus(ctx, id, false)
}

func (uc *userUseCase) Activate(ctx context.Context, id string) error {
	if id == "" {
		return errors.New("id do usuário é obrigatório")
	}
	user, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return err
	}
	if user.IsActive {
		return nil
	}
	count, err := uc.repo.CountActiveUsers(ctx)
	if err != nil {
		return err
	}
	if count >= 3 {
		return errors.New("limite de 3 usuários ativos atingido na versão Community")
	}
	return uc.repo.UpdateStatus(ctx, id, true)
}

// Update atualiza os dados do usuário. Se o e-mail for alterado, exige privilégios de ADMIN.
func (uc *userUseCase) Update(ctx context.Context, updaterRole, targetUserID, name, email, password, role string) (*domain.User, error) {
	// 1. Busca o usuário que será alterado
	user, err := uc.repo.GetByID(ctx, targetUserID)
	if err != nil {
		return nil, errors.New("usuário não encontrado")
	}

	// 2. REGRA DE NEGÓCIO: Alteração de e-mail
	email = strings.ToLower(strings.TrimSpace(email))
	role = strings.ToUpper(strings.TrimSpace(role))
	if email != "" && email != user.Email {
		if updaterRole != "ADMIN" {
			return nil, errors.New("acesso negado: apenas administradores podem alterar endereços de e-mail")
		}
		user.Email = email
	}
	if role != "" {
		if !validUserRoles[role] {
			return nil, errors.New("papel inválido: use ADMIN ou ATTENDANT")
		}
		if user.Role == "ADMIN" && role != "ADMIN" && user.IsActive {
			count, err := uc.repo.CountActiveAdmins(ctx)
			if err != nil {
				return nil, err
			}
			if count <= 1 {
				return nil, errors.New("não é possível remover o último administrador ativo")
			}
		}
		user.Role = role
	}

	// 3. Atualiza Nome (Livre para o próprio usuário ou admin)
	if name != "" {
		user.Name = name
	}

	// 4. Atualiza Senha, se fornecida
	if password != "" {
		if len(password) < 6 {
			return nil, errors.New("a nova senha deve ter pelo menos 6 caracteres")
		}
		hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return nil, errors.New("erro ao criptografar a nova senha")
		}
		user.PasswordHash = string(hash)
	}

	// 5. Persiste as alterações no banco de dados
	if err := uc.repo.Update(ctx, user); err != nil {
		return nil, err
	}

	return user, nil
}
