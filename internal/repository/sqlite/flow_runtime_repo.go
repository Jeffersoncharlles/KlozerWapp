package sqlite

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func (r *flowRepository) Receive(ctx context.Context, event domain.FlowIncoming) (bool, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return false, err
	}
	raw, err := json.Marshal(event)
	if err != nil {
		return false, err
	}
	result := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&flowInbox{ID: event.ID, Document: string(raw)})
	return result.RowsAffected == 1, result.Error
}
func (r *flowRepository) Pending(ctx context.Context) ([]domain.FlowIncoming, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var rows []flowInbox
	if err := db.Where("done=?", false).Order("created_at,id").Limit(50).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := []domain.FlowIncoming{}
	for _, row := range rows {
		var e domain.FlowIncoming
		if err := json.Unmarshal([]byte(row.Document), &e); err != nil {
			return nil, err
		}
		out = append(out, e)
	}
	return out, nil
}
func (r *flowRepository) Complete(ctx context.Context, id string, triggered bool) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Model(&flowInbox{}).Where("id=?", id).Updates(map[string]any{"done": true, "triggered": triggered}).Error
}
func decodeSession(row flowSessionRecord) (*domain.FlowSession, error) {
	s := &domain.FlowSession{ID: row.ID, FlowID: row.FlowID, Version: row.Version, ConnectionID: row.ConnectionID, ChatID: row.ChatID, Phone: row.Phone, NodeID: row.NodeID, State: row.State, WakeAt: row.WakeAt, Transitions: row.Transitions, Variables: map[string]string{}}
	err := json.Unmarshal([]byte(row.Variables), &s.Variables)
	return s, err
}
func (r *flowRepository) Session(ctx context.Context, e domain.FlowIncoming) (*domain.FlowSession, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var row flowSessionRecord
	err = db.Where("connection_id=? AND chat_id=? AND state IN ?", e.ConnectionID, e.ChatID, []string{"running", "waiting", "sleeping", "transferred"}).First(&row).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return decodeSession(row)
}
func (r *flowRepository) Published(ctx context.Context, id string, version int64) (*domain.Flow, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var live conversationFlow
	if err := db.First(&live, "id=? AND deleted=? AND enabled=?", id, false, true).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	var v flowVersion
	if err := db.First(&v, "flow_id=? AND revision=?", id, version).Error; err != nil {
		return nil, err
	}
	var f domain.Flow
	err = json.Unmarshal([]byte(v.Document), &f)
	return &f, err
}
func (r *flowRepository) BoundPublished(ctx context.Context) (*domain.Flow, error) {
	id, err := r.GetBinding(ctx)
	if err != nil || id == "" {
		return nil, err
	}
	f, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if !f.Enabled || f.PublishedRevision == 0 {
		return nil, nil
	}
	return r.Published(ctx, id, f.PublishedRevision)
}
func (r *flowRepository) SaveSession(ctx context.Context, s *domain.FlowSession, effects []domain.FlowEffect) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	raw, err := json.Marshal(s.Variables)
	if err != nil {
		return err
	}
	return db.Transaction(func(tx *gorm.DB) error {
		// Recheck operational state inside the write transaction: disabling or
		// deleting a flow must not be undone by a worker saving stale state.
		var live conversationFlow
		if err := tx.First(&live, "id=? AND deleted=? AND enabled=?", s.FlowID, false, true).Error; err != nil {
			return err
		}
		row := flowSessionRecord{ID: s.ID, FlowID: s.FlowID, Version: s.Version, ConnectionID: s.ConnectionID, ChatID: s.ChatID, Phone: s.Phone, NodeID: s.NodeID, State: s.State, Variables: string(raw), WakeAt: s.WakeAt, Transitions: s.Transitions}
		if err := tx.Save(&row).Error; err != nil {
			return err
		}
		if s.State == "cancelled" || s.State == "transferred" {
			if err := tx.Where("session_id=? AND sent=?", s.ID, false).Delete(&flowOutbox{}).Error; err != nil {
				return err
			}
		}
		for _, e := range effects {
			if err := tx.Clauses(clause.OnConflict{DoNothing: true}).Create(&flowOutbox{ID: e.ID, SessionID: s.ID, Phone: e.Phone, Text: e.Text}).Error; err != nil {
				return err
			}
		}
		if s.EventID != "" {
			return tx.Model(&flowInbox{}).Where("id=?", s.EventID).Updates(map[string]any{"done": true, "triggered": true}).Error
		}
		return nil
	})
}
func (r *flowRepository) Due(ctx context.Context, now time.Time) ([]domain.FlowSession, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var rows []flowSessionRecord
	if err := db.Where("state IN ? AND wake_at<=?", []string{"waiting", "sleeping"}, now).Order("wake_at,id").Limit(50).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := []domain.FlowSession{}
	for _, row := range rows {
		s, err := decodeSession(row)
		if err != nil {
			return nil, err
		}
		out = append(out, *s)
	}
	return out, nil
}
func (r *flowRepository) Effects(ctx context.Context) ([]domain.FlowEffect, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var rows []flowOutbox
	// A failed effect blocks later effects of the same session, including
	// after exhausting retries. Messages must never overtake each other.
	if err := db.Where("sent=? AND attempts<5", false).
		Where(`NOT EXISTS (SELECT 1 FROM flow_outboxes earlier WHERE earlier.session_id=flow_outboxes.session_id AND earlier.sent=0 AND (earlier.created_at<flow_outboxes.created_at OR (earlier.created_at=flow_outboxes.created_at AND earlier.id<flow_outboxes.id)))`).
		Order("created_at,id").Limit(50).Find(&rows).Error; err != nil {
		return nil, err
	}
	out := []domain.FlowEffect{}
	for _, row := range rows {
		out = append(out, domain.FlowEffect{ID: row.ID, SessionID: row.SessionID, Phone: row.Phone, Text: row.Text, Attempts: row.Attempts})
	}
	return out, nil
}
func (r *flowRepository) FinishEffect(ctx context.Context, id string, sent bool) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Model(&flowOutbox{}).Where("id=?", id).Updates(map[string]any{"attempts": gorm.Expr("attempts+1"), "sent": sent}).Error
}
