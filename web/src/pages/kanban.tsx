import { useLoaderData } from "react-router";
import { KanbanContainer } from "../features/kanban/components/kanban-container";
import { loadKanbanBoard } from "../features/kanban/services/kanban-service";
import type { KanbanBoard } from "../features/kanban/types";

export const loader = loadKanbanBoard;

export function Kanban() {
  return <KanbanContainer initialBoard={useLoaderData() as KanbanBoard} />;
}
