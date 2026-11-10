package usecase

import (
	"context"
	"errors"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type queueUseCase struct {
	queueRepo domain.QueueRepository
}

func NewQueueUseCase(queueRepo domain.QueueRepository) domain.QueueUseCase {
	return &queueUseCase{queueRepo: queueRepo}
}

func (uc *queueUseCase) CreateQueue(ctx context.Context, name, description, color string) (*domain.Queue, error) {
	if name == "" {
		return nil, errors.New("o nome da fila é obrigatório")
	}

	if color == "" {
		color = "#3B82F6"
	}

	queue := &domain.Queue{
		Name:        name,
		Description: description,
		Color:       color,
		IsActive:    true,
	}

	err := uc.queueRepo.Create(ctx, queue)
	if err != nil {
		return nil, err
	}
	return queue, nil
}

func (uc *queueUseCase) ListQueues(ctx context.Context) ([]domain.Queue, error) {
	return uc.queueRepo.List(ctx)
}

func (uc *queueUseCase) GetQueue(ctx context.Context, id string) (*domain.Queue, error) {
	return uc.queueRepo.GetByID(ctx, id)
}

func (uc *queueUseCase) UpdateQueue(ctx context.Context, id, name, description, color string, isActive bool) (*domain.Queue, error) {
	queue, err := uc.queueRepo.GetByID(ctx, id)
	if err != nil {
		return nil, errors.New("fila não encontrada")
	}

	if name != "" {
		queue.Name = name
	}
	queue.Description = description
	if color != "" {
		queue.Color = color
	}
	queue.IsActive = isActive

	err = uc.queueRepo.Update(ctx, queue)
	if err != nil {
		return nil, err
	}
	return queue, nil
}

func (uc *queueUseCase) DeleteQueue(ctx context.Context, id string) error {
	return uc.queueRepo.Delete(ctx, id)
}
