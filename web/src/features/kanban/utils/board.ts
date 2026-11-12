import type { KanbanBoard, KanbanCard } from '../types'

type CardLocation = {
  columnId: string
  position: number
}

export function findCardLocation(board: KanbanBoard, cardId: string): CardLocation | null {
  for (const column of board) {
    const position = column.cards.findIndex((card) => card.id === cardId)

    if (position >= 0) {
      return { columnId: column.id, position }
    }
  }

  return null
}

export function findCard(board: KanbanBoard, cardId: string): KanbanCard | null {
  const location = findCardLocation(board, cardId)

  return location
    ? (board.find((column) => column.id === location.columnId)?.cards[location.position] ?? null)
    : null
}

export function moveCard(
  board: KanbanBoard,
  cardId: string,
  targetColumnId: string,
  targetPosition: number,
) {
  const sourceColumn = board.find((column) => column.cards.some((card) => card.id === cardId))
  const targetColumn = board.find((column) => column.id === targetColumnId)

  if (!sourceColumn || !targetColumn) {
    return board
  }

  const card = sourceColumn.cards.find((item) => item.id === cardId)

  if (!card) {
    return board
  }

  const sourceCards = sourceColumn.cards.filter((item) => item.id !== cardId)
  const targetCards = sourceColumn.id === targetColumn.id ? sourceCards : targetColumn.cards
  const insertionIndex = Math.min(Math.max(targetPosition, 0), targetCards.length)
  const nextTargetCards = [...targetCards]
  nextTargetCards.splice(insertionIndex, 0, { ...card, column_id: targetColumnId })

  return board.map((column) => {
    if (column.id === sourceColumn.id && column.id === targetColumn.id) {
      return { ...column, cards: nextTargetCards.map((item, position) => ({ ...item, position })) }
    }

    if (column.id === sourceColumn.id) {
      return { ...column, cards: sourceCards.map((item, position) => ({ ...item, position })) }
    }

    if (column.id === targetColumn.id) {
      return { ...column, cards: nextTargetCards.map((item, position) => ({ ...item, position })) }
    }

    return column
  })
}

export function filterBoardByContact(board: KanbanBoard, search: string): KanbanBoard {
  const normalizedSearch = search.trim().toLocaleLowerCase()

  if (!normalizedSearch) {
    return board
  }

  return board.map((column) => ({
    ...column,
    cards: column.cards.filter((card) =>
      card.contact?.name.toLocaleLowerCase().includes(normalizedSearch),
    ),
  }))
}
