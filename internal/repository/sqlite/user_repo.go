package sqlite

import (
	"context"
	"errors"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"

	"gorm.io/gorm"
)

type userRepo struct {
	provider repository.GormProvider
}

func NewUserRepository(p repository.GormProvider) domain.UserRepository {
	return &userRepo{provider: p}
}

func (r *userRepo) Create(ctx context.Context, user *domain.User) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Create(user).Error
}

func (r *userRepo) GetByID(ctx context.Context, id string) (*domain.User, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var user domain.User
	if err := db.First(&user, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("usuário não encontrado")
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) GetByEmail(ctx context.Context, email string) (*domain.User, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var user domain.User
	if err := db.Where("email = ?", email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("usuário não encontrado")
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepo) List(ctx context.Context) ([]domain.User, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var users []domain.User
	if err := db.Find(&users).Error; err != nil {
		return nil, err
	}
	return users, nil
}

func (r *userRepo) CountActiveUsers(ctx context.Context) (int64, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return 0, err
	}

	var count int64
	if err := db.Model(&domain.User{}).Where("is_active = ?", true).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}
