import { z } from 'zod'

import { API_BASE_URL } from '../../../core/constants/api'
import { getAuthToken } from '../../../core/middlewares/authenticate'
import { tagSchema, type Tag } from '../domain/tag'

function token() {
  const value = getAuthToken()
  if (!value) throw new Error('Sessão inválida.')
  return value
}

async function parseError(response: Response) {
  const payload = (await response.json().catch(() => null)) as {
    error?: string
    message?: string
  } | null
  return payload?.error ?? payload?.message ?? 'Não foi possível atualizar as tags.'
}

export async function loadTags(signal?: AbortSignal): Promise<Tag[]> {
  const response = await fetch(`${API_BASE_URL}/tags/`, {
    headers: { Authorization: `Bearer ${token()}` },
    signal,
  })
  if (!response.ok) throw new Error(await parseError(response))
  return z.array(tagSchema).parse(await response.json())
}

export async function createTag(
  input: { name: string; color: string },
  signal?: AbortSignal,
): Promise<Tag> {
  const response = await fetch(`${API_BASE_URL}/tags/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  })
  if (!response.ok) throw new Error(await parseError(response))
  return tagSchema.parse(await response.json())
}

export async function deleteTag(id: string, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}/tags/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token()}` },
    signal,
  })
  if (!response.ok) throw new Error(await parseError(response))
}
