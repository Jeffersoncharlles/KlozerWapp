package usecase

import (
	"context"
	"errors"
	"strings"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type quickReplyUseCase struct {
	repo domain.QuickReplyRepository
}

func NewQuickReplyUseCase(r domain.QuickReplyRepository) domain.QuickReplyUseCase {
	return &quickReplyUseCase{repo: r}
}

func (uc *quickReplyUseCase) Create(ctx context.Context, shortcut, title, content string) (*domain.QuickReply, error) {
	shortcut = strings.TrimSpace(shortcut)
	if shortcut == "" || content == "" {
		return nil, errors.New("atalho e conteúdo são obrigatórios")
	}

	// Garante que todo atalho começa com "/"
	if !strings.HasPrefix(shortcut, "/") {
		shortcut = "/" + shortcut
	}

	qr := &domain.QuickReply{
		Shortcut: shortcut,
		Title:    title,
		Content:  content,
	}

	if err := uc.repo.Create(ctx, qr); err != nil {
		return nil, err
	}
	return qr, nil
}

func (uc *quickReplyUseCase) List(ctx context.Context) ([]domain.QuickReply, error) {
	return uc.repo.List(ctx)
}

func (uc *quickReplyUseCase) Delete(ctx context.Context, id string) error {
	return uc.repo.Delete(ctx, id)
}

// ProcessContent substitui tags como {{nome}} pelo nome real do Contato
func (uc *quickReplyUseCase) ProcessContent(ctx context.Context, shortcut string, contact *domain.Contact) (string, error) {
	// Na prática você buscaria o conteúdo via repo.GetByShortcut(shortcut)
	// Vamos simular o replace:
	content := "Olá {{nome}}, segue a chave!" // Isso viria do banco

	if contact != nil && contact.Name != "" {
		content = strings.ReplaceAll(content, "{{nome}}", contact.Name)
	} else {
		content = strings.ReplaceAll(content, "{{nome}}", "cliente")
	}

	return content, nil
}
