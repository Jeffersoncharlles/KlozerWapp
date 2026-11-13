import { z } from 'zod'

import { API_BASE_URL } from '../../../core/constants/api'
import { getAuthToken } from '../../../core/middlewares/authenticate'
import { contactListSchema, contactSchema, type ContactInput } from '../domain/contact'

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
    throw new Error(payload?.error ?? payload?.message ?? 'Não foi possível atualizar os contatos.')
  }
  return schema.parse(await response.json())
}

export const loadContacts = (signal?: AbortSignal) =>
  request('/contacts/?archived=all&limit=100', contactListSchema, 'GET', undefined, signal)
export const createContact = (contact: ContactInput, signal?: AbortSignal) =>
  request('/contacts/', contactSchema, 'POST', contact, signal)
export const updateContact = (id: string, contact: ContactInput, signal?: AbortSignal) =>
  request(`/contacts/${encodeURIComponent(id)}`, contactSchema, 'PATCH', contact, signal)
export const updateContactArchive = (id: string, archived: boolean, signal?: AbortSignal) =>
  request(
    `/contacts/${encodeURIComponent(id)}/archive`,
    z.object({ archived: z.boolean() }),
    'PATCH',
    { archived },
    signal,
  )
