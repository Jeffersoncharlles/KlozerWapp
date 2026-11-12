import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider, useReactFlow, type NodeTypes } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { ArrowLeft, Copy, Plus, Save, Trash2, Workflow, Upload, Link2, Play } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useBeforeUnload, useBlocker, useFetcher, useNavigate } from 'react-router'
import { toast } from 'sonner'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { PageContainer, WorkspaceHeader } from '../../../components/workspace-header'
import { automationNodeTypeSchema, type AutomationFlow } from '../types'
import { useAutomationFlow } from '../hooks/use-automation-flow'
import { AutomationFlowNode } from './automation-flow-node'
import { AutomationInspector } from './automation-inspector'
import { AutomationPalette } from './automation-palette'
import { useTheme } from '../../../core/theme/theme-provider'
import type { AutomationActionResult, AutomationLoaderData } from '../../../pages/automations'

function snapshot(flow: AutomationFlow) {
  return JSON.stringify({ name: flow.name, keywords: flow.keywords, keywordMatch: flow.keywordMatch, enabled: flow.enabled,
    graph: { ...flow.graph, nodes: flow.graph.nodes.map(({ id, type, position, data }) => ({ id, type, position,
      data: Object.fromEntries(Object.entries(data).filter(([key, value]) => key !== 'isStart' && (key === 'label' || key === 'description' || (value !== undefined && value !== '' && value !== 0 && (!Array.isArray(value) || value.length > 0)))).sort(([a], [b]) => a.localeCompare(b))) })) } })
}
const nodeTypes = { message: AutomationFlowNode, 'interactive-message': AutomationFlowNode, condition: AutomationFlowNode, delay: AutomationFlowNode, variable: AutomationFlowNode, 'http-request': AutomationFlowNode } satisfies NodeTypes

function ActionFeedback({ result }: { result?: AutomationActionResult }) {
  return <>
    {result?.error && <div role="alert" className="rounded border border-destructive/50 bg-destructive/5 p-3 text-sm"><p>{result.error}</p>{result.fields?.length ? <ul className="mt-2 list-inside list-disc">{result.fields.map((field, index) => <li key={index}>{field.field}: {field.message}</li>)}</ul> : null}</div>}
    {result?.messages && <pre role="status" className="max-h-60 overflow-auto whitespace-pre-wrap rounded border border-border bg-card p-3 text-sm">{result.messages.join('\n\n')}</pre>}
  </>
}
function useActionNotice(result?: AutomationActionResult) {
  const last = useRef<AutomationActionResult | undefined>(undefined)
  useEffect(() => { if (result && result !== last.current) { last.current = result; if (result.message) toast.success(result.message) } }, [result])
}

