import type { KanbanBoard } from '../types'
import { useKanbanMutation } from './use-kanban-mutation'
import { useKanbanQuery } from './use-kanban-query'

export function useKanbanBoard(initialBoard: KanbanBoard) {
  const boardQuery = useKanbanQuery(initialBoard)
  const moveMutation = useKanbanMutation()
  return {
    board: boardQuery.data ?? [],
    isError: boardQuery.isError,
    moveCard: moveMutation.mutate,
  }
}
