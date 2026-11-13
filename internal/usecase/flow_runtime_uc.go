package usecase

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"log/slog"
	"regexp"
	"strconv"
	"strings"
	"time"
	"uuid"

	"github.com/Jeffersoncharlles/KlozerWapp/internal/domain"
)

type flowRuntime struct {
	store     domain.FlowRuntimeStore
	flows     domain.FlowRepository
	sender    domain.FlowSender
	http      domain.FlowHTTPClient
	contacts  domain.ContactUseCase
	welcome   AutoReplyUseCase
	schedules domain.ScheduleRepository
}

func NewFlowRuntime(store domain.FlowRuntimeStore, flows domain.FlowRepository, sender domain.FlowSender, http domain.FlowHTTPClient, contacts domain.ContactUseCase, welcome AutoReplyUseCase, schedules domain.ScheduleRepository) domain.FlowRuntimeUseCase {
	return &flowRuntime{store, flows, sender, http, contacts, welcome, schedules}
}

func IncomingKey(e domain.FlowIncoming) string {
	h := sha256.Sum256([]byte(e.ConnectionID + "\x00" + e.ChatID + "\x00" + e.ID))
	return hex.EncodeToString(h[:])
}

func (uc *flowRuntime) Receive(ctx context.Context, e domain.FlowIncoming) error {
	if e.ID == "" || e.ConnectionID == "" || e.ChatID == "" {
		return fmt.Errorf("evento WhatsApp sem identidade")
	}
	e.ID = IncomingKey(e)
	_, err := uc.store.Receive(ctx, e)
	return err
}

func matches(f *domain.Flow, text string) bool {
	text = strings.ToLower(strings.TrimSpace(text))
	keywords := strings.ToLower(strings.TrimSpace(f.Keywords))
	if keywords == "" {
		return true
	}
	if f.KeywordMatch == "exact" {
		return text == keywords
	}
	parts := strings.FieldsFunc(keywords, func(r rune) bool { return r == ',' || r == ';' || r == '\n' })
	matched := 0
	total := 0
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		total++
		if strings.Contains(text, part) {
			matched++
		}
	}
	if f.KeywordMatch == "all" {
		return total > 0 && matched == total
	}
	return matched > 0
}

func nextNode(g domain.FlowGraph, id, handle string) string {
	for _, e := range g.Edges {
		h := "next"
		if e.SourceHandle != nil {
			h = *e.SourceHandle
		}
		if e.Source == id && h == handle {
			return e.Target
		}
	}
	return ""
}

var variablePlaceholder = regexp.MustCompile(`\{\{([a-zA-Z0-9_.-]+)\}\}`)

func interpolate(text string, vars map[string]string) string {
	// Single-pass substitution: values are never recursively interpreted.
	return variablePlaceholder.ReplaceAllStringFunc(text, func(match string) string {
		if value, ok := vars[match[2:len(match)-2]]; ok {
			return value
		}
		return match
	})
}

