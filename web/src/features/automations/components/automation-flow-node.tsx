import { Handle, Position, type NodeProps } from '@xyflow/react'
import { MessageSquareText } from 'lucide-react'

import { getAutomationNodeSpec } from '../data/node-catalog'
import type { AutomationNodeData, AutomationNodeType } from '../types'

export function AutomationFlowNode({ data, type, selected }: NodeProps) {
  const nodeType = type as AutomationNodeType
  const spec = getAutomationNodeSpec(nodeType)
  const Icon = spec?.icon ?? MessageSquareText
  const nodeData = data as AutomationNodeData
  const outputs =
    nodeType === 'condition'
      ? ['true', 'false']
      : nodeType === 'http-request'
        ? ['success', 'error']
        : nodeType === 'interactive-message'
          ? [...(nodeData.options ?? []).map((option) => option.id), 'timeout']
          : ['next']

  return (
    <div
      data-selected={selected}
      className="min-w-56 rounded-lg border border-border border-l-2 border-l-primary bg-card text-card-foreground shadow-sm transition data-[selected=true]:ring-2 data-[selected=true]:ring-emerald-400/50"
    >
      <Handle
        id="input"
        className="!size-3 !border-2 !border-card !bg-primary"
        position={Position.Left}
        type="target"
      />
      <div className="p-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className={`size-4 ${spec?.tone ?? 'text-muted-foreground'}`} />
          {nodeData.label}
          {nodeData.isStart ? (
            <span className="ml-auto rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-700 dark:text-emerald-400">
              INÍCIO
            </span>
          ) : null}
        </div>
        <p className="mt-2 max-w-48 truncate text-xs text-muted-foreground">
          {nodeData.message || nodeData.description}
        </p>
      </div>
      <div className="space-y-2 border-t border-border px-3 py-2 text-right text-[10px]">
        {outputs.map((handle) => (
          <div key={handle} className="relative pr-2">
            {handle}
            <Handle
              id={handle}
              className="!size-3 !border-2 !border-card !bg-primary"
              style={{ right: -20, top: '50%' }}
              position={Position.Right}
              type="source"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
