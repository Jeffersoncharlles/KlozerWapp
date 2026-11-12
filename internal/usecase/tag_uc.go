package usecase

import (
	"context"
	"errors"
	"strings"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type tagUseCase struct {
	repo     domain.TagRepository
	ruleRepo domain.TagKanbanRuleRepository
	broker   domain.Broker
}

func NewTagUseCase(repo domain.TagRepository, ruleRepo domain.TagKanbanRuleRepository, broker domain.Broker) domain.TagUseCase {
	return &tagUseCase{repo: repo, ruleRepo: ruleRepo, broker: broker}
}

func (uc *tagUseCase) Create(ctx context.Context, name, color string) (*domain.Tag, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, errors.New("o nome da tag é obrigatório")
	}
	if color == "" {
		color = "#000000"
	}
	tag := &domain.Tag{Name: name, Color: color}
	if err := uc.repo.Create(ctx, tag); err != nil {
		return nil, err
	}
	return tag, nil
}

func (uc *tagUseCase) List(ctx context.Context) ([]domain.Tag, error) { return uc.repo.List(ctx) }
func (uc *tagUseCase) Delete(ctx context.Context, id string) error    { return uc.repo.Delete(ctx, id) }

func (uc *tagUseCase) ToggleContactTag(ctx context.Context, tagID, contactID string) error {
	return uc.AddToContact(ctx, contactID, tagID)
}

func (uc *tagUseCase) AddToContact(ctx context.Context, contactID, tagID string) error {
	rules, err := uc.ruleRepo.ListActiveByTagID(ctx, tagID)
	if err != nil {
		return err
	}
	targetColumnID := ""
	if len(rules) > 0 {
		targetColumnID = rules[0].TargetColumnID
	}
	result, err := uc.repo.AssignToContactAndMove(ctx, contactID, tagID, targetColumnID)
	if err != nil {
		return err
	}
	if result.TargetColumnID != "" && result.PreviousColumnID != result.TargetColumnID {
		_ = uc.broker.Publish("kanban_update", map[string]interface{}{
			"type": "card_moved_by_tag", "contact_id": contactID, "card_id": result.CardID,
			"tag_id": tagID, "previous_column_id": result.PreviousColumnID,
			"new_column_id": result.TargetColumnID, "rule_id": rules[0].ID,
		})
	}
	_ = uc.broker.Publish("chat_"+contactID, map[string]interface{}{"type": "tag_added", "tag_id": tagID, "contact_id": contactID})
	return nil
}

func (uc *tagUseCase) RemoveFromContact(ctx context.Context, contactID, tagID string) error {
	if err := uc.repo.RemoveFromContact(ctx, contactID, tagID); err != nil {
		return err
	}
	_ = uc.broker.Publish("chat_"+contactID, map[string]interface{}{"type": "tag_removed", "tag_id": tagID, "contact_id": contactID})
	return nil
}
