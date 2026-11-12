import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import type { Conversation, ConversationMessage, ConversationTag } from '../domain/conversation'
import {
  addMessageToConversation,
  subscribeToConversationEvents,
  updateConversationTags,
} from '../services/conversation-service'
import { conversationQueryKeys } from './use-conversation-queries'

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : 'Não foi possível acompanhar as conversas.'
}

export function useConversationEvents() {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string>()

  useEffect(() => {
    const controller = new AbortController()
    void subscribeToConversationEvents(
      controller.signal,
      (message) => {
        queryClient.setQueryData<Conversation[]>(conversationQueryKeys.conversations, (current) =>
          current ? addMessageToConversation(current, message) : current,
        )
        // A mensagem pode ser o primeiro evento de um novo contato. Recarrega
        // a lista para obter o contato criado pelo backend e incluí-lo no CRM.
        void queryClient.invalidateQueries({ queryKey: conversationQueryKeys.conversations })
        queryClient.setQueryData<ConversationMessage[]>(
          conversationQueryKeys.messages(message.contact_id),
          (current) => {
            if (!current || current.some((item) => item.id === message.id)) return current
            return [...current, message].sort(
              (left, right) =>
                new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime(),
            )
          },
        )
      },
      (event) => {
        const tags = queryClient.getQueryData<ConversationTag[]>(conversationQueryKeys.tags) ?? []
        queryClient.setQueryData<Conversation[]>(conversationQueryKeys.conversations, (current) =>
          current
            ? updateConversationTags(current, event.contactID, event.tagID, tags, event.added)
            : current,
        )
      },
    ).catch((reason: unknown) => {
      if (!controller.signal.aborted) setError(errorMessage(reason))
    })
    return () => controller.abort()
  }, [queryClient])

  return { error }
}
