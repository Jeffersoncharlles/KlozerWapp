import { useCallback, useState } from 'react'
import { useLoaderData } from 'react-router'

import type { ConversationLoaderData } from '../types'
import { useConversationActions } from './use-conversation-actions'
import { useConversationEvents } from './use-conversation-events'
import { useConversationQueries } from './use-conversation-queries'

function errorMessage(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason.message : fallback
}

export function useConversations() {
  const initialData = useLoaderData() as ConversationLoaderData
  const [selectedID, setSelectedID] = useState(initialData.conversations[0]?.contact.id ?? '')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [tagID, setTagID] = useState('')
  const queries = useConversationQueries(initialData, selectedID)
  const events = useConversationEvents()
  const clearDraft = useCallback(() => setDraft(''), [])
  const clearTag = useCallback(() => setTagID(''), [])
  const actions = useConversationActions({
    onMessageSent: clearDraft,
    onTagChanged: clearTag,
  })

  const conversations = queries.conversations.data ?? []
  const tags = queries.tags.data ?? []
  const visible = conversations.filter((conversation) => {
    const query = search.trim().toLowerCase()
    return (
      !query ||
      conversation.contact.name.toLowerCase().includes(query) ||
      conversation.contact.phone.toLowerCase().includes(query)
    )
  })
  const selected = conversations.find((conversation) => conversation.contact.id === selectedID)

  function send() {
    const content = draft.trim()
    if (selectedID && content && !actions.busy)
      actions.submit({ intent: 'send', contactID: selectedID, content })
  }

  function addTag() {
    if (selectedID && tagID && !actions.busy)
      actions.submit({ intent: 'add-tag', contactID: selectedID, tagID })
  }

  function removeTag(tagIDToRemove: string) {
    if (selectedID && !actions.busy)
      actions.submit({ intent: 'remove-tag', contactID: selectedID, tagID: tagIDToRemove })
  }

  return {
    conversations,
    visible,
    selected,
    selectedID,
    setSelectedID,
    messages: queries.messages.data ?? [],
    search,
    setSearch,
    draft,
    setDraft,
    loading: queries.conversations.isPending,
    sending: actions.busy,
    error:
      actions.error ??
      events.error ??
      (queries.conversations.error
        ? errorMessage(queries.conversations.error, 'Não foi possível carregar as conversas.')
        : queries.messages.error
          ? errorMessage(queries.messages.error, 'Não foi possível carregar o histórico.')
          : undefined),
    tags,
    tagID,
    setTagID,
    send,
    addTag,
    removeTag,
  }
}
