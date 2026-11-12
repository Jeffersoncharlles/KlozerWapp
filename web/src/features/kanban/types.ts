export type KanbanCard = {
  id: string
  contact_id: string
  column_id: string
  assigned_to_user_id: string | null
  position: number
  contact?: {
    id: string
    name: string
    phone: string
    avatar_url: string
  }
  assignee?: {
    id: string
    name: string
  }
  created_at: string
  updated_at: string
}

export type KanbanColumn = {
  id: string
  name: string
  position: number
  color: string
  cards: KanbanCard[]
  created_at: string
  updated_at: string
}

export type KanbanBoard = KanbanColumn[]

export type MoveCardInput = {
  cardId: string
  targetColumnId: string
  position: number
}
