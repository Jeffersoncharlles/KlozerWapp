package sqlite

import (
	"context"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
	"github.com/google/uuid"
)

type QueueRepository struct {
	provider repository.GormProvider
}

func NewQueueRepository(provider repository.GormProvider) domain.QueueRepository {
	return &QueueRepository{provider: provider}
}

func (r *QueueRepository) Create(ctx context.Context, queue *domain.Queue) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	if queue.ID == "" {
		queue.ID = uuid.New().String()
	}
	return db.Create(queue).Error
}

func (r *QueueRepository) GetByID(ctx context.Context, id string) (*domain.Queue, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var queue domain.Queue
	err = db.First(&queue, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &queue, nil
}

func (r *QueueRepository) List(ctx context.Context) ([]domain.Queue, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}
	var queues []domain.Queue
	err = db.Find(&queues).Error
	return queues, err
}

func (r *QueueRepository) Update(ctx context.Context, queue *domain.Queue) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Save(queue).Error
}

func (r *QueueRepository) Delete(ctx context.Context, id string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Delete(&domain.Queue{}, "id = ?", id).Error
}
