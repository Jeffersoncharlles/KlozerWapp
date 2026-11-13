package usecase

import (
	"context"
	"errors"
	"strings"

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
		if contact.Type == "" {
			contact.Type = "person"
		}
		// Se existir, atualiza nome ou avatar se vieram preenchidos e diferentes
		updated := false
		if name != "" && contact.Name != name && (contact.Name == "" || isGeneratedContactName(contact.Name)) {
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
		Type:      "person",
	}
	err = uc.repo.Create(ctx, newContact)
	return newContact, err
}

func (uc *contactUseCase) CreateManual(ctx context.Context, contact *domain.Contact) error {
	contact.Name = strings.TrimSpace(contact.Name)
	contact.Phone = strings.TrimSpace(contact.Phone)
	contact.Type = strings.ToLower(strings.TrimSpace(contact.Type))
	if contact.Type == "" {
		contact.Type = "person"
	}
	if contact.Name == "" || contact.Phone == "" {
		return errors.New("nome e telefone são obrigatórios")
	}
	if contact.Type != "person" && contact.Type != "group" {
		return errors.New("tipo de contato inválido")
	}
	return uc.repo.Create(ctx, contact)
}

func (uc *contactUseCase) Update(ctx context.Context, contact *domain.Contact) error {
	contact.Name = strings.TrimSpace(contact.Name)
	contact.Phone = strings.TrimSpace(contact.Phone)
	if contact.Name == "" || contact.Phone == "" {
		return errors.New("nome e telefone são obrigatórios")
	}
	return uc.repo.Update(ctx, contact)
}

func (uc *contactUseCase) ListFiltered(ctx context.Context, filter domain.ContactFilter) (*domain.ContactList, error) {
	return uc.repo.ListFiltered(ctx, filter)
}

func (uc *contactUseCase) Archive(ctx context.Context, id string, archived bool) error {
	if id == "" {
		return errors.New("id do contato é obrigatório")
	}
	return uc.repo.Archive(ctx, id, archived)
}

func (uc *contactUseCase) GetByPhone(ctx context.Context, phone string) (*domain.Contact, error) {
	return uc.repo.GetByPhone(ctx, phone)
}

func (uc *contactUseCase) GetByID(ctx context.Context, id string) (*domain.Contact, error) {
	return uc.repo.GetByID(ctx, id)
}

func (uc *contactUseCase) List(ctx context.Context) ([]domain.Contact, error) {
	return uc.repo.List(ctx)
}
