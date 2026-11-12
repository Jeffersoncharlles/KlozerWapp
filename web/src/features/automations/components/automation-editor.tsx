import '@xyflow/react/dist/style.css'
import { useAutomationEditor } from '../hooks/use-automation-editor'
import { useAutomationFlow } from '../hooks/use-automation-flow'
import type { AutomationFlow } from '../types'
import { AutomationEditorHeader } from './automation-editor-header'
import { AutomationEditorStatus } from './automation-editor-status'
import { AutomationFlowCanvas } from './automation-flow-canvas'
import { AutomationInspector } from './automation-inspector'
import { AutomationPalette } from './automation-palette'
import { AutomationSimulation } from './automation-simulation'

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
      <AutomationEditorStatus result={editor.fetcher.data} warnings={editor.warnings} />
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
      <AutomationSimulation
        busy={editor.busy}
        isDirty={editor.isDirty}
        onSimulate={(inputs) => editor.submit({ intent: 'simulate', inputs })}
      />
    </main>
  )
}
