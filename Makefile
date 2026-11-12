build:
	go build -o crm-api ./cmd

dev:
	go run ./cmd

wire:
	wire gen ./cmd 