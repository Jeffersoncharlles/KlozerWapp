package usecase

import (
	"context"
	"errors"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type kanbanUseCase struct {
	repository domain.KanbanRepository
}

func NewKanbanUseCase(r domain.KanbanRepository) domain.KanbanUseCase {
	return &kanbanUseCase{repository: r}
}

func (uc *kanbanUseCase) CreateColumn(ctx context.Context, name string, position int) (*domain.KanbanColumn, error) {
	if name == "" {
		return nil, errors.New("o nome da coluna é obrigatório")
	}
	col := &domain.KanbanColumn{Name: name, Position: position}
	if err := uc.repository.CreateColumn(ctx, col); err != nil {
		return nil, err
	}
	return col, nil
}

func (uc *kanbanUseCase) ListBoard(ctx context.Context) ([]domain.KanbanColumn, error) {
	return uc.repository.ListColumnsWithCards(ctx)
}

func (uc *kanbanUseCase) MoveCard(ctx context.Context, cardID, targetColumnID string, newPosition int) error {
	return uc.repository.MoveCard(ctx, cardID, targetColumnID, newPosition)
}

func (uc *kanbanUseCase) TakeAttendance(ctx context.Context, cardID, userID string) error {
	// Chamado quando o Atendente clica em "Assumir Conversa"
	return uc.repository.AssignUserToCard(ctx, cardID, userID)
}

func (uc *kanbanUseCase) AssignQueue(ctx context.Context, cardID, queueID, origin string) error {
	if origin == "" {
		origin = "manual"
	}
	return uc.repository.AssignQueueToCard(ctx, cardID, queueID, origin)
}

func (uc *kanbanUseCase) EnsureContactHasCard(ctx context.Context, contactID string) (*domain.KanbanCard, error) {
	// 1. Verifica se o lead já tem um card ativo no Kanban.
	card, err := uc.repository.GetCardByContactID(ctx, contactID)
	if err == nil && card != nil {
		return card, nil // Já existe e está na fila, não faz nada.
	}

	// 2. Busca a primeira coluna do Kanban real (a que tem a menor 'Position')
	firstColumn, err := uc.repository.GetFirstColumn(ctx)
	if err != nil || firstColumn == nil {
		// Sistema recém-instalado (banco zerado). Cria a coluna padrão automaticamente.
		firstColumn = &domain.KanbanColumn{Name: "Novos Leads", Position: 0}
		if createErr := uc.repository.CreateColumn(ctx, firstColumn); createErr != nil {
			return nil, errors.New("falha ao criar coluna padrão do kanban")
		}
	}

	// 3. Cria o Card e joga o cliente na primeira coluna
	newCard := &domain.KanbanCard{
		ContactID: contactID,
		ColumnID:  firstColumn.ID,
		Position:  0, // Joga pro topo da lista
	}

	err = uc.repository.CreateCard(ctx, newCard)
	return newCard, err
}
