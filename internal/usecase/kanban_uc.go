package usecase

import (
	"context"
	"errors"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type kanbanUseCase struct {
	repo domain.KanbanRepository
}

func NewKanbanUseCase(r domain.KanbanRepository) domain.KanbanUseCase {
	return &kanbanUseCase{repo: r}
}

func (uc *kanbanUseCase) CreateColumn(ctx context.Context, name string, position int) (*domain.KanbanColumn, error) {
	if name == "" {
		return nil, errors.New("o nome da coluna é obrigatório")
	}
	col := &domain.KanbanColumn{Name: name, Position: position}
	if err := uc.repo.CreateColumn(ctx, col); err != nil {
		return nil, err
	}
	return col, nil
}

func (uc *kanbanUseCase) ListBoard(ctx context.Context) ([]domain.KanbanColumn, error) {
	return uc.repo.ListColumnsWithCards(ctx)
}

func (uc *kanbanUseCase) MoveCard(ctx context.Context, cardID, targetColumnID string, newPosition int) error {
	return uc.repo.MoveCard(ctx, cardID, targetColumnID, newPosition)
}

func (uc *kanbanUseCase) TakeAttendance(ctx context.Context, cardID, userID string) error {
	// Chamado quando o Atendente clica em "Assumir Conversa"
	return uc.repo.AssignUserToCard(ctx, cardID, userID)
}

func (uc *kanbanUseCase) EnsureContactHasCard(ctx context.Context, contactID string) (*domain.KanbanCard, error) {
	// Verifica se o lead já está no Kanban. Se não estiver, cria na 1ª coluna (ex: "Novos Leads")
	card, err := uc.repo.GetCardByContactID(ctx, contactID)
	if err == nil && card != nil {
		return card, nil // Já existe
	}

	// Lógica simplificada: precisaria buscar o ID da primeira coluna real no banco
	newCard := &domain.KanbanCard{
		ContactID: contactID,
		ColumnID:  "id-da-primeira-coluna",
		Position:  0,
	}
	err = uc.repo.CreateCard(ctx, newCard)
	return newCard, err
}
