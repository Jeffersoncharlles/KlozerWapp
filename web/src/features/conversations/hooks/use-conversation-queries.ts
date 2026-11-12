import { useQuery } from '@tanstack/react-query'

import {
  loadConversationMessages,
  loadConversations,
  loadTags,
} from '../services/conversation-service'
import type { ConversationLoaderData } from '../types'

export const conversationQueryKeys = {
  conversations: ['conversations'] as const,
  tags: ['conversation-tags'] as const,
  messages: (contactID: string) => ['conversation-messages', contactID] as const,
}

export function useConversationQueries(initialData: ConversationLoaderData, selectedID: string) {
  const conversations = useQuery({
    queryKey: conversationQueryKeys.conversations,
    queryFn: ({ signal }) => loadConversations(signal),
    initialData: initialData.conversations,
    staleTime: 30_000,
  })
  const tags = useQuery({
    queryKey: conversationQueryKeys.tags,
    queryFn: ({ signal }) => loadTags(signal),
    initialData: initialData.tags,
    staleTime: 5 * 60_000,
  })
  const messages = useQuery({
    queryKey: conversationQueryKeys.messages(selectedID),
    queryFn: ({ signal }) =>
      loadConversationMessages(selectedID, signal).then((items) => items.reverse()),
    enabled: Boolean(selectedID),
  })

  return { conversations, tags, messages }
}
