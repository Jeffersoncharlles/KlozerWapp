package domain

import (
	"context"
	"time"
)

// Flow is the editable aggregate, independent of HTTP and persistence models.
type Flow struct {
	ID                string      `json:"id"`
	Name              string      `json:"name"`
	Trigger           string      `json:"trigger"`
	Keywords          string      `json:"keywords"`
	KeywordMatch      string      `json:"keywordMatch"`
	Enabled           bool        `json:"enabled"`
	Graph             FlowGraph   `json:"graph"`
	Revision          int64       `json:"revision"`
	PublishedRevision int64       `json:"publishedRevision"`
	Warnings          []FlowIssue `json:"warnings"`
	CreatedAt         time.Time   `json:"createdAt"`
	UpdatedAt         time.Time   `json:"updatedAt"`
}

type FlowGraph struct {
	Version     int        `json:"version"`
	Kind        string     `json:"kind"`
	StartNodeID string     `json:"startNodeId"`
	Nodes       []FlowNode `json:"nodes"`
	Edges       []FlowEdge `json:"edges"`
}

type FlowPosition struct {
	X float64 `json:"x"`
	Y float64 `json:"y"`
}
type FlowOption struct {
	ID    string `json:"id"`
	Label string `json:"label"`
}

// Each node type uses a documented subset; arbitrary expressions/scripts are
// deliberately not evaluated. Unknown JSON fields are rejected at delivery.
type FlowNodeData struct {
	Label       string       `json:"label"`
	Description string       `json:"description"`
	Message     string       `json:"message,omitempty"`
	Options     []FlowOption `json:"options,omitempty"`
	Variable    string       `json:"variable,omitempty"`
	Value       string       `json:"value,omitempty"`
	Operator    string       `json:"operator,omitempty"`
	Seconds     int          `json:"seconds,omitempty"`
	URL         string       `json:"url,omitempty"`
	Method      string       `json:"method,omitempty"`
	Body        string       `json:"body,omitempty"`
}
type FlowNode struct {
	ID       string       `json:"id"`
	Type     string       `json:"type"`
	Position FlowPosition `json:"position"`
	Data     FlowNodeData `json:"data"`
}
type FlowEdge struct {
	ID           string  `json:"id"`
	Source       string  `json:"source"`
	Target       string  `json:"target"`
	SourceHandle *string `json:"sourceHandle"`
	TargetHandle *string `json:"targetHandle"`
}
type FlowSummary struct {
	ID                string `json:"id"`
	Name              string `json:"name"`
	Kind              string `json:"kind"`
	Keywords          string `json:"keywords"`
	Enabled           bool   `json:"enabled"`
	Steps             int    `json:"steps"`
	Revision          int64  `json:"revision"`
	PublishedRevision int64  `json:"publishedRevision"`
}
type FlowIssue struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}
type FlowError struct {
	Code    string
	Message string
	Fields  []FlowIssue
}

func (e *FlowError) Error() string { return e.Message }
func FlowNotFound() error          { return &FlowError{Code: "not_found", Message: "fluxo não encontrado"} }
func FlowConflict() error {
	return &FlowError{Code: "revision_conflict", Message: "o fluxo foi alterado; recarregue antes de salvar"}
}

type FlowPatch struct {
	Revision     int64      `json:"revision"`
	Name         *string    `json:"name"`
	Trigger      *string    `json:"trigger"`
	Keywords     *string    `json:"keywords"`
	KeywordMatch *string    `json:"keywordMatch"`
	Enabled      *bool      `json:"enabled"`
	Graph        *FlowGraph `json:"graph"`
}
type FlowRepository interface {
	Create(context.Context, *Flow) error
	GetByID(context.Context, string) (*Flow, error)
	List(context.Context, string) ([]FlowSummary, error)
	Update(context.Context, *Flow, int64) error
	Publish(context.Context, *Flow, int64) error
	Delete(context.Context, string, int64) error
	GetBinding(context.Context) (string, error)
	Bind(context.Context, string) error
}
type FlowUseCase interface {
	CreateFlow(context.Context, string) (*Flow, error)
	ListFlows(context.Context, string) ([]FlowSummary, error)
	GetFlow(context.Context, string) (*Flow, error)
	UpdateFlow(context.Context, string, FlowPatch) (*Flow, error)
	PublishFlow(context.Context, string, int64) (*Flow, error)
	DuplicateFlow(context.Context, string) (*Flow, error)
	DeleteFlow(context.Context, string, int64) error
	GetBinding(context.Context) (string, error)
	BindFlow(context.Context, string) error
}

// Runtime ports deliberately separate execution from flow management.
type FlowIncoming struct {
	ID           string    `json:"id"`
	ConnectionID string    `json:"connectionId"`
	ChatID       string    `json:"chatId"`
	Phone        string    `json:"phone"`
	Text         string    `json:"text"`
	OptionID     string    `json:"optionId"`
	Timestamp    time.Time `json:"timestamp"`
}
type FlowSession struct {
	EventID      string
	ID           string
	FlowID       string
	Version      int64
	ConnectionID string
	ChatID       string
	Phone        string
	NodeID       string
	State        string
	Variables    map[string]string
	WakeAt       *time.Time
	Transitions  int
}
type FlowEffect struct {
	ID        string
	SessionID string
	Phone     string
	Text      string
	Attempts  int
}
type FlowRuntimeStore interface {
	Receive(context.Context, FlowIncoming) (bool, error)
	Pending(context.Context) ([]FlowIncoming, error)
	Complete(context.Context, string, bool) error
	Session(context.Context, FlowIncoming) (*FlowSession, error)
	Published(context.Context, string, int64) (*Flow, error)
	BoundPublished(context.Context) (*Flow, error)
	SaveSession(context.Context, *FlowSession, []FlowEffect) error
	Due(context.Context, time.Time) ([]FlowSession, error)
	Effects(context.Context) ([]FlowEffect, error)
	FinishEffect(context.Context, string, bool) error
}
type FlowRuntimeUseCase interface {
	Receive(context.Context, FlowIncoming) error
	Run(context.Context)
	Simulate(context.Context, string, []string) ([]string, error)
}
type FlowSender interface {
	SendFlowMessage(context.Context, string, string, string) error
}
type FlowHTTPClient interface {
	Execute(context.Context, FlowNodeData) (string, error)
}
