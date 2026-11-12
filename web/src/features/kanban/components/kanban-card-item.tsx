import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Clock3, GripVertical } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { contactDisplayName, contactInitials } from '../../../core/shared/contact'
import type { KanbanCard } from '../types'

export function KanbanCardItem({
  card,
  isOverlay = false,
}: {
  card: KanbanCard
  isOverlay?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: isOverlay,
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <article
      data-dragging={isDragging || undefined}
      data-overlay={isOverlay || undefined}
      className="rounded-xl border border-border/70 bg-background/70 p-3 shadow-sm data-[dragging]:opacity-30 data-[overlay]:rotate-1 data-[overlay]:shadow-lg"
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <Avatar size="sm">
          {card.contact?.avatar_url ? (
            <AvatarImage
              src={card.contact.avatar_url}
              alt={`Foto de ${contactDisplayName(card.contact.name, card.contact.phone)}`}
            />
          ) : null}
          <AvatarFallback className="bg-sky-400/15 text-[10px] text-sky-300">
            {card.contact ? contactInitials(card.contact.name, card.contact.phone) : '??'}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">
            {card.contact
              ? contactDisplayName(card.contact.name, card.contact.phone)
              : 'Contato sem nome'}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {card.contact?.phone ?? 'Sem telefone'}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span className="truncate">{card.assignee?.name ?? 'Sem atendente'}</span>
        <span className="flex shrink-0 items-center gap-1">
          <Clock3 className="size-3" /> Hoje
        </span>
      </div>
    </article>
  )
}
