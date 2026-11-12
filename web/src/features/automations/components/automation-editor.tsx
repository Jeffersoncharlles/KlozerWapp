import '@xyflow/react/dist/style.css'
import { Play } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { useAutomationEditor } from '../hooks/use-automation-editor'
import { useAutomationFlow } from '../hooks/use-automation-flow'
import type { AutomationFlow } from '../types'
import { AutomationActionFeedback } from './automation-action-feedback'
import { AutomationEditorHeader } from './automation-editor-header'
import { AutomationFlowCanvas } from './automation-flow-canvas'
import { AutomationInspector } from './automation-inspector'
import { AutomationPalette } from './automation-palette'

export function AutomationEditor({
  initialFlow,
  boundFlowId,
}: {
  initialFlow: AutomationFlow
  boundFlowId?: string
}) {
  const {
    flow: graphFlow,
    renderedNodes,
    addNode,
    onConnect,
    onEdgesChange,
    onNodesChange,
    removeNode,
    selectedNode,
    setSelectedNodeId,
    setStartNodeId,
    updateNode,
  } = useAutomationFlow(initialFlow)
  const editor = useAutomationEditor(initialFlow, graphFlow)
  const [simulationInputs, setSimulationInputs] = useState('')

  return (
    <main className="flex min-h-[700px] flex-col bg-background text-foreground">
      <AutomationEditorHeader
        flow={editor.draft}
        boundFlowId={boundFlowId}
        busy={editor.busy}
        isDirty={editor.isDirty}
        name={editor.name}
        keywords={editor.keywords}
        keywordMatch={editor.keywordMatch}
        enabled={editor.enabled}
        onNameChange={editor.setName}
        onKeywordsChange={editor.setKeywords}
        onKeywordMatchChange={editor.setKeywordMatch}
        onEnabledChange={editor.setEnabled}
        onSubmit={(mutation) =>
          editor.submit(mutation.intent === 'save' ? { ...mutation, flow: editor.draft } : mutation)
        }
      />
      <div className="space-y-2 px-4 py-2">
        <AutomationActionFeedback result={editor.fetcher.data} />
        {editor.warnings.length > 0 && (
          <details className="text-xs text-amber-700 dark:text-amber-300">
            <summary>{editor.warnings.length} aviso(s) no rascunho</summary>
            <ul className="mt-2 list-inside list-disc">
              {editor.warnings.map((issue, index) => (
                <li key={index}>{issue.message}</li>
              ))}
            </ul>
          </details>
        )}
        <p className="text-xs text-muted-foreground">
          Salvar altera o rascunho. Publicar atualiza novas conversas; conversas em andamento mantêm
          a versão original. Publicação e vínculo exigem administrador.
        </p>
      </div>
      <div className="grid h-[650px] min-h-0 grid-cols-[180px_minmax(320px,1fr)_240px] overflow-auto lg:grid-cols-[230px_minmax(0,1fr)_280px]">
        <AutomationPalette onAdd={(type) => addNode(type)} />
        <AutomationFlowCanvas
          nodes={renderedNodes}
          edges={graphFlow.graph.edges}
          busy={editor.busy}
          onConnect={onConnect}
          onEdgesChange={onEdgesChange}
          onNodesChange={onNodesChange}
          onAdd={addNode}
          onSelect={setSelectedNodeId}
        />
        <AutomationInspector
          node={selectedNode}
          onChange={updateNode}
          onRemove={removeNode}
          onStart={setStartNodeId}
        />
      </div>
      <section className="flex flex-wrap items-center gap-2 border-t border-border p-4">
        <Input
          aria-label="Respostas para simulação"
          className="max-w-md"
          value={simulationInputs}
          onChange={(event) => setSimulationInputs(event.target.value)}
          placeholder="Respostas separadas por ; (ex.: 1;sim)"
        />
        <Button
          variant="outline"
          disabled={editor.busy || editor.isDirty}
          onClick={() =>
            editor.submit({
              intent: 'simulate',
              inputs: simulationInputs
                ? simulationInputs.split(';').map((value) => value.trim())
                : [],
            })
          }
        >
          <Play className="size-4" />
          Simular rascunho salvo
        </Button>
      </section>
    </main>
  )
}
