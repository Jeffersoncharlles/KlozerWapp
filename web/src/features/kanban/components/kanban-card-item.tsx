import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Clock3, GripVertical } from "lucide-react";
import type { KanbanCard } from "../types";

export function KanbanCardItem({ card, isOverlay = false }: { card: KanbanCard; isOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    disabled: isOverlay,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      className={`rounded-xl border border-border/70 bg-background/70 p-3 shadow-sm ${isDragging ? "opacity-30" : ""} ${isOverlay ? "rotate-1 shadow-lg" : ""}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{card.contact?.name ?? "Contato sem nome"}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{card.contact?.phone ?? "Sem telefone"}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span className="truncate">{card.assignee?.name ?? "Sem atendente"}</span>
        <span className="flex shrink-0 items-center gap-1"><Clock3 className="size-3" /> Hoje</span>
      </div>
    </article>
  );
}
