package whatsapp

import (
	"context"
	"database/sql"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store/sqlstore"
	waLog "go.mau.fi/whatsmeow/util/log"
)

func ProvideWhatsmeowClient(db *sql.DB) (*whatsmeow.Client, func(), error) {
	ctx := context.Background()

	// Logger silencioso
	dbLog := waLog.Stdout("Database", "WARN", true)

	// Reuse the CRM pool; NewWithDB requires an explicit schema upgrade.
	container := sqlstore.NewWithDB(db, "sqlite3", dbLog)
	if err := container.Upgrade(ctx); err != nil {
		return nil, nil, err
	}

	// This installation owns one WhatsApp device.
	deviceStore, err := container.GetFirstDevice(ctx)
	if err != nil {
		return nil, nil, err
	}

	clientLog := waLog.Stdout("Client", "WARN", true)
	client := whatsmeow.NewClient(deviceStore, clientLog)

	// The SQLite provider owns the pool. Never call container.Close here.
	return client, func() { client.Disconnect() }, nil
}
