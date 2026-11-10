package sqlite

import (
	"context"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
	"github.com/Jeffersoncharlles/KlozerWapp/internal/repository"
)

type quickReplyRepo struct {
	provider repository.GormProvider
}

func NewQuickReplyRepository(p repository.GormProvider) domain.QuickReplyRepository {
	return &quickReplyRepo{provider: p}
}

func (r *quickReplyRepo) Create(ctx context.Context, qr *domain.QuickReply) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Create(qr).Error
}

func (r *quickReplyRepo) List(ctx context.Context) ([]domain.QuickReply, error) {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return nil, err
	}

	var list []domain.QuickReply
	if err := db.Order("shortcut ASC").Find(&list).Error; err != nil {
		return nil, err
	}
	return list, nil
}

func (r *quickReplyRepo) Delete(ctx context.Context, id string) error {
	db, err := r.provider.GetDB(ctx)
	if err != nil {
		return err
	}
	return db.Delete(&domain.QuickReply{}, "id = ?", id).Error
}
