package sqlite

import (
	"context"
	"errors"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
	"gorm.io/gorm"
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

func (r *tagRepo) RemoveFromContact(ctx context.Context, contactID, tagID string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}

	contact := domain.Contact{ID: contactID}
	tag := domain.Tag{ID: tagID}

	return db.Model(&contact).Association("Tags").Delete(&tag)
}

func (r *tagRepo) GetByID(ctx context.Context, id string) (*domain.Tag, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var tag domain.Tag
	if err := db.First(&tag, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &tag, nil
}

func (r *tagRepo) AttachToContact(ctx context.Context, contactID string, tagID string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}

	contact := domain.Contact{ID: contactID}
	var tags []domain.Tag
	if err := db.Where("id IN ?", tagID).Find(&tags).Error; err != nil {
		return err
	}

	return db.Model(&contact).Association("Tags").Replace(tags)
}

func (r *tagRepo) AssignToContactAndMove(ctx context.Context, contactID, tagID, targetColumnID string) (*domain.TagAssignmentResult, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	result := &domain.TagAssignmentResult{TagID: tagID, ContactID: contactID, TargetColumnID: targetColumnID}
	err = db.Transaction(func(tx *gorm.DB) error {
		var contact domain.Contact
		if err := tx.First(&contact, "id = ?", contactID).Error; err != nil {
			return err
		}
		var tag domain.Tag
		if err := tx.First(&tag, "id = ?", tagID).Error; err != nil {
			return err
		}
		if err := tx.Model(&contact).Association("Tags").Append(&tag); err != nil {
			return err
		}

		if targetColumnID == "" {
			return nil
		}
		var column domain.KanbanColumn
		if err := tx.First(&column, "id = ?", targetColumnID).Error; err != nil {
			return err
		}
		var card domain.KanbanCard
		cardErr := tx.Where("contact_id = ?", contactID).First(&card).Error
		if errors.Is(cardErr, gorm.ErrRecordNotFound) {
			var first domain.KanbanColumn
			if err := tx.Order("position ASC").First(&first).Error; err != nil {
				return err
			}
			card = domain.KanbanCard{ContactID: contactID, ColumnID: first.ID, Position: 0}
			if err := tx.Create(&card).Error; err != nil {
				return err
			}
		} else if cardErr != nil {
			return cardErr
		}
		result.CardID = card.ID
		result.PreviousColumnID = card.ColumnID
		if card.ColumnID != targetColumnID {
			if err := tx.Model(&card).Updates(map[string]interface{}{"column_id": targetColumnID, "position": 0}).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return result, nil
}
