package whatsapp

import (
	"context"

	"go.mau.fi/whatsmeow"
	"go.mau.fi/whatsmeow/store/sqlstore"
	waLog "go.mau.fi/whatsmeow/util/log"

	_ "github.com/mattn/go-sqlite3"
)

func ProvideWhatsmeowClient() (*whatsmeow.Client, error) {
	// A nova versão do Whatsmeow exige contexto nas operações de banco de dados
	ctx := context.Background()

	// Logger silencioso
	dbLog := waLog.Stdout("Database", "WARN", true)

	// Agora passamos o "ctx" como PRIMEIRO argumento
	container, err := sqlstore.New(ctx, "sqlite3", "file:wa_sessions.db?_foreign_keys=on", dbLog)
	if err != nil {
		return nil, err
	}

	// O GetFirstDevice agora também exige o "ctx"
	deviceStore, err := container.GetFirstDevice(ctx)
	if err != nil {
		return nil, err
	}

	clientLog := waLog.Stdout("Client", "WARN", true)
	client := whatsmeow.NewClient(deviceStore, clientLog)

	return client, nil
}
