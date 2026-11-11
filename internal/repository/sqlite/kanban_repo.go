package sqlite

import (
	"context"
	"errors"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
	"gorm.io/gorm"
)

type kanbanRepo struct {
	provider repository.GormProvider
}

func NewKanbanRepository(p repository.GormProvider) domain.KanbanRepository {
	return &kanbanRepo{provider: p}
}

func (r *kanbanRepo) CreateColumn(ctx context.Context, col *domain.KanbanColumn) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Create(col).Error
}

func (r *kanbanRepo) ListColumnsWithCards(ctx context.Context) ([]domain.KanbanColumn, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var columns []domain.KanbanColumn
	err = db.Preload("Cards", func(db *gorm.DB) *gorm.DB {
		return db.Order("position ASC").Preload("Contact").Preload("Assignee")
	}).Order("position ASC").Find(&columns).Error
	if err != nil {
		return nil, err
	}
	return columns, nil
}

func (r *kanbanRepo) CreateCard(ctx context.Context, card *domain.KanbanCard) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Create(card).Error
}

func (r *kanbanRepo) MoveCard(ctx context.Context, cardID, targetColumnID string, newPosition int) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}

	return db.Model(&domain.KanbanCard{}).Where("id = ?", cardID).
		Updates(map[string]interface{}{
			"column_id": targetColumnID,
			"position":  newPosition,
		}).Error
}

func (r *kanbanRepo) GetCardByContactID(ctx context.Context, contactID string) (*domain.KanbanCard, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var card domain.KanbanCard
	if err := db.Where("contact_id = ?", contactID).First(&card).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("card não encontrado para este contato")
		}
		return nil, err
	}
	return &card, nil
}

func (r *kanbanRepo) AssignUserToCard(ctx context.Context, cardID, userID string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}

	return db.Model(&domain.KanbanCard{}).Where("id = ?", cardID).Update("assigned_to_user_id", userID).Error
}

func (r *kanbanRepo) GetFirstColumn(ctx context.Context) (*domain.KanbanColumn, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var col domain.KanbanColumn
	// Ordena pela posição crescente (0, 1, 2...) e pega a primeira
	err = db.Order("position ASC").First(&col).Error
	if err != nil {
		return nil, err
	}
	return &col, nil
}
