import { Plus } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import type { AutomationNodeData } from '../types'
import type { AutomationCanvasNode } from './automation-flow-types'

type Props = {
  node: AutomationCanvasNode
  onChange: (patch: Partial<AutomationNodeData>) => void
}

export function AutomationNodeOptions({ node, onChange }: Props) {
  const options = node.data.options ?? []

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium">Opções (ID da saída e texto)</p>
      {options.map((option, index) => (
        <div className="space-y-1 rounded border border-border p-2" key={index}>
          <Input
            aria-label={`ID da opção ${index + 1}`}
            value={option.id}
            onChange={(event) =>
              onChange({
                options: options.map((item, i) =>
                  i === index ? { ...item, id: event.target.value } : item,
                ),
              })
            }
          />
          <Input
            aria-label={`Texto da opção ${index + 1}`}
            value={option.label}
            onChange={(event) =>
              onChange({
                options: options.map((item, i) =>
                  i === index ? { ...item, label: event.target.value } : item,
                ),
              })
            }
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ options: options.filter((_, i) => i !== index) })}
          >
            Remover opção
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={options.length >= 10}
        onClick={() =>
          onChange({
            options: [
              ...options,
              { id: `option-${crypto.randomUUID().slice(0, 8)}`, label: 'Nova opção' },
            ],
          })
        }
      >
        <Plus className="size-3" />
        Opção
      </Button>
    </div>
  )
}
