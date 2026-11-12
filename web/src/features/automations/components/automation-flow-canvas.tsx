import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type NodeTypes,
} from '@xyflow/react'

import { useTheme } from '../../../core/theme/theme-provider'
import { automationNodeTypeSchema } from '../types'
import type { AutomationEdge, AutomationNodeType } from '../types'
import { AutomationFlowNode } from './automation-flow-node'
import type { AutomationCanvasNode } from './automation-flow-types'

const nodeTypes = {
  message: AutomationFlowNode,
  'interactive-message': AutomationFlowNode,
  condition: AutomationFlowNode,
  delay: AutomationFlowNode,
  variable: AutomationFlowNode,
  'http-request': AutomationFlowNode,
} satisfies NodeTypes

type Props = {
  nodes: AutomationCanvasNode[]
  edges: AutomationEdge[]
  busy: boolean
  onConnect: (connection: Connection) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onNodesChange: (changes: NodeChange<AutomationCanvasNode>[]) => void
  onAdd: (type: AutomationNodeType, position?: { x: number; y: number }) => void
  onSelect: (id?: string) => void
}

export function AutomationFlowCanvas({
  nodes,
  edges,
  busy,
  onConnect,
  onEdgesChange,
  onNodesChange,
  onAdd,
  onSelect,
}: Props) {
  const { screenToFlowPosition } = useReactFlow()
  const { theme } = useTheme()
  return (
    <section className="relative h-full min-w-0 bg-background" aria-label="Construtor de automação">
      <ReactFlow
        colorMode={theme}
        defaultEdgeOptions={{ animated: true, style: { stroke: 'var(--primary)', strokeWidth: 2 } }}
        fitViewOptions={{ padding: 0.2, maxZoom: 1 }}
        fitView
        edges={edges}
        nodes={nodes}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onEdgesChange={onEdgesChange}
        onNodesChange={onNodesChange}
        onNodeClick={(_, node) => onSelect(node.id)}
        onPaneClick={() => onSelect()}
        onDragOver={(event) => {
          event.preventDefault()
          event.dataTransfer.dropEffect = 'move'
        }}
        onDrop={(event) => {
          event.preventDefault()
          const type = automationNodeTypeSchema.safeParse(
            event.dataTransfer.getData('application/klozer-automation-node'),
          )
          if (type.success)
            onAdd(type.data, screenToFlowPosition({ x: event.clientX, y: event.clientY }))
        }}
      >
        <Background gap={22} size={1} variant={BackgroundVariant.Dots} />
        <Controls showInteractive={false} />
        <MiniMap
          style={{ width: 132, height: 88 }}
          nodeColor="var(--primary)"
          className="!rounded-lg !border !bg-card"
          maskColor="rgb(148 163 184 / 0.18)"
          pannable
          zoomable
        />
      </ReactFlow>
      {busy && <div className="absolute inset-0 z-10 cursor-wait bg-background/30" />}
    </section>
  )
}