// advance is shared by real execution and simulation. It returns effects rather
// than sending messages or writing state inside the graph traversal.
func (uc *flowRuntime) advance(ctx context.Context, f *domain.Flow, s *domain.FlowSession, simulate bool) ([]domain.FlowEffect, error) {
	effects := []domain.FlowEffect{}
	s.State = "running"
	s.WakeAt = nil
	for s.NodeID != "" {
		if ctx.Err() != nil {
			return nil, ctx.Err()
		}
		if s.Transitions >= 500 {
			s.State = "failed"
			return effects, nil
		}
		var node *domain.FlowNode
		for i := range f.Graph.Nodes {
			if f.Graph.Nodes[i].ID == s.NodeID {
				node = &f.Graph.Nodes[i]
				break
			}
		}
		if node == nil {
			return nil, fmt.Errorf("passo não encontrado na versão publicada")
		}
		s.Transitions++
		d := node.Data
		handle := "next"
		message := interpolate(d.Message, s.Variables)
		switch node.Type {
		case "message", "interactive-message":
			if node.Type == "interactive-message" {
				for i, o := range d.Options {
					message += fmt.Sprintf("\n%d - %s", i+1, o.Label)
				}
			}
			if len(message) > 16000 {
				s.State = "failed"
				return effects, nil
			}
			effects = append(effects, domain.FlowEffect{ID: fmt.Sprintf("%s-%06d", s.ID, s.Transitions), SessionID: s.ID, Phone: s.Phone, Text: message})
			if node.Type == "interactive-message" {
				s.State = "waiting"
				seconds := d.Seconds
				if seconds == 0 {
					seconds = 300
				}
				wake := time.Now().UTC().Add(time.Duration(seconds) * time.Second)
				s.WakeAt = &wake
				return effects, nil
			}
		case "variable":
			s.Variables[d.Variable] = interpolate(d.Value, s.Variables)
		case "condition":
			value := s.Variables[d.Variable]
			expected := interpolate(d.Value, s.Variables)
			ok := value == expected
			if d.Operator == "contains" {
				ok = strings.Contains(value, expected)
			}
			if d.Operator == "exists" {
				_, ok = s.Variables[d.Variable]
			}
			handle = strconv.FormatBool(ok)
		case "delay":
			s.NodeID = nextNode(f.Graph, node.ID, "next")
			if s.NodeID == "" {
				s.State = "completed"
				return effects, nil
			}
			if !simulate && d.Seconds > 0 {
				wake := time.Now().UTC().Add(time.Duration(d.Seconds) * time.Second)
				s.State = "sleeping"
				s.WakeAt = &wake
				return effects, nil
			}
			continue
		case "http-request":
			handle = "success"
			value := "[resposta HTTP simulada]"
			if !simulate {
				var err error
				d.Body = interpolate(d.Body, s.Variables)
				value, err = uc.http.Execute(ctx, d)
				if err != nil {
					handle = "error"
					value = err.Error()
				}
			}
			if d.Variable != "" {
				s.Variables[d.Variable] = value
			}
		default:
			return nil, fmt.Errorf("tipo não executável: %s", node.Type)
		}
		s.NodeID = nextNode(f.Graph, node.ID, handle)
		var variableBytes int
		for key, value := range s.Variables {
			variableBytes += len(key) + len(value)
		}
		if len(s.Variables) > 100 || variableBytes > 131072 {
			s.State = "failed"
			return effects, nil
		}
	}
	s.State = "completed"
	return effects, nil
}

func selectOption(f *domain.Flow, s *domain.FlowSession, text, optionID string) string {
	for _, n := range f.Graph.Nodes {
		if n.ID != s.NodeID {
			continue
		}
		for i, o := range n.Data.Options {
			if optionID == o.ID || strings.EqualFold(strings.TrimSpace(text), o.Label) || strings.TrimSpace(text) == strconv.Itoa(i+1) {
				return o.ID
			}
		}
	}
	return ""
}

func (uc *flowRuntime) process(ctx context.Context, e domain.FlowIncoming) error {
	schedule, err := uc.schedules.Get(ctx)
	if err != nil {
		return err
	}
	if !schedule.Enabled || !schedule.IsConfigured() || !schedule.AutoReplyEnabled {
		return uc.store.Complete(ctx, e.ID, false)
	}
	if !schedule.IsOpen(e.Timestamp) {
		contact, err := uc.contacts.GetByPhone(ctx, e.Phone)
		if err != nil {
			return err
		}
		if err := uc.welcome.ProcessWelcomeMessage(ctx, contact); err != nil {
			return err
		}
		return uc.store.Complete(ctx, e.ID, false)
	}
	s, err := uc.store.Session(ctx, e)
	if err != nil {
		return err
	}
	if s != nil && (e.Text == "/cancelar" || e.Text == "/atendente") {
		s.State = "cancelled"
		if e.Text == "/atendente" {
			s.State = "transferred"
		}
		s.WakeAt = nil
		s.EventID = e.ID
		return uc.store.SaveSession(ctx, s, nil)
	}
	if s != nil && s.State == "transferred" {
		return uc.store.Complete(ctx, e.ID, true)
	}
	if s != nil && s.State == "sleeping" {
		return uc.store.Complete(ctx, e.ID, true)
	}
	var f *domain.Flow
	if s != nil {
		f, err = uc.store.Published(ctx, s.FlowID, s.Version)
	} else {
		f, err = uc.store.BoundPublished(ctx)
	}
	if err != nil {
		return err
	}
	if f == nil || (s == nil && !matches(f, e.Text)) {
		contact, err := uc.contacts.GetByPhone(ctx, e.Phone)
		if err != nil {
			return err
		}
		if err := uc.welcome.ProcessWelcomeMessage(ctx, contact); err != nil {
			return err
		}
		return uc.store.Complete(ctx, e.ID, false)
	}
	if s == nil {
		s = &domain.FlowSession{ID: uuid.New().String(), FlowID: f.ID, Version: f.PublishedRevision, ConnectionID: e.ConnectionID, ChatID: e.ChatID, Phone: e.Phone, NodeID: f.Graph.StartNodeID, Variables: map[string]string{}}
	} else {
		handle := selectOption(f, s, e.Text, e.OptionID)
		if s.WakeAt != nil && !e.Timestamp.Before(*s.WakeAt) {
			handle = "timeout"
		}
		if handle == "" {
			return uc.store.Complete(ctx, e.ID, true)
		}
		s.NodeID = nextNode(f.Graph, s.NodeID, handle)
	}
	s.Variables["lastMessage"] = e.Text
	s.EventID = e.ID
	effects, err := uc.advance(ctx, f, s, false)
	if err != nil {
		return err
	}
	return uc.store.SaveSession(ctx, s, effects)
}

