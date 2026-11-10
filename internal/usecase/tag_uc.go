package usecase

import (
	"context"
	"errors"
	"strings"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type tagUseCase struct {
	repo domain.TagRepository
}

func NewTagUseCase(r domain.TagRepository) domain.TagUseCase {
	return &tagUseCase{repo: r}
}

func (uc *tagUseCase) Create(ctx context.Context, name, color string) (*domain.Tag, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return nil, errors.New("o nome da tag é obrigatório")
	}
	if color == "" {
		color = "#000000" // Cor padrão
	}

	tag := &domain.Tag{
		Name:  name,
		Color: color,
	}

	if err := uc.repo.Create(ctx, tag); err != nil {
		return nil, err
	}
	return tag, nil
}

func (uc *tagUseCase) List(ctx context.Context) ([]domain.Tag, error) {
	return uc.repo.List(ctx)
}

func (uc *tagUseCase) Delete(ctx context.Context, id string) error {
	return uc.repo.Delete(ctx, id)
}

func (uc *tagUseCase) ToggleContactTag(ctx context.Context, tagID, contactID string) error {
	// Aqui poderíamos verificar se a tag já está no contato para decidir se adiciona ou remove.
	// Por simplicidade, vamos assumir que a chamada da rota será explícita (add ou remove).
	// Esse método será detalhado conforme avançamos na interface do chat!
	return uc.repo.AssignToContact(ctx, tagID, contactID)
}
