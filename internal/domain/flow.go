package domain

import (
	"context"
	"time"
)

// Flow representa a árvore ou o fluxo principal de automação
type Flow struct {
	ID             string     `json:"id" gorm:"primaryKey;type:varchar(36)"`
	Name           string     `json:"name" gorm:"not null"`
	TriggerKeyword string     `json:"trigger_keyword"` // Palavra-chave que ativa o fluxo (ex: "menu", "suporte")
	IsActive       bool       `json:"is_active" gorm:"default:true"`
	Nodes          []FlowNode `json:"nodes" gorm:"foreignKey:FlowID;constraint:OnDelete:CASCADE"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

// FlowNodeType define o tipo de ação do nó (ex: message, question, condition, transfer)
type FlowNodeType string

const (
	NodeTypeMessage  FlowNodeType = "MESSAGE"  // Envia apenas um texto/mídia
	NodeTypeQuestion FlowNodeType = "QUESTION" // Faz uma pergunta e espera a resposta do usuário
	NodeTypeAction   FlowNodeType = "ACTION"   // Executa uma ação interna (atribuir tag, mover kanban)
)

// FlowNode representa um passo/bloco dentro do fluxo
type FlowNode struct {
	ID         string       `json:"id" gorm:"primaryKey;type:varchar(36)"`
	FlowID     string       `json:"flow_id" gorm:"type:varchar(36);not null"`
	Type       FlowNodeType `json:"type" gorm:"not null"`
	Content    string       `json:"content" gorm:"type:text"` // O texto da mensagem ou pergunta
	NextNodeID string       `json:"next_node_id"`             // ID do próximo nó caso seja linear
	Options    string       `json:"options" gorm:"type:text"` // JSON guardando opções de menu (se houver)
	CreatedAt  time.Time    `json:"created_at"`
}

// FlowRepository define o contrato com o banco de dados
type FlowRepository interface {
	Create(ctx context.Context, flow *Flow) error
	GetByID(ctx context.Context, id string) (*Flow, error)
	GetByKeyword(ctx context.Context, keyword string) (*Flow, error)
	List(ctx context.Context) ([]Flow, error)
	Delete(ctx context.Context, id string) error
}

// FlowUseCase define as regras de negócio
type FlowUseCase interface {
	CreateFlow(ctx context.Context, name, triggerKeyword string, nodes []FlowNode) (*Flow, error)
	ListFlows(ctx context.Context) ([]Flow, error)
	GetFlow(ctx context.Context, id string) (*Flow, error)
	DeleteFlow(ctx context.Context, id string) error

	// Executa o próximo passo do chatbot quando chega uma mensagem no WhatsApp
	ProcessIncomingMessage(ctx context.Context, phone, messageContent string) (bool, error)
}