func (uc *flowRuntime) tick(ctx context.Context) {
	events, err := uc.store.Pending(ctx)
	if err != nil {
		slog.Error("ler eventos de automação", "err", err)
		return
	}
	for _, e := range events {
		if err := uc.process(ctx, e); err != nil {
			slog.Error("processar automação", "event_id", e.ID, "err", err)
			break
		}
	}
	sessions, err := uc.store.Due(ctx, time.Now().UTC())
	if err != nil {
		slog.Error("ler esperas de automação", "err", err)
		return
	}
	for i := range sessions {
		s := &sessions[i]
		f, err := uc.store.Published(ctx, s.FlowID, s.Version)
		if err != nil || f == nil {
			continue
		}
		if s.State == "waiting" {
			s.NodeID = nextNode(f.Graph, s.NodeID, "timeout")
		}
		effects, err := uc.advance(ctx, f, s, false)
		if err == nil {
			err = uc.store.SaveSession(ctx, s, effects)
		}
		if err != nil {
			slog.Error("retomar automação", "session_id", s.ID, "err", err)
		}
	}
	effects, err := uc.store.Effects(ctx)
	if err != nil {
		slog.Error("ler saídas de automação", "err", err)
		return
	}
	for _, e := range effects {
		err := uc.sender.SendFlowMessage(ctx, e.Phone, e.Text, e.ID)
		if saveErr := uc.store.FinishEffect(ctx, e.ID, err == nil); saveErr != nil {
			slog.Error("registrar envio de automação", "err", saveErr)
			break
		}
		if err != nil {
			slog.Warn("envio de automação pendente", "effect_id", e.ID, "err", err)
			continue
		}
	}
}

func (uc *flowRuntime) Run(ctx context.Context) {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			uc.tick(ctx)
		}
	}
}

func (uc *flowRuntime) Simulate(ctx context.Context, id string, inputs []string) ([]string, error) {
	f, err := uc.flows.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if err := validateFlow(f, true); err != nil {
		return nil, err
	}
	s := &domain.FlowSession{ID: "simulation", NodeID: f.Graph.StartNodeID, Variables: map[string]string{}}
	all := []string{}
	effects, err := uc.advance(ctx, f, s, true)
	if err != nil {
		return nil, err
	}
	for _, e := range effects {
		all = append(all, e.Text)
	}
	for _, input := range inputs {
		if s.State != "waiting" {
			break
		}
		handle := selectOption(f, s, input, "")
		if handle == "" {
			continue
		}
		s.NodeID = nextNode(f.Graph, s.NodeID, handle)
		s.Variables["lastMessage"] = input
		effects, err = uc.advance(ctx, f, s, true)
		if err != nil {
			return nil, err
		}
		for _, e := range effects {
			all = append(all, e.Text)
		}
	}
	return all, nil
}
