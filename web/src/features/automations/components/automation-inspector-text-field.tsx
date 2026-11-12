import type { AutomationNodeData } from '../types'
import type { AutomationCanvasNode } from './automation-flow-types'

type Props = {
  node: AutomationCanvasNode
  label: string
  field: 'message' | 'body' | 'value'
  placeholder?: string
  onChange: (patch: Partial<AutomationNodeData>) => void
}

export function AutomationInspectorTextField({ node, label, field, placeholder, onChange }: Props) {
  return (
    <label className="block space-y-1.5 text-xs font-medium">
      {label}
      <textarea
        className="min-h-24 w-full rounded-md border border-input bg-transparent p-2"
        value={node.data[field] ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange({ [field]: event.target.value })}
      />
    </label>
  )
}