function AutomationEditor({ initialFlow, boundFlowId }: { initialFlow: AutomationFlow; boundFlowId?: string }) {
  const { theme } = useTheme()
  const { screenToFlowPosition } = useReactFlow()
  const navigate = useNavigate()
  const fetcher = useFetcher<AutomationActionResult>()
  const busy = fetcher.state !== 'idle'
  const [name, setName] = useState(initialFlow.name)
  const [keywords, setKeywords] = useState(initialFlow.keywords)
  const [keywordMatch, setKeywordMatch] = useState(initialFlow.keywordMatch)
  const [enabled, setEnabled] = useState(initialFlow.enabled)
  const [revision, setRevision] = useState(initialFlow.revision)
  const [publishedRevision, setPublishedRevision] = useState(initialFlow.publishedRevision)
  const [warnings, setWarnings] = useState(initialFlow.warnings)
  const [simulationInputs, setSimulationInputs] = useState('')
  const { addNode, flow, renderedNodes, onConnect, onEdgesChange, onNodesChange, removeNode, selectedNode, setSelectedNodeId, setStartNodeId, updateNode } = useAutomationFlow(initialFlow)
  const draft = { ...flow, name, keywords, keywordMatch, enabled, revision, publishedRevision }
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(initialFlow))
  const isDirty = snapshot(draft) !== savedSnapshot
  const blocker = useBlocker(useCallback(({ currentLocation, nextLocation }) => isDirty && currentLocation.pathname !== nextLocation.pathname, [isDirty]))
  useEffect(() => { if (blocker.state === 'blocked') { if (window.confirm('Descartar alterações não salvas?')) blocker.proceed(); else blocker.reset() } }, [blocker])
  useBeforeUnload(useCallback((event) => { if (isDirty) { event.preventDefault(); event.returnValue = '' } }, [isDirty]))
  const lastSaved = useRef<AutomationFlow | undefined>(undefined)
  useEffect(() => {
    const saved = fetcher.data?.flow
    if (saved && saved !== lastSaved.current) {
      lastSaved.current = saved; setName(saved.name); setRevision(saved.revision); setPublishedRevision(saved.publishedRevision)
      setWarnings(saved.warnings); setSavedSnapshot(snapshot(saved))
    }
  }, [fetcher.data])
  useActionNotice(fetcher.data)
  const submit = (payload: Parameters<typeof fetcher.submit>[0]) => { void fetcher.submit(payload, { method: 'post', encType: 'application/json' }) }

  return <main className="flex min-h-[700px] flex-col bg-background text-foreground">
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-3 sm:px-6">
      <Button size="sm" variant="ghost" disabled={busy} onClick={() => navigate('/dashboard/automations')}><ArrowLeft className="size-4" />Fluxos</Button>
      <Input aria-label="Nome da automação" disabled={busy} className="h-9 w-48" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} />
      <Input aria-label="Palavras-chave" disabled={busy} className="h-9 w-44" maxLength={1000} value={keywords} onChange={(event) => setKeywords(event.target.value)} placeholder="Palavras-chave (vazio: todas)" />
      <select aria-label="Correspondência das palavras-chave" disabled={busy} className="h-9 rounded border border-input bg-background px-2 text-xs" value={keywordMatch} onChange={(event) => setKeywordMatch(event.target.value as AutomationFlow['keywordMatch'])}><option value="any">Qualquer palavra</option><option value="all">Todas as palavras</option><option value="exact">Texto exato</option></select>
      <label className="flex items-center gap-2 text-xs"><input type="checkbox" disabled={busy || !publishedRevision} checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />Ativo</label>
      <span className="text-xs text-muted-foreground">Revisão {revision} · {publishedRevision ? `Publicada ${publishedRevision}` : 'Não publicado'}</span>
      {isDirty && <span className="text-xs text-amber-600 dark:text-amber-400">Alterações não salvas</span>}
      <Button disabled={busy || !isDirty} onClick={() => submit({ intent: 'save', flow: draft })}><Save className="size-4" />Salvar</Button>
      <Button variant="outline" disabled={busy || isDirty} onClick={() => submit({ intent: 'publish', revision })}><Upload className="size-4" />Publicar</Button>
      {boundFlowId !== undefined && <Button variant="outline" disabled={busy || isDirty || !publishedRevision} onClick={() => submit({ intent: 'bind', flowId: boundFlowId === initialFlow.id ? '' : initialFlow.id })}><Link2 className="size-4" />{boundFlowId === initialFlow.id ? 'Desvincular' : 'Vincular conexão'}</Button>}
    </div>
    <div className="space-y-2 px-4 py-2">
      <ActionFeedback result={fetcher.data} />
      {warnings.length > 0 && <details className="text-xs text-amber-700 dark:text-amber-300"><summary>{warnings.length} aviso(s) no rascunho</summary><ul className="mt-2 list-inside list-disc">{warnings.map((issue, index) => <li key={index}>{issue.message}</li>)}</ul></details>}
      <p className="text-xs text-muted-foreground">Salvar altera o rascunho. Publicar atualiza novas conversas; conversas em andamento mantêm a versão original. Publicação e vínculo exigem administrador.</p>
    </div>
    <div className={`grid h-[650px] min-h-0 grid-cols-[180px_minmax(320px,1fr)_240px] overflow-auto lg:grid-cols-[230px_minmax(0,1fr)_280px] ${busy ? 'pointer-events-none opacity-70' : ''}`}>
      <AutomationPalette onAdd={addNode} />
      <section className="relative h-full min-w-0 bg-background" aria-label="Construtor de automação">
        <ReactFlow colorMode={theme} defaultEdgeOptions={{ animated: true, style: { stroke: 'var(--primary)', strokeWidth: 2 } }} fitViewOptions={{ padding: 0.2, maxZoom: 1 }} fitView edges={flow.graph.edges} nodes={renderedNodes} nodeTypes={nodeTypes}
          onConnect={onConnect} onEdgesChange={onEdgesChange} onNodesChange={onNodesChange} onNodeClick={(_, node) => setSelectedNodeId(node.id)} onPaneClick={() => setSelectedNodeId(undefined)}
          onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move' }}
          onDrop={(event) => { event.preventDefault(); const type = automationNodeTypeSchema.safeParse(event.dataTransfer.getData('application/klozer-automation-node')); if (type.success) addNode(type.data, screenToFlowPosition({ x: event.clientX, y: event.clientY })) }}>
          <Background gap={22} size={1} variant={BackgroundVariant.Dots} /><Controls showInteractive={false} /><MiniMap style={{ width: 132, height: 88 }} nodeColor="var(--primary)" className="!rounded-lg !border !bg-card" maskColor="rgb(148 163 184 / 0.18)" pannable zoomable />
        </ReactFlow>
      </section>
      <AutomationInspector node={selectedNode} onChange={updateNode} onRemove={removeNode} onStart={setStartNodeId} />
    </div>
    <section className="flex flex-wrap items-center gap-2 border-t border-border p-4">
      <Input aria-label="Respostas para simulação" className="max-w-md" value={simulationInputs} onChange={(event) => setSimulationInputs(event.target.value)} placeholder="Respostas separadas por ; (ex.: 1;sim)" />
      <Button variant="outline" disabled={busy || isDirty} onClick={() => submit({ intent: 'simulate', inputs: simulationInputs ? simulationInputs.split(';').map((value) => value.trim()) : [] })}><Play className="size-4" />Simular rascunho salvo</Button>
    </section>
  </main>
}

