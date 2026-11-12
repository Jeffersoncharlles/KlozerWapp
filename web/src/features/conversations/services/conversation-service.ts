import { z } from 'zod'

import { API_BASE_URL } from '../../../core/constants/api'
import { getAuthToken } from '../../../core/middlewares/authenticate'
import {
  conversationMessageSchema,
  conversationSchema,
  tagSchema,
  type Conversation,
  type ConversationMessage,
  type ConversationTag,
} from '../domain/conversation'

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
    throw new Error(payload?.error ?? payload?.message ?? 'Não foi possível atualizar a conversa.')
  }
  return schema.parse(await response.json())
}

export const loadConversations = (signal?: AbortSignal) =>
  request('/conversations', z.array(conversationSchema), 'GET', undefined, signal)
export const loadConversationMessages = (contactID: string, signal?: AbortSignal) =>
  request(
    `/messages/${encodeURIComponent(contactID)}`,
    z.array(conversationMessageSchema),
    'GET',
    undefined,
    signal,
  )
export const sendConversationMessage = (contactID: string, content: string, signal?: AbortSignal) =>
  request(
    `/messages/`,
    conversationMessageSchema,
    'POST',
    { contact_id: contactID, content },
    signal,
  )
export const loadTags = (signal?: AbortSignal) =>
  request('/tags/', z.array(tagSchema), 'GET', undefined, signal)

async function changeContactTag(
  contactID: string,
  tagID: string,
  method: 'POST' | 'DELETE',
  signal?: AbortSignal,
) {
  const response = await fetch(
    `${API_BASE_URL}/tags/${encodeURIComponent(tagID)}/contacts/${encodeURIComponent(contactID)}`,
    { method, headers: { Authorization: `Bearer ${token()}` }, signal },
  )
  if (!response.ok) throw new Error('Não foi possível atualizar as tags da conversa.')
}
export const addTagToContact = (contactID: string, tagID: string, signal?: AbortSignal) =>
  changeContactTag(contactID, tagID, 'POST', signal)
export const removeTagFromContact = (contactID: string, tagID: string, signal?: AbortSignal) =>
  changeContactTag(contactID, tagID, 'DELETE', signal)

export async function subscribeToConversationEvents(
  signal: AbortSignal,
  onMessage: (message: ConversationMessage) => void,
  onTag?: (event: { contactID: string; tagID: string; added: boolean }) => void,
) {
  const response = await fetch(`${API_BASE_URL}/conversations/stream`, {
    headers: { Accept: 'text/event-stream', Authorization: `Bearer ${token()}` },
    signal,
  })
  if (!response.ok || !response.body)
    throw new Error('Não foi possível acompanhar as conversas em tempo real.')

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (!signal.aborted) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop() ?? ''
    for (const event of events) {
      const payload = event
        .split('\n')
        .filter((line) => line.startsWith('data: '))
        .map((line) => line.slice(6))
        .join('\n')
      if (!payload) continue
      const parsed = z
        .object({ topic: z.string(), data: z.unknown() })
        .safeParse(JSON.parse(payload))
      if (!parsed.success || !parsed.data.topic.startsWith('chat_')) continue
      const message = conversationMessageSchema.safeParse(parsed.data.data)
      if (message.success) {
        onMessage(message.data)
        continue
      }
      const tagEvent = z
        .object({
          type: z.enum(['tag_added', 'tag_removed']),
          contact_id: z.string(),
          tag_id: z.string(),
        })
        .safeParse(parsed.data.data)
      if (tagEvent.success)
        onTag?.({
          contactID: tagEvent.data.contact_id,
          tagID: tagEvent.data.tag_id,
          added: tagEvent.data.type === 'tag_added',
        })
    }
  }
}

export function updateConversationTags(
  conversations: Conversation[],
  contactID: string,
  tagID: string,
  tags: ConversationTag[],
  added: boolean,
) {
  return conversations.map((conversation) => {
    if (conversation.contact.id !== contactID) return conversation
    const current = conversation.contact.tags ?? []
    const tag = tags.find((item) => item.id === tagID)
    const next =
      added && tag && !current.some((item) => item.id === tagID)
        ? [...current, tag]
        : added
          ? current
          : current.filter((item) => item.id !== tagID)
    return { ...conversation, contact: { ...conversation.contact, tags: next } }
  })
}

export function addMessageToConversation(
  conversations: Conversation[],
  message: ConversationMessage,
) {
  return conversations.map((conversation) =>
    conversation.contact.id === message.contact_id
      ? { ...conversation, last_message: message }
      : conversation,
  )
}
