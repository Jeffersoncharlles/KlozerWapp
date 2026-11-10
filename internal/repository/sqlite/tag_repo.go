package sqlite

import (
	"context"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
)

type tagRepo struct {
	provider repository.GormProvider
}

func NewTagRepository(p repository.GormProvider) domain.TagRepository {
	return &tagRepo{provider: p}
}

func (r *tagRepo) Create(ctx context.Context, tag *domain.Tag) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Create(tag).Error
}

func (r *tagRepo) List(ctx context.Context) ([]domain.Tag, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var tags []domain.Tag
	if err := db.Order("name ASC").Find(&tags).Error; err != nil {
		return nil, err
	}
	return tags, nil
}

func (r *tagRepo) Delete(ctx context.Context, id string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Delete(&domain.Tag{}, "id = ?", id).Error
}

func (r *tagRepo) AssignToContact(ctx context.Context, tagID, contactID string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}

	contact := domain.Contact{ID: contactID}
	tag := domain.Tag{ID: tagID}

	// GORM gerencia a tabela pivot automaticamente
	return db.Model(&contact).Association("Tags").Append(&tag)
}

func (r *tagRepo) RemoveFromContact(ctx context.Context, tagID, contactID string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}

	contact := domain.Contact{ID: contactID}
	tag := domain.Tag{ID: tagID}

	return db.Model(&contact).Association("Tags").Delete(&tag)
}
