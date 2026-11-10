package sqlite

import (
	"context"
	"errors"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
	"gorm.io/gorm"
)

type contactRepo struct {
	provider repository.GormProvider
}

func NewContactRepository(p repository.GormProvider) domain.ContactRepository {
	return &contactRepo{provider: p}
}

func (r *contactRepo) Create(ctx context.Context, contact *domain.Contact) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Create(contact).Error
}

func (r *contactRepo) Update(ctx context.Context, contact *domain.Contact) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Save(contact).Error
}

func (r *contactRepo) GetByID(ctx context.Context, id string) (*domain.Contact, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var contact domain.Contact
	if err := db.Preload("Tags").First(&contact, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("contato não encontrado")
		}
		return nil, err
	}
	return &contact, nil
}

func (r *contactRepo) GetByPhone(ctx context.Context, phone string) (*domain.Contact, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var contact domain.Contact
	if err := db.Preload("Tags").Where("phone = ?", phone).First(&contact).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("contato não encontrado")
		}
		return nil, err
	}
	return &contact, nil
}

func (r *contactRepo) List(ctx context.Context) ([]domain.Contact, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var contacts []domain.Contact
	if err := db.Preload("Tags").Order("updated_at DESC").Find(&contacts).Error; err != nil {
		return nil, err
	}
	return contacts, nil
}
