package usecase

import (
	"context"
	"encoding/json"
	"strings"
	"time"
	"uuid"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type flowUseCase struct{ repo domain.FlowRepository }

// Draft/publication policy belongs to the application. The domain validator
// only reports invariants and incomplete execution data, without mutating Flow.
func validateFlow(f *domain.Flow, publication bool) error {
	warnings, err := domain.ValidateFlow(f)
	f.Warnings = warnings
	if err != nil {
		return err
	}
	if publication && len(warnings) > 0 {
		return &domain.FlowError{Code: "invalid_flow", Message: "fluxo incompleto para publicação", Fields: warnings}
	}
	return nil
}

func NewFlowUseCase(repo domain.FlowRepository) domain.FlowUseCase { return &flowUseCase{repo} }
func (uc *flowUseCase) CreateFlow(ctx context.Context, name string) (*domain.Flow, error) {
	if name == "" {
		name = "Novo fluxo de conversa"
	}
	h := "next"
	f := &domain.Flow{
		ID:      uuid.New().String(),
		Name:    strings.TrimSpace(name),
		Trigger: "inbound", KeywordMatch: "any",
		Revision:  1,
		CreatedAt: time.Now().UTC(),
		UpdatedAt: time.Now().UTC(),
		Graph: domain.FlowGraph{
			Version: 1, Kind: "chat", StartNodeID: "welcome",
			Nodes: []domain.FlowNode{
				{
					ID: "welcome", Type: "message",
					Position: domain.FlowPosition{X: 80, Y: 180},
					Data: domain.FlowNodeData{
						Label: "Saudação", Message: "Olá! Como podemos ajudar?",
					},
				},
				{
					ID: "menu", Type: "interactive-message",
					Position: domain.FlowPosition{X: 420, Y: 180},
					Data: domain.FlowNodeData{
						Label: "Menu", Message: "Escolha uma opção",
						Options: []domain.FlowOption{{ID: "sales", Label: "Comercial"}, {ID: "support", Label: "Suporte"}},
						Seconds: 300,
					},
				},
			}, Edges: []domain.FlowEdge{
				{
					ID: "welcome-menu", Source: "welcome", Target: "menu", SourceHandle: &h,
				},
			},
		},
	}
	if err := validateFlow(f, false); err != nil {
		return nil, err
	}
	return f, uc.repo.Create(ctx, f)
}

func (uc *flowUseCase) GetFlow(ctx context.Context, id string) (*domain.Flow, error) {
	f, err := uc.repo.GetByID(ctx, id)
	if err == nil {
		if validationErr := validateFlow(f, false); validationErr != nil {
			return nil, validationErr
		}
	}
	return f, err
}

func (uc *flowUseCase) ListFlows(ctx context.Context, kind string) ([]domain.FlowSummary, error) {
	return uc.repo.List(ctx, kind)
}

func (uc *flowUseCase) UpdateFlow(ctx context.Context, id string, p domain.FlowPatch) (*domain.Flow, error) {
	f, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if p.Revision != f.Revision {
		return nil, domain.FlowConflict()
	}
	if p.Name != nil {
		f.Name = strings.TrimSpace(*p.Name)
	}
	if p.Trigger != nil {
		f.Trigger = *p.Trigger
	}
	if p.Keywords != nil {
		f.Keywords = *p.Keywords
	}
	if p.KeywordMatch != nil {
		f.KeywordMatch = *p.KeywordMatch
	}
	if p.Graph != nil {
		f.Graph = *p.Graph
	}
	if p.Enabled != nil {
		f.Enabled = *p.Enabled
	}
	if f.Enabled && f.PublishedRevision == 0 {
		return nil, &domain.FlowError{Code: "invalid_flow", Message: "publique o fluxo antes de ativar"}
	}
	if err := validateFlow(f, false); err != nil {
		return nil, err
	}
	f.Revision++
	f.UpdatedAt = time.Now().UTC()
	return f, uc.repo.Update(ctx, f, p.Revision)
}

func (uc *flowUseCase) PublishFlow(ctx context.Context, id string, revision int64) (*domain.Flow, error) {
	f, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if f.Revision != revision {
		return nil, domain.FlowConflict()
	}
	if err := validateFlow(f, true); err != nil {
		return nil, err
	}
	f.Revision++
	f.PublishedRevision = f.Revision
	f.UpdatedAt = time.Now().UTC()
	return f, uc.repo.Publish(ctx, f, revision)
}

func (uc *flowUseCase) DuplicateFlow(ctx context.Context, id string) (*domain.Flow, error) {
	f, err := uc.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	// Clone slices/payloads so the duplicate never shares mutable state.
	raw, _ := json.Marshal(f)
	var copy domain.Flow
	if err := json.Unmarshal(raw, &copy); err != nil {
		return nil, err
	}
	copy.ID = uuid.New().String()
	copy.Name = strings.TrimSpace(copy.Name) + " (cópia)"
	if len(copy.Name) > 120 {
		copy.Name = "Cópia do fluxo"
	}
	copy.Revision = 1
	copy.PublishedRevision = 0
	copy.Enabled = false
	copy.CreatedAt = time.Now().UTC()
	copy.UpdatedAt = copy.CreatedAt
	return &copy, uc.repo.Create(ctx, &copy)
}

func (uc *flowUseCase) DeleteFlow(ctx context.Context, id string, revision int64) error {
	return uc.repo.Delete(ctx, id, revision)
}

func (uc *flowUseCase) GetBinding(ctx context.Context) (string, error) {
	return uc.repo.GetBinding(ctx)
}

func (uc *flowUseCase) BindFlow(ctx context.Context, id string) error {
	if id != "" {
		f, err := uc.repo.GetByID(ctx, id)
		if err != nil {
			return err
		}
		if f.PublishedRevision == 0 {
			return &domain.FlowError{Code: "invalid_flow", Message: "publique o fluxo antes de vincular"}
		}
	}
	return uc.repo.Bind(ctx, id)
}

// flowSender orchestrates the application-level delivery of a flow message:
// WhatsApp gateway, CRM history and events. It remains independently injectable
// so CRUD operations do not need messaging dependencies.
type flowSender struct {
	wa       domain.WhatsAppGateway
	contacts domain.ContactUseCase
	messages domain.MessageRepository
	broker   domain.Broker
}

func NewFlowSender(wa domain.WhatsAppGateway, contacts domain.ContactUseCase, messages domain.MessageRepository, broker domain.Broker) domain.FlowSender {
	return &flowSender{wa, contacts, messages, broker}
}

func (s *flowSender) SendFlowMessage(ctx context.Context, phone, text, id string) error {
	contact, err := s.contacts.GetByPhone(ctx, phone)
	if err != nil {
		return err
	}
	if err := s.wa.SendFlowMessage(ctx, phone, text, id); err != nil {
		return err
	}
	externalID := "flow:" + id
	msg := &domain.Message{ContactID: contact.ID, Content: text, Type: "text", IsFromMe: true, Timestamp: time.Now().UTC(), ExternalID: &externalID}
	if err := s.messages.Create(ctx, msg); err != nil {
		return err
	}
	return s.broker.Publish("chat_"+contact.ID, msg)
}
