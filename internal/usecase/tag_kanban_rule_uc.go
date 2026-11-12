package usecase

import (
	"context"
	"errors"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type tagKanbanRuleUseCase struct {
	repo   domain.TagKanbanRuleRepository
	tags   domain.TagRepository
	kanban domain.KanbanRepository
}

func NewTagKanbanRuleUseCase(repo domain.TagKanbanRuleRepository, tags domain.TagRepository, kanban domain.KanbanRepository) domain.TagKanbanRuleUseCase {
	return &tagKanbanRuleUseCase{repo: repo, tags: tags, kanban: kanban}
}

func (uc *tagKanbanRuleUseCase) validate(ctx context.Context, tagID, columnID string) error {
	if _, err := uc.tags.GetByID(ctx, tagID); err != nil {
		return errors.New("tag não encontrada")
	}
	if _, err := uc.kanban.GetColumnByID(ctx, columnID); err != nil {
		return errors.New("coluna não encontrada")
	}
	return nil
}

func (uc *tagKanbanRuleUseCase) Create(ctx context.Context, tagID, columnID string, priority int) (*domain.TagKanbanRule, error) {
	if err := uc.validate(ctx, tagID, columnID); err != nil {
		return nil, err
	}
	rule := &domain.TagKanbanRule{TagID: tagID, TargetColumnID: columnID, Priority: priority, Enabled: true}
	if err := uc.repo.Create(ctx, rule); err != nil {
		return nil, err
	}
	return rule, nil
}

func (uc *tagKanbanRuleUseCase) List(ctx context.Context) ([]domain.TagKanbanRule, error) {
	return uc.repo.List(ctx)
}

func (uc *tagKanbanRuleUseCase) Update(ctx context.Context, id, tagID, columnID string, priority int, enabled bool) (*domain.TagKanbanRule, error) {
	if err := uc.validate(ctx, tagID, columnID); err != nil {
		return nil, err
	}
	rule := &domain.TagKanbanRule{ID: id, TagID: tagID, TargetColumnID: columnID, Priority: priority, Enabled: enabled}
	if err := uc.repo.Update(ctx, rule); err != nil {
		return nil, err
	}
	return rule, nil
}

func (uc *tagKanbanRuleUseCase) Delete(ctx context.Context, id string) error {
	return uc.repo.Delete(ctx, id)
}
