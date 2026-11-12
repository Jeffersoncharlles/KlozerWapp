import { useMutation, useQueryClient } from '@tanstack/react-query'

import { moveKanbanCard } from '../services/kanban-service'
import type { KanbanBoard } from '../types'
import { moveCard } from '../utils/board'
import { kanbanBoardQueryKey } from './use-kanban-query'

export function useKanbanMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: moveKanbanCard,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: kanbanBoardQueryKey })
      const previousBoard = queryClient.getQueryData<KanbanBoard>(kanbanBoardQueryKey)
      if (previousBoard)
        queryClient.setQueryData(
          kanbanBoardQueryKey,
          moveCard(previousBoard, input.cardId, input.targetColumnId, input.position),
        )
      return { previousBoard }
    },
    onError: (_error, _input, context) => {
      if (context?.previousBoard)
        queryClient.setQueryData(kanbanBoardQueryKey, context.previousBoard)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: kanbanBoardQueryKey }),
  })
}
