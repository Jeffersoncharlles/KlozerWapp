package sqlite

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
	"gorm.io/gorm"
)

// Persistence models stay here: the domain does not depend on GORM.
type conversationFlow struct {
	ID                string `gorm:"primaryKey"`
	Name              string
	Kind              string `gorm:"index"`
	Enabled           bool
	Revision          int64
	PublishedRevision int64
	Steps             int
	Keywords          string
	Document          string
	Deleted           bool `gorm:"index"`
}
type flowVersion struct {
	FlowID   string `gorm:"primaryKey"`
	Revision int64  `gorm:"primaryKey"`
	Document string
}
type flowBinding struct {
	ID     int `gorm:"primaryKey"`
	FlowID string
}
type flowSessionRecord struct {
	ID           string `gorm:"primaryKey"`
	FlowID       string `gorm:"index"`
	Version      int64
	ConnectionID string `gorm:"index:session_conversation"`
	ChatID       string `gorm:"index:session_conversation"`
	Phone        string
	NodeID       string
	State        string `gorm:"index"`
	Variables    string
	WakeAt       *time.Time `gorm:"index"`
	Transitions  int
}
type flowInbox struct {
	ID        string `gorm:"primaryKey"`
	Document  string
	Done      bool `gorm:"index"`
	Triggered bool
	CreatedAt time.Time
}
type flowOutbox struct {
	ID        string `gorm:"primaryKey"`
	SessionID string `gorm:"index"`
	Phone     string
	Text      string
	Attempts  int
	Sent      bool `gorm:"index"`
	CreatedAt time.Time
}

func (flowOutbox) TableName() string { return "flow_outboxes" }

type flowRepository struct{ provider repository.GormProvider }

func NewFlowRepository(p repository.GormProvider) domain.FlowRepository { return &flowRepository{p} }
func NewFlowRuntimeStore(p repository.GormProvider) domain.FlowRuntimeStore {
	return &flowRepository{p}
}
func flowRecord(f *domain.Flow) (conversationFlow, error) {
	raw, err := json.Marshal(f)
	return conversationFlow{ID: f.ID, Name: f.Name, Kind: f.Graph.Kind, Enabled: f.Enabled, Revision: f.Revision, PublishedRevision: f.PublishedRevision, Steps: len(f.Graph.Nodes), Keywords: f.Keywords, Document: string(raw)}, err
}
func (r *flowRepository) Create(ctx context.Context, f *domain.Flow) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	row, err := flowRecord(f)
	if err != nil {
		return err
	}
	return db.Create(&row).Error
}
func (r *flowRepository) GetByID(ctx context.Context, id string) (*domain.Flow, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var row conversationFlow
	if err := db.First(&row, "id=? AND deleted=?", id, false).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.FlowNotFound()
		}
		return nil, err
	}
	var f domain.Flow
	err = json.Unmarshal([]byte(row.Document), &f)
	return &f, err
}
func (r *flowRepository) List(ctx context.Context, kind string) ([]domain.FlowSummary, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	query := db.Model(&conversationFlow{}).Where("deleted=?", false)
	if kind != "" {
		query = query.Where("kind=?", kind)
	}
	var rows []conversationFlow
	if err := query.Select("id,name,kind,enabled,revision,published_revision,steps,keywords").Order("name,id").Find(&rows).Error; err != nil {
		return nil, err
	}
	out := make([]domain.FlowSummary, 0, len(rows))
	for _, f := range rows {
		out = append(out, domain.FlowSummary{ID: f.ID, Name: f.Name, Kind: f.Kind, Enabled: f.Enabled, Revision: f.Revision, PublishedRevision: f.PublishedRevision, Steps: f.Steps, Keywords: f.Keywords})
	}
	return out, nil
}
func changed(tx *gorm.DB, id string, result *gorm.DB) error {
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected > 0 {
		return nil
	}
	var count int64
	if err := tx.Model(&conversationFlow{}).Where("id=? AND deleted=?", id, false).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		return domain.FlowNotFound()
	}
	return domain.FlowConflict()
}
func saveFlow(tx *gorm.DB, f *domain.Flow, expected int64) error {
	row, err := flowRecord(f)
	if err != nil {
		return err
	}
	result := tx.Model(&conversationFlow{}).Where("id=? AND revision=? AND deleted=?", f.ID, expected, false).Updates(map[string]any{"name": row.Name, "kind": row.Kind, "enabled": row.Enabled, "revision": row.Revision, "published_revision": row.PublishedRevision, "steps": row.Steps, "keywords": row.Keywords, "document": row.Document})
	return changed(tx, f.ID, result)
}
func stopFlow(tx *gorm.DB, id string) error {
	if err := tx.Model(&flowSessionRecord{}).Where("flow_id=? AND state IN ?", id, []string{"running", "waiting", "sleeping", "transferred"}).Updates(map[string]any{"state": "cancelled", "wake_at": nil}).Error; err != nil {
		return err
	}
	return tx.Where("sent=? AND session_id IN (?)", false, tx.Model(&flowSessionRecord{}).Select("id").Where("flow_id=?", id)).Delete(&flowOutbox{}).Error
}
func (r *flowRepository) Update(ctx context.Context, f *domain.Flow, expected int64) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Transaction(func(tx *gorm.DB) error {
		if err := saveFlow(tx, f, expected); err != nil {
			return err
		}
		if !f.Enabled {
			return stopFlow(tx, f.ID)
		}
		return nil
	})
}
func (r *flowRepository) Publish(ctx context.Context, f *domain.Flow, expected int64) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Transaction(func(tx *gorm.DB) error {
		if err := saveFlow(tx, f, expected); err != nil {
			return err
		}
		raw, err := json.Marshal(f)
		if err != nil {
			return err
		}
		return tx.Create(&flowVersion{FlowID: f.ID, Revision: f.PublishedRevision, Document: string(raw)}).Error
	})
}
func (r *flowRepository) Delete(ctx context.Context, id string, expected int64) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Transaction(func(tx *gorm.DB) error {
		result := tx.Model(&conversationFlow{}).Where("id=? AND revision=? AND deleted=?", id, expected, false).Updates(map[string]any{"deleted": true, "enabled": false, "revision": expected + 1})
		if err := changed(tx, id, result); err != nil {
			return err
		}
		if err := tx.Where("flow_id=?", id).Delete(&flowBinding{}).Error; err != nil {
			return err
		}
		return stopFlow(tx, id)
	})
}
func (r *flowRepository) GetBinding(ctx context.Context) (string, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return "", err
	}
	var b flowBinding
	err = db.First(&b, 1).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return "", nil
	}
	return b.FlowID, err
}
func (r *flowRepository) Bind(ctx context.Context, id string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Transaction(func(tx *gorm.DB) error {
		if id != "" {
			var f conversationFlow
			if err := tx.First(&f, "id=? AND deleted=? AND published_revision>0", id, false).Error; err != nil {
				return domain.FlowNotFound()
			}
		}
		return tx.Save(&flowBinding{ID: 1, FlowID: id}).Error
	})
}
