import { Trash2 } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import type { AutomationNodeData } from '../types'
import type { AutomationCanvasNode } from './automation-flow-types'
import { AutomationNodeFields } from './automation-node-fields'

type Props = {
  node?: AutomationCanvasNode
  onChange: (id: string, patch: Partial<AutomationNodeData>) => void
  onRemove: (id: string) => void
  onStart: (id: string) => void
}

export function AutomationInspector({ node, onChange, onRemove, onStart }: Props) {
  const update = (patch: Partial<AutomationNodeData>) => {
    if (node) onChange(node.id, patch)
  }

  return (
    <aside className="overflow-y-auto border-t border-border bg-card p-4 lg:border-l lg:border-t-0">
      <h2 className="border-b border-border pb-3 text-sm font-medium">Propriedades</h2>
      {node ? (
        <div className="space-y-4 py-4">
          <label className="block space-y-1.5 text-xs font-medium">
            Título
            <Input
              maxLength={120}
              value={node.data.label}
              onChange={(event) => update({ label: event.target.value })}
            />
          </label>
          <Button
            className="w-full"
            variant="outline"
            disabled={node.data.isStart}
            onClick={() => onStart(node.id)}
          >
            {node.data.isStart ? 'Passo inicial' : 'Usar como início'}
          </Button>
          <AutomationNodeFields node={node} onChange={update} />
          <Button
            className="w-full"
            disabled={node.data.isStart}
            onClick={() => onRemove(node.id)}
            variant="outline"
          >
            <Trash2 className="size-4" />
            Remover passo
          </Button>
          {node.data.isStart && (
            <p className="text-xs text-muted-foreground">
              Escolha outro início antes de remover este passo.
            </p>
          )}
        </div>
      ) : (
        <p className="py-8 text-center text-xs text-muted-foreground">
          Selecione um passo para editar.
        </p>
      )}
    </aside>
  )
}
