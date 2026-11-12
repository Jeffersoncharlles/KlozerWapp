package domain

import (
	"context"
	"time"
	"uuid"

	"gorm.io/gorm"
)

type Tag struct {
	ID        string    `json:"id" gorm:"type:text;primaryKey"`
	Name      string    `json:"name" gorm:"uniqueIndex;not null"`
	Color     string    `json:"color" gorm:"default:'#000000'"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type TagKanbanRule struct {
	ID             string        `json:"id" gorm:"type:text;primaryKey"`
	TagID          string        `json:"tag_id" gorm:"uniqueIndex:idx_tag_kanban_rule"`
	TargetColumnID string        `json:"target_column_id" gorm:"uniqueIndex:idx_tag_kanban_rule"`
	Priority       int           `json:"priority" gorm:"not null;default:0"`
	Enabled        bool          `json:"enabled" gorm:"not null;default:true"`
	Tag            *Tag          `json:"tag,omitempty" gorm:"foreignKey:TagID"`
	Column         *KanbanColumn `json:"column,omitempty" gorm:"foreignKey:TargetColumnID"`
}

func (r *TagKanbanRule) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

type TagAssignmentResult struct {
	TagID            string `json:"tag_id"`
	ContactID        string `json:"contact_id"`
	CardID           string `json:"card_id"`
	PreviousColumnID string `json:"previous_column_id"`
	TargetColumnID   string `json:"target_column_id"`
}

func (t *Tag) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}

type TagRepository interface {
	Create(ctx context.Context, tag *Tag) error
	List(ctx context.Context) ([]Tag, error)
	Delete(ctx context.Context, id string) error
	AssignToContact(ctx context.Context, tagID, contactID string) error
	GetByID(ctx context.Context, id string) (*Tag, error)
	AttachToContact(ctx context.Context, contactID string, tagID string) error
	RemoveFromContact(ctx context.Context, contactID string, tagID string) error
	AssignToContactAndMove(ctx context.Context, contactID, tagID, targetColumnID string) (*TagAssignmentResult, error)
}

type TagKanbanRuleRepository interface {
	Create(context.Context, *TagKanbanRule) error
	List(context.Context) ([]TagKanbanRule, error)
	GetByID(context.Context, string) (*TagKanbanRule, error)
	Update(context.Context, *TagKanbanRule) error
	Delete(context.Context, string) error
	ListActiveByTagID(context.Context, string) ([]TagKanbanRule, error)
}

type TagUseCase interface {
	Create(ctx context.Context, name, color string) (*Tag, error)
	List(ctx context.Context) ([]Tag, error)
	Delete(ctx context.Context, id string) error
	ToggleContactTag(ctx context.Context, tagID, contactID string) error
	AddToContact(ctx context.Context, contactID, tagID string) error
	RemoveFromContact(ctx context.Context, contactID, tagID string) error
}

type TagKanbanRuleUseCase interface {
	Create(ctx context.Context, tagID, targetColumnID string, priority int) (*TagKanbanRule, error)
	List(context.Context) ([]TagKanbanRule, error)
	Update(ctx context.Context, id, tagID, targetColumnID string, priority int, enabled bool) (*TagKanbanRule, error)
	Delete(context.Context, string) error
}
