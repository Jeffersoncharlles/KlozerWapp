package usecase

import (
	"context"
	"errors"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type contactUseCase struct {
	repo domain.ContactRepository
}

func NewContactUseCase(r domain.ContactRepository) domain.ContactUseCase {
	return &contactUseCase{repo: r}
}

func (uc *contactUseCase) CreateOrUpdate(ctx context.Context, phone, name, avatarURL string) (*domain.Contact, error) {
	if phone == "" {
		return nil, errors.New("telefone é obrigatório")
	}

	// Verifica se já existe
	contact, err := uc.repo.GetByPhone(ctx, phone)
	if err == nil && contact != nil {
		// Se existir, atualiza nome ou avatar se vieram preenchidos e diferentes
		updated := false
		if name != "" && contact.Name != name {
			contact.Name = name
			updated = true
		}
		if avatarURL != "" && contact.AvatarURL != avatarURL {
			contact.AvatarURL = avatarURL
			updated = true
		}

		if updated {
			err = uc.repo.Update(ctx, contact)
		}
		return contact, err
	}

	// Se não existe, cria um novo
	newContact := &domain.Contact{
		Phone:     phone,
		Name:      name,
		AvatarURL: avatarURL,
	}
	err = uc.repo.Create(ctx, newContact)
	return newContact, err
}

func (uc *contactUseCase) GetByPhone(ctx context.Context, phone string) (*domain.Contact, error) {
	return uc.repo.GetByPhone(ctx, phone)
}

func (uc *contactUseCase) List(ctx context.Context) ([]domain.Contact, error) {
	return uc.repo.List(ctx)
}
