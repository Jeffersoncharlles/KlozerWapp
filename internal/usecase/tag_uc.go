package usecase

import (
	"context"
	"errors"
	"log/slog"
	"strings"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type tagUseCase struct {
	repo     domain.TagRepository
	kanbanUC domain.KanbanUseCase // <-- Injetado para mover o card
	broker   domain.Broker        // <-- Injetado para avisar o React
}

func NewTagUseCase(r domain.TagRepository, kuc domain.KanbanUseCase, brk domain.Broker) domain.TagUseCase {
	return &tagUseCase{
		repo:     r,
		kanbanUC: kuc,
		broker:   brk,
	}
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

func (uc *tagUseCase) AttachToContact(ctx context.Context, contactID, tagID string) error {
	// 1. Salva a relação da Tag com o Contato no banco de dados
	if err := uc.repo.AttachToContact(ctx, contactID, tagID); err != nil {
		return err
	}

	// 2. Busca as informações da Tag para saber qual é o nome dela
	tag, err := uc.repo.GetByID(ctx, tagID)
	if err != nil {
		return err // Se não achar a tag, aborta a automação (mas a tag já foi salva)
	}

	// 3. REGRA DE AUTOMAÇÃO (Smart Drag)
	// Vamos padronizar: Se a tag contiver "fechado", "ganho" ou "sucesso", movemos o card.
	tagName := strings.ToLower(tag.Name)

	if strings.Contains(tagName, "venda fechada") || strings.Contains(tagName, "ganho") {

		// 3.1 Garante que o contato tem um card no Kanban (pega o ID do card)
		card, err := uc.kanbanUC.EnsureContactHasCard(ctx, contactID)
		if err == nil && card != nil {

			// 3.2 Busca o quadro do Kanban para achar a coluna destino
			board, _ := uc.kanbanUC.ListBoard(ctx)
			var targetColumnID string

			// Procura a coluna que se chama "Ganhos" ou "Fechados"
			for _, col := range board {
				if strings.Contains(strings.ToLower(col.Name), "ganho") || strings.Contains(strings.ToLower(col.Name), "fechado") {
					targetColumnID = col.ID
					break
				}
			}

			// 3.3 Move o card automaticamente!
			if targetColumnID != "" && card.ColumnID != targetColumnID {
				_ = uc.kanbanUC.MoveCard(ctx, card.ID, targetColumnID, 0)

				slog.Info("Smart Drag executado!", "contact", contactID, "tag", tag.Name, "nova_coluna", targetColumnID)

				// 3.4 Dispara evento SSE para o frontend
				// O React vai ouvir isso e fazer a animação do card mudando de coluna sozinho!
				uc.broker.Publish("kanban_update", map[string]string{
					"action":        "card_moved",
					"card_id":       card.ID,
					"new_column_id": targetColumnID,
				})
			}
		}
	}

	// Avisa o frontend que uma tag nova foi adicionada ao chat
	uc.broker.Publish("chat_"+contactID, map[string]interface{}{
		"type": "tag_added",
		"tag":  tag,
	})

	return nil
}
