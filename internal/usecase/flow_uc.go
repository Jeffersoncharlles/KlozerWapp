package usecase

import (
	"context"
	"errors"
	"log/slog"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type flowUseCase struct {
	flowRepo  domain.FlowRepository
	waGateway domain.WhatsAppGateway
}

func NewFlowUseCase(flowRepo domain.FlowRepository, wa domain.WhatsAppGateway) domain.FlowUseCase {
	return &flowUseCase{
		flowRepo:  flowRepo,
		waGateway: wa,
	}
}

func (uc *flowUseCase) CreateFlow(ctx context.Context, name, triggerKeyword string, nodes []domain.FlowNode) (*domain.Flow, error) {
	if name == "" {
		return nil, errors.New("o nome do fluxo é obrigatório")
	}

	flow := &domain.Flow{
		Name:           name,
		TriggerKeyword: triggerKeyword,
		IsActive:       true,
		Nodes:          nodes,
	}

	err := uc.flowRepo.Create(ctx, flow)
	if err != nil {
		return nil, err
	}
	return flow, nil
}

func (uc *flowUseCase) ListFlows(ctx context.Context) ([]domain.Flow, error) {
	return uc.flowRepo.List(ctx)
}

func (uc *flowUseCase) GetFlow(ctx context.Context, id string) (*domain.Flow, error) {
	return uc.flowRepo.GetByID(ctx, id)
}

func (uc *flowUseCase) DeleteFlow(ctx context.Context, id string) error {
	return uc.flowRepo.Delete(ctx, id)
}

func (uc *flowUseCase) ProcessIncomingMessage(ctx context.Context, phone, messageContent string) (bool, error) {
	// 1. Verifica se a mensagem ativa algum gatilho de fluxo
	flow, err := uc.flowRepo.GetByKeyword(ctx, messageContent)
	if err != nil || flow == nil {
		// Nenhum fluxo encontrado para essa palavra-chave (segue o atendimento normal do CRM)
		return false, nil // <-- Retorna false, indicando que o fluxo não assumiu
	}

	slog.Info("Fluxo de automação acionado", "flow", flow.Name, "phone", phone)

	// 2. Se encontrou o fluxo, pega o primeiro nó e envia a resposta via WhatsApp
	if len(flow.Nodes) > 0 {
		firstNode := flow.Nodes[0]
		err = uc.waGateway.SendMessage(ctx, phone, firstNode.Content)
		if err != nil {
			slog.Error("Erro ao enviar mensagem do fluxo via WhatsApp", "err", err)
			return true, err // <-- Retorna true (acionou), mas repassa o erro de envio
		}
	}

	return true, nil // <-- Retorna true, indicando que o bot assumiu e respondeu com sucesso
}
