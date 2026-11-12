import { addEdge, useNodesState, useEdgesState, type Connection, type Edge } from '@xyflow/react'
import { useState } from 'react'
import { createAutomationNode } from '../data/node-catalog'
import { type AutomationFlow, type AutomationNodeData, type AutomationNodeType } from '../types'
import type { AutomationCanvasNode } from '../components/automation-flow-types'

export function useAutomationFlow(initialFlow: AutomationFlow) {
  const [nodes, setNodes, onNodesChange] = useNodesState<AutomationCanvasNode>(initialFlow.graph.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialFlow.graph.edges)
  const [startNodeId, setStartNodeId] = useState(initialFlow.graph.startNodeId)
  const [selectedNodeId, setSelectedNodeId] = useState<string>()
  const renderedNodes = nodes.map((node) => ({ ...node, data: { ...node.data, isStart: node.id === startNodeId } }))
  const flow: AutomationFlow = { ...initialFlow, graph: { ...initialFlow.graph, startNodeId,
    nodes: renderedNodes.map(({ id, type, position, data }) => ({ id, type: type!, position, data })),
    edges: edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({ id, source, target, sourceHandle: sourceHandle ?? null, targetHandle: targetHandle ?? null })) } }
  return {
    addNode: (type: AutomationNodeType, position = { x: 160 + nodes.length * 40, y: 120 + nodes.length * 40 }) => {
      if (nodes.length >= 200) return
      const node = createAutomationNode(type, position)
      setNodes((current) => [...current, node]); setSelectedNodeId(node.id)
    },
    flow, renderedNodes, startNodeId, setStartNodeId,
    onConnect: (connection: Connection) => setEdges((current) => addEdge(connection,
      current.filter((edge) => edge.source !== connection.source || (edge.sourceHandle ?? 'next') !== (connection.sourceHandle ?? 'next')))),
    onEdgesChange,
    onNodesChange: (changes: Parameters<typeof onNodesChange>[0]) => {
      const removed = new Set(changes.flatMap((change) => change.type === 'remove' && change.id !== startNodeId ? [change.id] : []))
      if (removed.size) setEdges((current) => current.filter((edge) => !removed.has(edge.source) && !removed.has(edge.target)))
      onNodesChange(changes.filter((change) => change.type !== 'remove' || change.id !== startNodeId))
    },
    removeNode: (id: string) => {
      if (id === startNodeId) return
      setNodes((current) => current.filter((node) => node.id !== id))
      setEdges((current) => current.filter((edge) => edge.source !== id && edge.target !== id))
      setSelectedNodeId(undefined)
    },
    selectedNode: renderedNodes.find((node) => node.id === selectedNodeId), setSelectedNodeId,
    updateNode: (id: string, patch: Partial<AutomationNodeData>) => setNodes((current) => current.map((node) => node.id === id ? { ...node, data: { ...node.data, ...patch } } : node)),
  }
}
