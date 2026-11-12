import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import type { KanbanColumn as KanbanColumnType } from '../types'
import { KanbanCardItem } from './kanban-card-item'

export function KanbanColumn({ column }: { column: KanbanColumnType }) {
  const { isOver, setNodeRef } = useDroppable({ id: column.id })

  return (
    <Card className="min-h-[460px] border-border/70 bg-card/60">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 px-4 py-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="size-2 rounded-full" style={{ backgroundColor: column.color }} />
          {column.name}
          <span className="text-xs font-normal text-muted-foreground">{column.cards.length}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <SortableContext
          items={column.cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            className={`min-h-24 space-y-3 rounded-lg transition-colors ${isOver ? 'bg-muted/70' : ''}`}
            ref={setNodeRef}
          >
            {column.cards.map((card) => (
              <KanbanCardItem card={card} key={card.id} />
            ))}
            {column.cards.length === 0 ? (
              <p className="px-3 py-8 text-center text-xs text-muted-foreground">
                Solte um card aqui
              </p>
            ) : null}
          </div>
        </SortableContext>
      </CardContent>
    </Card>
  )
}
