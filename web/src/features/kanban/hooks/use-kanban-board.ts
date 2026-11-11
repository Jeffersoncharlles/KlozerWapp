import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loadKanbanBoard, moveKanbanCard } from "../services/kanban-service";
import type { KanbanBoard } from "../types";
import { moveCard } from "../utils/board";

export const kanbanBoardQueryKey = ["kanban", "board"] as const;

export function useKanbanBoard(initialBoard: KanbanBoard) {
  const queryClient = useQueryClient();
  const boardQuery = useQuery({
    queryKey: kanbanBoardQueryKey,
    queryFn: loadKanbanBoard,
    initialData: initialBoard,
    staleTime: 30_000,
  });
  const moveMutation = useMutation({
    mutationFn: moveKanbanCard,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: kanbanBoardQueryKey });
      const previousBoard = queryClient.getQueryData<KanbanBoard>(kanbanBoardQueryKey);

      if (previousBoard) {
        queryClient.setQueryData(
          kanbanBoardQueryKey,
          moveCard(previousBoard, input.cardId, input.targetColumnId, input.position),
        );
      }

      return { previousBoard };
    },
    onError: (_error, _input, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(kanbanBoardQueryKey, context.previousBoard);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: kanbanBoardQueryKey }),
  });

  return {
    board: boardQuery.data ?? [],
    isError: boardQuery.isError,
    moveCard: moveMutation.mutate,
  };
}
