import { z } from 'zod'

import { API_BASE_URL } from '../../../core/constants/api'
import { getAuthToken } from '../../../core/middlewares/authenticate'
import type { KanbanBoard, MoveCardInput } from '../types'

const kanbanCardSchema = z.object({
  id: z.string().min(1),
  contact_id: z.string().min(1),
  column_id: z.string().min(1),
  assigned_to_user_id: z.string().nullable().default(null),
  position: z.number().int().nonnegative(),
  contact: z
    .object({
      id: z.string().min(1),
      name: z.string().min(1),
      phone: z.string(),
      avatar_url: z.string(),
    })
    .optional(),
  assignee: z
    .object({
      id: z.string().min(1),
      name: z.string().min(1),
    })
    .optional(),
  created_at: z.string(),
  updated_at: z.string(),
})

const kanbanBoardSchema = z.array(
  z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    position: z.number().int().nonnegative(),
    color: z.string().min(1),
    cards: z.array(kanbanCardSchema).default([]),
    created_at: z.string(),
    updated_at: z.string(),
  }),
)

function getToken() {
  const token = getAuthToken()

  if (!token) {
    throw new Error('Sessão inválida.')
  }

  return token
}

export async function loadKanbanBoard(): Promise<KanbanBoard> {
  const response = await fetch(`${API_BASE_URL}/kanban/board`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })

  if (!response.ok) {
    throw new Error('Não foi possível carregar o kanban.')
  }

  return kanbanBoardSchema.parse(await response.json())
}

export async function moveKanbanCard({ cardId, targetColumnId, position }: MoveCardInput) {
  const response = await fetch(`${API_BASE_URL}/kanban/cards/${cardId}/move`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target_column_id: targetColumnId, position }),
  })

  if (!response.ok) {
    throw new Error('Não foi possível mover o card.')
  }
}
