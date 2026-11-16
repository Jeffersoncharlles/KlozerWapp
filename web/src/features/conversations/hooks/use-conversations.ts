import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useLoaderData } from 'react-router'

import { useKanbanQuery } from '../../kanban/hooks/use-kanban-query'
import { finishConversation, takeConversation } from '../services/conversation-service'
import type { ConversationLoaderData } from '../types'
import { useConversationActions } from './use-conversation-actions'
import { useConversationEvents } from './use-conversation-events'
import { useConversationQueries } from './use-conversation-queries'

function errorMessage(reason: unknown, fallback: string) {
  return reason instanceof Error ? reason.message : fallback
}

export function useConversations() {
  const initialData = useLoaderData() as ConversationLoaderData
  const queryClient = useQueryClient()
  const [selectedID, setSelectedID] = useState(initialData.conversations[0]?.contact.id ?? '')
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [tagID, setTagID] = useState('')
  const [attendanceBusy, setAttendanceBusy] = useState(false)
  const queries = useConversationQueries(initialData, selectedID)
  const kanban = useKanbanQuery([])
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

  function moveStatus(columnID: string) {
    if (selected?.card && !actions.busy)
      actions.submit({ intent: 'move-status', cardID: selected.card.id, columnID })
  }

  async function take() {
    if (!selected?.card || attendanceBusy) return
    setAttendanceBusy(true)
    try {
      await takeConversation(selected.card.id)
      await Promise.all([
        queries.conversations.refetch(),
        queryClient.invalidateQueries({ queryKey: ['kanban', 'board'] }),
      ])
    } finally {
      setAttendanceBusy(false)
    }
  }

  async function finish() {
    if (!selected?.card || attendanceBusy) return
    if (!window.confirm('Finalizar este atendimento?')) return
    setAttendanceBusy(true)
    try {
      await finishConversation(selected.card.id)
      await Promise.all([
        queries.conversations.refetch(),
        queryClient.invalidateQueries({ queryKey: ['kanban', 'board'] }),
      ])
    } finally {
      setAttendanceBusy(false)
    }
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
    columns: kanban.data ?? [],
    moveStatus,
    take,
    finish,
    attendanceBusy,
  }
}