export function AutomationsContainer({ data }: { data: AutomationLoaderData }) {
  const fetcher = useFetcher<AutomationActionResult>()
  const busy = fetcher.state !== 'idle'
  useActionNotice(fetcher.data)
  const submit = (payload: Parameters<typeof fetcher.submit>[0]) => { void fetcher.submit(payload, { method: 'post', encType: 'application/json' }) }
  return <PageContainer>
    <WorkspaceHeader title="Fluxos" description="Construa automações visuais para suas conversas" />
    {data.flow ? <ReactFlowProvider key={data.flow.id}><AutomationEditor initialFlow={data.flow} boundFlowId={data.boundFlowId} /></ReactFlowProvider> :
      <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4"><div><h1 className="text-xl font-semibold">Automações</h1><p className="mt-1 text-sm text-muted-foreground">Fluxos persistidos no CRM. Publique, ative e vincule à conexão para executar.</p></div><Button disabled={busy} onClick={() => submit({ intent: 'create' })}><Plus className="size-4" />Criar automação</Button></div>
        <ActionFeedback result={fetcher.data} />
        {data.flows?.length ? <div className="divide-y rounded-xl border border-border bg-card">
          {data.flows.map((item) => <div key={item.id} className="flex items-center gap-3 p-4">
            <button type="button" disabled={busy || !item.publishedRevision} aria-label={item.enabled ? 'Desativar automação' : 'Ativar automação'} onClick={() => submit({ intent: 'toggle', id: item.id, revision: item.revision, enabled: !item.enabled })} className={`size-3 shrink-0 rounded-full disabled:opacity-40 ${item.enabled ? 'bg-emerald-600' : 'bg-muted-foreground'}`} />
            <Link to={`/dashboard/automations/${item.id}`} className="min-w-0 flex-1"><span className="block truncate font-medium">{item.name}</span><span className="text-xs text-muted-foreground">{item.steps} passos · {item.enabled ? 'Ativa' : 'Desativada'} · {item.publishedRevision ? `Publicada ${item.publishedRevision}` : 'Rascunho'}</span></Link>
            <Button disabled={busy} variant="ghost" size="icon-sm" aria-label="Duplicar automação" onClick={() => submit({ intent: 'duplicate', id: item.id })}><Copy className="size-4" /></Button>
            <Button disabled={busy} variant="ghost" size="icon-sm" aria-label="Excluir automação" onClick={() => { if (window.confirm(`Excluir "${item.name}" e encerrar suas sessões?`)) submit({ intent: 'delete', id: item.id, revision: item.revision }) }}><Trash2 className="size-4" /></Button>
          </div>)}
        </div> : <section className="max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-sm"><Workflow className="mx-auto mb-4 size-10 text-emerald-600" /><h2 className="text-xl font-semibold">Crie sua primeira automação</h2><p className="mt-2 text-sm text-muted-foreground">Comece com uma saudação e um menu de opções. Personalize e conecte os passos antes de publicar.</p><Button className="mt-6" disabled={busy} onClick={() => submit({ intent: 'create' })}><Plus className="size-4" />Criar automação</Button></section>}
      </main>}
  </PageContainer>
}
