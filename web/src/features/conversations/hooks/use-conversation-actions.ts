import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useFetcher } from 'react-router'

import type { Conversation, ConversationMessage, ConversationTag } from '../domain/conversation'
import { addMessageToConversation, updateConversationTags } from '../services/conversation-service'
import type { ConversationActionResult, ConversationMutation } from '../types'
import { conversationQueryKeys } from './use-conversation-queries'

type Options = { onMessageSent: () => void; onTagChanged: () => void }

export function useConversationActions({ onMessageSent, onTagChanged }: Options) {
  const queryClient = useQueryClient()
  const fetcher = useFetcher<ConversationActionResult>()

  useEffect(() => {
    const result = fetcher.data
    if (!result) return
    if (result.error) return
    if (result.sentMessage) {
      const message = result.sentMessage
      queryClient.setQueryData<ConversationMessage[]>(
        conversationQueryKeys.messages(message.contact_id),
        (current) => {
          if (current?.some((item) => item.id === message.id)) return current
          return [...(current ?? []), message].sort(
            (left, right) =>
              new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
          )
        },
      )
      queryClient.setQueryData<Conversation[]>(conversationQueryKeys.conversations, (current) =>
        current ? addMessageToConversation(current, message) : current,
      )
      onMessageSent()
    }
    if (result.tagEvent) {
      const tags = queryClient.getQueryData<ConversationTag[]>(conversationQueryKeys.tags) ?? []
      queryClient.setQueryData<Conversation[]>(conversationQueryKeys.conversations, (current) =>
        current
          ? updateConversationTags(
              current,
              result.tagEvent!.contactID,
              result.tagEvent!.tagID,
              tags,
              result.tagEvent!.added,
            )
          : current,
      )
      onTagChanged()
    }
  }, [fetcher.data, onMessageSent, onTagChanged, queryClient])

  function submit(mutation: ConversationMutation) {
    void fetcher.submit(mutation, { method: 'post', encType: 'application/json' })
  }

  return { submit, error: fetcher.data?.error, busy: fetcher.state !== 'idle' }
}
