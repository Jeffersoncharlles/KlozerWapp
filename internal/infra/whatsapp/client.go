package whatsapp

import (
	"context"
	"database/sql"
	"sync"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store/sqlstore"
	waLog "go.mau.fi/whatsmeow/util/log"
)

type WhatsAppRuntime struct {
	container *sqlstore.Container
	clientLog waLog.Logger
	mu        sync.RWMutex
	client    *whatsmeow.Client
	handlers  []runtimeHandler
}

type runtimeHandler struct {
	handler func(interface{}) bool
	id      uint32
}

func ProvideWhatsmeowRuntime(db *sql.DB) (*WhatsAppRuntime, func(), error) {
	ctx := context.Background()

	// Logger silencioso
	dbLog := waLog.Stdout("Database", "WARN", true)

	// Reuse the CRM pool; NewWithDB requires an explicit schema upgrade.
	container := sqlstore.NewWithDB(db, "sqlite3", dbLog)
	if err := container.Upgrade(ctx); err != nil {
		return nil, nil, err
	}

	runtime := &WhatsAppRuntime{
		container: container,
		clientLog: waLog.Stdout("Client", "WARN", true),
	}
	if _, err := runtime.recreate(ctx); err != nil {
		return nil, nil, err
	}

	// The SQLite provider owns the pool. Never call container.Close here.
	return runtime, func() { runtime.Current().Disconnect() }, nil
}

func (r *WhatsAppRuntime) Current() *whatsmeow.Client {
	r.mu.RLock()
	defer r.mu.RUnlock()
	return r.client
}

func (r *WhatsAppRuntime) AddEventHandler(handler func(interface{}) bool) {
	r.addHandler(handler)
}

func (r *WhatsAppRuntime) AddEventHandlerWithSuccessStatus(handler func(interface{}) bool) {
	r.addHandler(handler)
}

func (r *WhatsAppRuntime) addHandler(handler func(interface{}) bool) {
	r.mu.Lock()
	defer r.mu.Unlock()
	id := r.registerHandler(r.client, handler)
	r.handlers = append(r.handlers, runtimeHandler{handler: handler, id: id})
}

func (r *WhatsAppRuntime) registerHandler(client *whatsmeow.Client, handler func(interface{}) bool) uint32 {
	return client.AddEventHandlerWithSuccessStatus(handler)
}

func (r *WhatsAppRuntime) Recreate(ctx context.Context) error {
	_, err := r.recreate(ctx)
	return err
}

func (r *WhatsAppRuntime) recreate(ctx context.Context) (*whatsmeow.Client, error) {
	r.mu.Lock()
	defer r.mu.Unlock()

	old := r.client
	if old != nil {
		old.Disconnect()
		for _, registration := range r.handlers {
			old.RemoveEventHandler(registration.id)
		}
	}

	deviceStore, err := r.container.GetFirstDevice(ctx)
	if err != nil {
		return nil, err
	}
	client := whatsmeow.NewClient(deviceStore, r.clientLog)
	for index := range r.handlers {
		r.handlers[index].id = r.registerHandler(client, r.handlers[index].handler)
	}
	r.client = client
	return client, nil
}
