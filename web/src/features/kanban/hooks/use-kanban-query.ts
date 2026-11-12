import { useQuery } from '@tanstack/react-query'

import { loadKanbanBoard } from '../services/kanban-service'
import type { KanbanBoard } from '../types'

export const kanbanBoardQueryKey = ['kanban', 'board'] as const

export function useKanbanQuery(initialBoard: KanbanBoard) {
  return useQuery({
    queryKey: kanbanBoardQueryKey,
    queryFn: loadKanbanBoard,
    initialData: initialBoard,
    staleTime: 30_000,
  })
}
