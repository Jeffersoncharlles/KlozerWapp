import { z } from 'zod'

import { API_BASE_URL } from '../../../core/constants/api'
import { getAuthToken } from '../../../core/middlewares/authenticate'
import { userSchema, type UserInput } from '../domain/user'

function token() {
  const value = getAuthToken()
  if (!value) throw new Error('Sessão inválida.')
  return value
}

async function request<T>(
  path: string,
  schema: z.ZodType<T>,
  method = 'GET',
  body?: unknown,
  signal?: AbortSignal,
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    signal,
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string
      message?: string
    } | null
    throw new Error(payload?.error ?? payload?.message ?? 'Não foi possível atualizar os usuários.')
  }
  return schema.parse(await response.json())
}

export const loadUsers = (signal?: AbortSignal) =>
  request('/users/', z.array(userSchema), 'GET', undefined, signal)

export const createUser = (user: UserInput, signal?: AbortSignal) =>
  request('/users/', userSchema, 'POST', user, signal)

export const updateUser = (id: string, user: UserInput, signal?: AbortSignal) =>
  request(`/users/${encodeURIComponent(id)}`, userSchema, 'PATCH', user, signal)

export const updateUserStatus = (id: string, isActive: boolean, signal?: AbortSignal) =>
  request(
    `/users/${encodeURIComponent(id)}/status`,
    z.object({ is_active: z.boolean() }),
    'PATCH',
    { is_active: isActive },
    signal,
  )
