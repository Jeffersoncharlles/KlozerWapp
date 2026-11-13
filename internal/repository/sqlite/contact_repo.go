package sqlite

import (
	"context"
	"errors"
	"strings"
	"time"

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
	if err := db.Preload("Tags").Where("archived_at IS NULL").Order("updated_at DESC").Find(&contacts).Error; err != nil {
		return nil, err
	}
	for i := range contacts {
		if contacts[i].Type == "" {
			contacts[i].Type = "person"
		}
	}
	return contacts, nil
}

func (r *contactRepo) ListFiltered(ctx context.Context, filter domain.ContactFilter) (*domain.ContactList, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 || filter.Limit > 100 {
		filter.Limit = 25
	}
	query := db.Model(&domain.Contact{})
	if filter.Archived != "all" {
		if filter.Archived == "true" {
			query = query.Where("archived_at IS NOT NULL")
		} else {
			query = query.Where("archived_at IS NULL")
		}
	}
	if filter.Type != "" && filter.Type != "all" {
		query = query.Where("type = ?", filter.Type)
	}
	if search := strings.TrimSpace(filter.Search); search != "" {
		like := "%" + search + "%"
		query = query.Where("name LIKE ? OR phone LIKE ?", like, like)
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, err
	}
	var contacts []domain.Contact
	if err := query.Preload("Tags").Order("updated_at DESC").Offset((filter.Page - 1) * filter.Limit).Limit(filter.Limit).Find(&contacts).Error; err != nil {
		return nil, err
	}
	for i := range contacts {
		if contacts[i].Type == "" {
			contacts[i].Type = "person"
		}
	}
	var people, groups int64
	if err := db.Model(&domain.Contact{}).Where("archived_at IS NULL AND (type = ? OR type = '')", "person").Count(&people).Error; err != nil {
		return nil, err
	}
	if err := db.Model(&domain.Contact{}).Where("archived_at IS NULL AND type = ?", "group").Count(&groups).Error; err != nil {
		return nil, err
	}
	return &domain.ContactList{Items: contacts, Total: total, People: people, Groups: groups, Page: filter.Page, Limit: filter.Limit}, nil
}

func (r *contactRepo) Archive(ctx context.Context, id string, archived bool) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	var archivedAt *time.Time
	if archived {
		now := time.Now().UTC()
		archivedAt = &now
	}
	result := db.Model(&domain.Contact{}).Where("id = ?", id).Update("archived_at", archivedAt)
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return errors.New("contato não encontrado")
	}
	return nil
}
