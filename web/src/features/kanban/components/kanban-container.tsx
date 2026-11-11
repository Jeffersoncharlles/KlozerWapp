import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "../../../components/ui/input";
import { PageContainer, WorkspaceHeader } from "../../../components/workspace-header";
import { useKanbanBoard } from "../hooks/use-kanban-board";
import { useKanbanDnd } from "../hooks/use-kanban-dnd";
import type { KanbanBoard } from "../types";
import { filterBoardByContact } from "../utils/board";
import { KanbanCardItem } from "./kanban-card-item";
import { KanbanColumn } from "./kanban-column";

export function KanbanContainer({ initialBoard }: { initialBoard: KanbanBoard }) {
  const [search, setSearch] = useState("");
  const { board, isError, moveCard } = useKanbanBoard(initialBoard);
  const { activeCard, handleDragCancel, handleDragEnd, handleDragStart, sensors } = useKanbanDnd(
    board,
    moveCard,
  );
  const visibleBoard = filterBoardByContact(board, search);

  return (
    <PageContainer>
      <WorkspaceHeader title="Kanban" description="Organize e acompanhe os atendimentos da equipe" />
      <main className="space-y-5 overflow-auto p-4 sm:p-6">
        <div className="flex min-w-[920px] items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Atendimentos</h1>
            <p className="text-sm text-muted-foreground">Mova os cards conforme o progresso de cada conversa.</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="h-9 pl-9"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar contato..."
              value={search}
            />
          </div>
        </div>

        {isError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Não foi possível carregar o kanban. Tente novamente.
          </p>
        ) : (
          <DndContext
            collisionDetection={closestCorners}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
            sensors={sensors}
          >
            <SortableContext items={visibleBoard.map((column) => column.id)} strategy={rectSortingStrategy}>
              <div className="grid min-w-[920px] grid-cols-4 gap-4">
                {visibleBoard.map((column) => <KanbanColumn column={column} key={column.id} />)}
              </div>
            </SortableContext>
            <DragOverlay>{activeCard ? <KanbanCardItem card={activeCard} isOverlay /> : null}</DragOverlay>
          </DndContext>
        )}
      </main>
    </PageContainer>
  );
}
