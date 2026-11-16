package sqlite

import (
	"context"
	"errors"
	"time"

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
		return db.Where("is_active = ?", true).Order("position ASC").Preload("Contact").Preload("Assignee")
	}).Order("position ASC").Find(&columns).Error
	if err != nil {
		return nil, err
	}
	return columns, nil
}

func (r *kanbanRepo) GetCardByID(ctx context.Context, cardID string) (*domain.KanbanCard, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var card domain.KanbanCard
	if err := db.Preload("Contact").Preload("Assignee").First(&card, "id = ?", cardID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrCardNotFound
		}
		return nil, err
	}
	return &card, nil
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

func (r *kanbanRepo) MoveCardAs(ctx context.Context, cardID, targetColumnID string, newPosition int, actorID, actorRole string) (*domain.KanbanCard, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var card domain.KanbanCard
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&card, "id = ?", cardID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return domain.ErrCardNotFound
			}
			return err
		}
		if !card.IsActive {
			return domain.ErrCardFinished
		}
		if actorRole != "ADMIN" && (card.AssignedToUserID == nil || *card.AssignedToUserID != actorID) {
			return domain.ErrForbidden
		}
		var column domain.KanbanColumn
		if err := tx.First(&column, "id = ?", targetColumnID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return domain.ErrColumnNotFound
			}
			return err
		}
		from := card.ColumnID
		if err := tx.Model(&card).Updates(map[string]interface{}{"column_id": targetColumnID, "position": newPosition}).Error; err != nil {
			return err
		}
		if from != targetColumnID {
			if err := tx.Create(&domain.AttendanceEvent{CardID: card.ID, ContactID: card.ContactID, ActorUserID: &actorID, Type: "column_changed", FromColumnID: &from, ToColumnID: &targetColumnID}).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return r.GetCardByID(ctx, cardID)
}

func (r *kanbanRepo) GetCardByContactID(ctx context.Context, contactID string) (*domain.KanbanCard, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var card domain.KanbanCard
	if err := db.Where("contact_id = ? AND is_active = ?", contactID, true).First(&card).Error; err != nil {
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

func (r *kanbanRepo) AssignQueueToCard(ctx context.Context, cardID, queueID, origin string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Model(&domain.KanbanCard{}).Where("id = ?", cardID).Updates(map[string]interface{}{"queue_id": queueID, "assignment_origin": origin}).Error
}

func (r *kanbanRepo) TakeAttendance(ctx context.Context, cardID, actorID, actorRole string) (*domain.KanbanCard, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var card domain.KanbanCard
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&card, "id = ?", cardID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return domain.ErrCardNotFound
			}
			return err
		}
		if !card.IsActive {
			return domain.ErrCardFinished
		}
		if card.AssignedToUserID != nil && *card.AssignedToUserID != actorID && actorRole != "ADMIN" {
			return domain.ErrForbidden
		}
		if card.AssignedToUserID == nil || *card.AssignedToUserID != actorID {
			if err := tx.Model(&card).Update("assigned_to_user_id", actorID).Error; err != nil {
				return err
			}
			if err := tx.Create(&domain.AttendanceEvent{CardID: card.ID, ContactID: card.ContactID, ActorUserID: &actorID, Type: "attendance_taken"}).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return r.GetCardByID(ctx, cardID)
}

func (r *kanbanRepo) FinishAttendance(ctx context.Context, cardID, actorID, actorRole string) (*domain.KanbanCard, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var card domain.KanbanCard
	err = db.Transaction(func(tx *gorm.DB) error {
		if err := tx.First(&card, "id = ?", cardID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return domain.ErrCardNotFound
			}
			return err
		}
		if actorRole != "ADMIN" && (card.AssignedToUserID == nil || *card.AssignedToUserID != actorID) {
			return domain.ErrForbidden
		}
		if !card.IsActive {
			return nil
		}
		now := time.Now().UTC()
		if err := tx.Model(&card).Updates(map[string]interface{}{"is_active": false, "finished_at": now, "finished_by_user_id": actorID}).Error; err != nil {
			return err
		}
		return tx.Create(&domain.AttendanceEvent{CardID: card.ID, ContactID: card.ContactID, ActorUserID: &actorID, Type: "attendance_finished"}).Error
	})
	if err != nil {
		return nil, err
	}
	return r.GetCardByID(ctx, cardID)
}

func (r *kanbanRepo) ListAttendanceEvents(ctx context.Context, cardID string, limit, offset int) ([]domain.AttendanceEvent, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}
	var card domain.KanbanCard
	if err := db.First(&card, "id = ?", cardID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrCardNotFound
		}
		return nil, err
	}
	var events []domain.AttendanceEvent
	if err := db.Preload("Actor").Where("card_id = ?", cardID).Order("created_at ASC, id ASC").Limit(limit).Offset(offset).Find(&events).Error; err != nil {
		return nil, err
	}
	return events, nil
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

func (r *kanbanRepo) GetColumnByID(ctx context.Context, id string) (*domain.KanbanColumn, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var column domain.KanbanColumn
	if err := db.First(&column, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &column, nil
}
