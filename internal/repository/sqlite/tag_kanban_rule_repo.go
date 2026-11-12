package sqlite

import (
	"context"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
)

type tagKanbanRuleRepo struct {
	provider repository.GormProvider
}

func NewTagKanbanRuleRepository(provider repository.GormProvider) domain.TagKanbanRuleRepository {
	return &tagKanbanRuleRepo{provider: provider}
}

func (r *tagKanbanRuleRepo) Create(ctx context.Context, rule *domain.TagKanbanRule) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Create(rule).Error
}

func (r *tagKanbanRuleRepo) List(ctx context.Context) ([]domain.TagKanbanRule, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var rules []domain.TagKanbanRule
	if err := db.Preload("Tag").Preload("Column").Order("priority DESC, id ASC").Find(&rules).Error; err != nil {
		return nil, err
	}
	return rules, nil
}

func (r *tagKanbanRuleRepo) GetByID(ctx context.Context, id string) (*domain.TagKanbanRule, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var rule domain.TagKanbanRule
	if err := db.First(&rule, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &rule, nil
}

func (r *tagKanbanRuleRepo) Update(ctx context.Context, rule *domain.TagKanbanRule) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Save(rule).Error
}

func (r *tagKanbanRuleRepo) Delete(ctx context.Context, id string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Delete(&domain.TagKanbanRule{}, "id = ?", id).Error
}

func (r *tagKanbanRuleRepo) ListActiveByTagID(ctx context.Context, tagID string) ([]domain.TagKanbanRule, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var rules []domain.TagKanbanRule
	if err := db.Where("tag_id = ? AND enabled = ?", tagID, true).Order("priority DESC, id ASC").Find(&rules).Error; err != nil {
		return nil, err
	}
	return rules, nil
}
