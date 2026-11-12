import { automationNodeSpecs } from '../data/node-catalog'
import type { AutomationNodeType } from '../types'

type AutomationPaletteProps = {
  onAdd: (type: AutomationNodeType) => void
}

export function AutomationPalette({ onAdd }: AutomationPaletteProps) {
  return (
    <aside className="border-b border-border bg-card p-3 lg:border-b-0 lg:border-r">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Adicionar passo
      </p>
      <div className="space-y-2">
        {automationNodeSpecs.map(({ type, title, description, icon: Icon, tone }) => (
          <button
            className="flex w-full items-center gap-3 rounded-lg border border-border/70 bg-background/60 p-2 text-left transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/5"
            draggable
            key={type}
            onClick={() => onAdd(type)}
            onDragStart={(event) => {
              event.dataTransfer.setData('application/klozer-automation-node', type)
              event.dataTransfer.effectAllowed = 'move'
            }}
            type="button"
          >
            <Icon className={`size-4 ${tone}`} />
            <span className="min-w-0">
              <span className="block text-xs font-medium">{title}</span>
              <span className="block truncate text-[10px] text-muted-foreground">
                {description}
              </span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  )
}
