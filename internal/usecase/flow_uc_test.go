package usecase

import (
	"context"
	"testing"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type automationFlowRepositoryStub struct {
	flow    *domain.Flow
	created *domain.Flow
}

func (r *automationFlowRepositoryStub) Create(_ context.Context, flow *domain.Flow) error {
	r.created = flow
	return nil
}

func (r *automationFlowRepositoryStub) GetByID(_ context.Context, _ string) (*domain.Flow, error) {
	if r.flow == nil {
		return r.created, nil
	}
	return r.flow, nil
}

func (r *automationFlowRepositoryStub) List(context.Context, string) ([]domain.FlowSummary, error) {
	return nil, nil
}
func (r *automationFlowRepositoryStub) Update(_ context.Context, flow *domain.Flow, _ int64) error {
	r.flow = flow
	return nil
}
func (r *automationFlowRepositoryStub) Publish(_ context.Context, flow *domain.Flow, _ int64) error {
	r.flow = flow
	return nil
}
func (r *automationFlowRepositoryStub) Delete(context.Context, string, int64) error { return nil }
func (r *automationFlowRepositoryStub) GetBinding(context.Context) (string, error)  { return "", nil }
func (r *automationFlowRepositoryStub) Bind(context.Context, string) error          { return nil }

func TestFlowUseCaseCreatesConnectedGreetingAndMenu(t *testing.T) {
	repo := &automationFlowRepositoryStub{}
	flow, err := NewFlowUseCase(repo).CreateFlow(context.Background(), "")
	if err != nil {
		t.Fatalf("CreateFlow() error = %v", err)
	}
	if len(flow.Graph.Nodes) != 2 || len(flow.Graph.Edges) != 1 {
		t.Fatalf("expected two nodes and one edge, got %d nodes and %d edges", len(flow.Graph.Nodes), len(flow.Graph.Edges))
	}
	if flow.Graph.StartNodeID != "welcome" || flow.Graph.Edges[0].Source != "welcome" || flow.Graph.Edges[0].Target != "menu" {
		t.Fatalf("default graph is not connected from welcome to menu: %+v", flow.Graph)
	}
}

func TestFlowUseCaseUpdateRequiresCurrentRevision(t *testing.T) {
	repo := &automationFlowRepositoryStub{flow: &domain.Flow{ID: "flow-id", Name: "Atendimento", Revision: 2, Trigger: "inbound", KeywordMatch: "any", Graph: domain.FlowGraph{Version: 1, Kind: "chat", StartNodeID: "welcome", Nodes: []domain.FlowNode{{ID: "welcome", Type: "message"}}}}}
	_, err := NewFlowUseCase(repo).UpdateFlow(context.Background(), "flow-id", domain.FlowPatch{Revision: 1})
	if flowErr, ok := err.(*domain.FlowError); !ok || flowErr.Code != "revision_conflict" {
		t.Fatalf("UpdateFlow() error = %v, want revision conflict", err)
	}
}

func TestFlowUseCaseDoesNotPublishIncompleteGraph(t *testing.T) {
	repo := &automationFlowRepositoryStub{flow: &domain.Flow{ID: "flow-id", Name: "Atendimento", Revision: 1, Trigger: "inbound", KeywordMatch: "any", Graph: domain.FlowGraph{Version: 1, Kind: "chat", StartNodeID: "welcome", Nodes: []domain.FlowNode{{ID: "welcome", Type: "message", Data: domain.FlowNodeData{Message: ""}}}}}}
	_, err := NewFlowUseCase(repo).PublishFlow(context.Background(), "flow-id", 1)
	if flowErr, ok := err.(*domain.FlowError); !ok || flowErr.Code != "invalid_flow" {
		t.Fatalf("PublishFlow() error = %v, want invalid_flow", err)
	}
}

func TestFlowUseCaseDuplicatesAsDraft(t *testing.T) {
	repo := &automationFlowRepositoryStub{flow: &domain.Flow{ID: "flow-id", Name: "Atendimento", Revision: 3, PublishedRevision: 3, Enabled: true, Graph: domain.FlowGraph{Version: 1, Kind: "chat", StartNodeID: "welcome", Nodes: []domain.FlowNode{{ID: "welcome", Type: "message"}}}}}
	copy, err := NewFlowUseCase(repo).DuplicateFlow(context.Background(), "flow-id")
	if err != nil {
		t.Fatalf("DuplicateFlow() error = %v", err)
	}
	if copy.ID == repo.flow.ID || copy.Revision != 1 || copy.PublishedRevision != 0 || copy.Enabled {
		t.Fatalf("duplicate should be a new inactive draft: %+v", copy)
	}
}
