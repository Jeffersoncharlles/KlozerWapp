package domain

import (
	"fmt"
	"math"
	"net/url"
	"strings"
)

func FlowOutputs(n FlowNode) []string {
	switch n.Type {
	case "message", "delay", "variable":
		return []string{"next"}
	case "condition":
		return []string{"true", "false"}
	case "http-request":
		return []string{"success", "error"}
	case "interactive-message":
		out := []string{"timeout"}
		for _, o := range n.Data.Options {
			out = append(out, o.ID)
		}
		return out
	}
	return nil
}

// ValidateFlow checks the aggregate without changing it or performing I/O.
// Broken invariants return an error; incomplete execution data returns issues
// that the application can use as draft warnings or publication blockers.
func ValidateFlow(f *Flow) ([]FlowIssue, error) {
	issues := []FlowIssue{}
	warnings := []FlowIssue{}
	bad := func(field, msg string) { issues = append(issues, FlowIssue{field, msg}) }
	warn := func(field, msg string) { warnings = append(warnings, FlowIssue{field, msg}) }
	if n := len(strings.TrimSpace(f.Name)); n == 0 || n > 120 {
		bad("name", "informe um nome de até 120 bytes")
	}
	if f.Trigger != "inbound" {
		bad("trigger", "gatilho não suportado")
	}
	if len(f.Keywords) > 1000 {
		bad("keywords", "máximo de 1000 bytes")
	}
	if f.KeywordMatch != "any" && f.KeywordMatch != "all" && f.KeywordMatch != "exact" {
		bad("keywordMatch", "use any, all ou exact")
	}
	g := f.Graph
	if g.Version != 1 || g.Kind != "chat" {
		bad("graph", "formato deve ser version=1, kind=chat")
	}
	if len(g.Nodes) < 1 || len(g.Nodes) > 200 || len(g.Edges) > 1000 {
		bad("graph", "limite de 1 a 200 passos e 1000 arestas")
	}
	nodes := map[string]FlowNode{}
	for i, n := range g.Nodes {
		field := fmt.Sprintf("graph.nodes.%d", i)
		if n.ID == "" || len(n.ID) > 100 || strings.ContainsRune(n.ID, 0) {
			bad(field+".id", "ID obrigatório de até 100 bytes")
		}
		if _, ok := nodes[n.ID]; ok {
			bad(field+".id", "ID duplicado")
		}
		nodes[n.ID] = n
		if math.IsNaN(n.Position.X) || math.IsNaN(n.Position.Y) || math.IsInf(n.Position.X, 0) || math.IsInf(n.Position.Y, 0) {
			bad(field+".position", "posição inválida")
		}
		if FlowOutputs(n) == nil {
			bad(field+".type", "tipo de passo não suportado")
		}
		if len(n.Data.Message) > 10000 || len(n.Data.Body) > 32768 || len(n.Data.Value) > 10000 || len(n.Data.Label) > 120 || len(n.Data.Description) > 1000 || len(n.Data.Variable) > 100 || len(n.Data.URL) > 2048 || len(n.Data.Options) > 10 {
			bad(field+".data", "payload excede os limites")
		}
		if n.Data.Seconds < 0 || n.Data.Seconds > 86400 {
			bad(field+".data.seconds", "intervalo deve estar entre 0 e 86400 segundos")
		}
		if (n.Type == "message" || n.Type == "interactive-message") && strings.TrimSpace(n.Data.Message) == "" {
			warn(field+".data.message", "mensagem obrigatória para executar o passo")
		}
		if n.Type == "interactive-message" {
			if len(n.Data.Options) < 1 || len(n.Data.Options) > 10 {
				warn(field+".data.options", "configure entre 1 e 10 opções")
			}
			seen := map[string]bool{}
			for _, o := range n.Data.Options {
				if o.ID == "" || o.ID == "timeout" || strings.ContainsRune(o.ID, 0) || len(o.ID) > 100 || strings.TrimSpace(o.Label) == "" || len(o.Label) > 120 || seen[o.ID] {
					bad(field+".data.options", "opção inválida ou duplicada")
				}
				seen[o.ID] = true
			}
		}
		if n.Type == "variable" || n.Type == "condition" {
			if strings.TrimSpace(n.Data.Variable) == "" {
				warn(field+".data.variable", "variável obrigatória")
			}
		}
		if n.Type == "condition" && n.Data.Operator != "equals" && n.Data.Operator != "contains" && n.Data.Operator != "exists" {
			warn(field+".data.operator", "operador deve ser equals, contains ou exists")
		}
		if n.Type == "http-request" {
			u, err := url.Parse(n.Data.URL)
			if err != nil || u.Hostname() == "" || (u.Scheme != "https" && u.Scheme != "http") || u.User != nil {
				warn(field+".data.url", "informe uma URL HTTP absoluta sem credenciais")
			}
			if n.Data.Method != "GET" && n.Data.Method != "POST" {
				warn(field+".data.method", "método deve ser GET ou POST")
			}
		}
	}
	if _, ok := nodes[g.StartNodeID]; !ok {
		bad("graph.startNodeId", "início deve referenciar um passo existente")
	}
	edges := map[string]bool{}
	outputs := map[string]bool{}
	adjacent := map[string][]string{}
	for i, e := range g.Edges {
		field := fmt.Sprintf("graph.edges.%d", i)
		if e.ID == "" || len(e.ID) > 100 || edges[e.ID] {
			bad(field+".id", "ID inválido ou duplicado")
		}
		edges[e.ID] = true
		n, source := nodes[e.Source]
		_, target := nodes[e.Target]
		if !source || !target {
			bad(field, "origem e destino devem existir")
			continue
		}
		handle := "next"
		if e.SourceHandle != nil {
			handle = *e.SourceHandle
		}
		valid := false
		for _, h := range FlowOutputs(n) {
			if h == handle {
				valid = true
			}
		}
		if !valid {
			bad(field+".sourceHandle", "saída não pertence ao tipo do passo")
		}
		if e.TargetHandle != nil && *e.TargetHandle != "input" {
			bad(field+".targetHandle", "entrada deve ser input ou null")
		}
		key := e.Source + "\x00" + handle
		if outputs[key] {
			bad(field+".sourceHandle", "apenas um destino por saída")
		}
		outputs[key] = true
		adjacent[e.Source] = append(adjacent[e.Source], e.Target)
	}
	visited := map[string]int{}
	cycle := false
	var walk func(string)
	walk = func(id string) {
		if visited[id] == 1 {
			cycle = true
			return
		}
		if visited[id] == 2 {
			return
		}
		visited[id] = 1
		for _, next := range adjacent[id] {
			walk(next)
		}
		visited[id] = 2
	}
	if _, ok := nodes[g.StartNodeID]; ok {
		walk(g.StartNodeID)
	}
	if cycle {
		warn("graph.edges", "o grafo contém um ciclo")
	}
	for _, n := range g.Nodes {
		if visited[n.ID] == 0 {
			warn("graph.nodes", "passo inalcançável: "+n.ID)
		}
		if n.Type == "condition" || n.Type == "http-request" || n.Type == "interactive-message" {
			for _, h := range FlowOutputs(n) {
				if h == "timeout" {
					continue
				}
				if !outputs[n.ID+"\x00"+h] {
					warn("graph.edges", "conecte a saída "+h+" de "+n.ID)
				}
			}
		}
	}
	if len(issues) > 0 {
		return warnings, &FlowError{Code: "invalid_flow", Message: "fluxo inválido", Fields: issues}
	}
	return warnings, nil
}
