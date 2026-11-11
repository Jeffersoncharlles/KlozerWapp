import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useState } from "react";
import type { KanbanBoard, KanbanCard, MoveCardInput } from "../types";
import { findCard, findCardLocation } from "../utils/board";

export function useKanbanDnd(board: KanbanBoard, onMoveCard: (input: MoveCardInput) => void) {
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragStart({ active }: DragStartEvent) {
    setActiveCard(findCard(board, String(active.id)));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveCard(null);

    if (!over) {
      return;
    }

    const cardId = String(active.id);
    const source = findCardLocation(board, cardId);
    const overCard = findCardLocation(board, String(over.id));
    const targetColumnId = overCard?.columnId ?? String(over.id);

    if (!source || !board.some((column) => column.id === targetColumnId)) {
      return;
    }

    const targetPosition =
      overCard?.position ?? board.find((column) => column.id === targetColumnId)?.cards.length ?? 0;

    if (source.columnId === targetColumnId && source.position === targetPosition) {
      return;
    }

    onMoveCard({ cardId, targetColumnId, position: targetPosition });
  }

  return {
    activeCard,
    handleDragCancel: () => setActiveCard(null),
    handleDragEnd,
    handleDragStart,
    sensors,
  };
}
