package usecase

import (
	"context"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type callUseCase struct {
	callRepo domain.CallRepository
}

func NewCallUseCase(callRepo domain.CallRepository) domain.CallUseCase {
	return &callUseCase{callRepo: callRepo}
}

func (uc *callUseCase) RegisterCall(ctx context.Context, phone, direction, status string, duration int) (*domain.CallRecord, error) {
	call := &domain.CallRecord{
		Phone:     phone,
		Direction: direction,
		Status:    status,
		Duration:  duration,
	}
	err := uc.callRepo.LogCall(ctx, call)
	return call, err
}

func (uc *callUseCase) GetCallHistory(ctx context.Context, phone string) ([]domain.CallRecord, error) {
	return uc.callRepo.ListHistory(ctx, phone)
}
