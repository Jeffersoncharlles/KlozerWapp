package usecase

import (
	"context"
	"reflect"
	"testing"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type configurationRepositoryStub struct {
	configuration domain.WhatsAppConfiguration
}

func (r *configurationRepositoryStub) Get(context.Context) (*domain.WhatsAppConfiguration, error) {
	configuration := r.configuration
	return &configuration, nil
}

func (r *configurationRepositoryStub) Save(_ context.Context, configuration *domain.WhatsAppConfiguration) error {
	r.configuration = *configuration
	return nil
}

type flowRepositoryStub struct {
	flow      *domain.Flow
	boundFlow string
}

func (r *flowRepositoryStub) Create(context.Context, *domain.Flow) error { return nil }
func (r *flowRepositoryStub) GetByID(context.Context, string) (*domain.Flow, error) {
	return r.flow, nil
}
func (r *flowRepositoryStub) List(context.Context, string) ([]domain.FlowSummary, error) {
	return nil, nil
}
func (r *flowRepositoryStub) Update(context.Context, *domain.Flow, int64) error  { return nil }
func (r *flowRepositoryStub) Publish(context.Context, *domain.Flow, int64) error { return nil }
func (r *flowRepositoryStub) Delete(context.Context, string, int64) error        { return nil }
func (r *flowRepositoryStub) GetBinding(context.Context) (string, error)         { return r.boundFlow, nil }
func (r *flowRepositoryStub) Bind(_ context.Context, id string) error            { r.boundFlow = id; return nil }

type queueRepositoryStub struct {
	queue *domain.Queue
}

func (r *queueRepositoryStub) Create(context.Context, *domain.Queue) error { return nil }
func (r *queueRepositoryStub) GetByID(context.Context, string) (*domain.Queue, error) {
	return r.queue, nil
}
func (r *queueRepositoryStub) List(context.Context) ([]domain.Queue, error) { return nil, nil }
func (r *queueRepositoryStub) Update(context.Context, *domain.Queue) error  { return nil }
func (r *queueRepositoryStub) Delete(context.Context, string) error         { return nil }

func TestWhatsAppConfigurationUseCaseAllowsEmptyOptionalLinks(t *testing.T) {
	configRepo := &configurationRepositoryStub{}
	uc := NewWhatsAppConfigurationUseCase(configRepo, &flowRepositoryStub{}, &queueRepositoryStub{})

	configuration, err := uc.Update(context.Background(), domain.WhatsAppConfiguration{})
	if err != nil {
		t.Fatalf("Update() error = %v", err)
	}
	if configuration.FlowID != "" || configuration.QueueID != "" {
		t.Fatalf("expected empty optional links, got %+v", configuration)
	}
}

func TestWhatsAppConfigurationUseCaseRequiresActivePublishedFlow(t *testing.T) {
	flowRepo := &flowRepositoryStub{flow: &domain.Flow{Enabled: false, PublishedRevision: 1}}
	uc := NewWhatsAppConfigurationUseCase(&configurationRepositoryStub{}, flowRepo, &queueRepositoryStub{})

	_, err := uc.Update(context.Background(), domain.WhatsAppConfiguration{FlowID: "flow-id"})
	if err != ErrFlowConfigurationInactive {
		t.Fatalf("Update() error = %v, want %v", err, ErrFlowConfigurationInactive)
	}
}

func TestWhatsAppConfigurationUseCaseRequiresActiveQueue(t *testing.T) {
	queueRepo := &queueRepositoryStub{queue: &domain.Queue{IsActive: false}}
	uc := NewWhatsAppConfigurationUseCase(&configurationRepositoryStub{}, &flowRepositoryStub{}, queueRepo)

	_, err := uc.Update(context.Background(), domain.WhatsAppConfiguration{QueueID: "queue-id"})
	if err != ErrQueueConfigurationInactive {
		t.Fatalf("Update() error = %v, want %v", err, ErrQueueConfigurationInactive)
	}
}

func TestWhatsAppConfigurationUseCaseUpdatesLinksWithoutConnectionState(t *testing.T) {
	configRepo := &configurationRepositoryStub{}
	flowRepo := &flowRepositoryStub{flow: &domain.Flow{Enabled: true, PublishedRevision: 2}}
	queueRepo := &queueRepositoryStub{queue: &domain.Queue{IsActive: true}}
	uc := NewWhatsAppConfigurationUseCase(configRepo, flowRepo, queueRepo)

	configuration, err := uc.Update(context.Background(), domain.WhatsAppConfiguration{
		FlowID:               "flow-id",
		QueueID:              "queue-id",
		BusinessHoursEnabled: true,
	})
	if err != nil {
		t.Fatalf("Update() error = %v", err)
	}
	if !reflect.DeepEqual(*configuration, configRepo.configuration) {
		t.Fatalf("saved configuration = %+v, repository = %+v", configuration, configRepo.configuration)
	}
}
