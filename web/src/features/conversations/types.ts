import { z } from 'zod'

import type { Conversation, ConversationMessage, ConversationTag } from './domain/conversation'

export type ConversationLoaderData = {
  conversations: Conversation[]
  tags: ConversationTag[]
}

export const conversationMutationSchema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('send'),
    contactID: z.string().min(1),
    content: z.string().trim().min(1),
  }),
  z.object({
    intent: z.literal('add-tag'),
    contactID: z.string().min(1),
    tagID: z.string().min(1),
  }),
  z.object({
    intent: z.literal('remove-tag'),
    contactID: z.string().min(1),
    tagID: z.string().min(1),
  }),
])
export type ConversationMutation = z.infer<typeof conversationMutationSchema>

export type ConversationActionResult = {
  sentMessage?: ConversationMessage
  tagEvent?: { contactID: string; tagID: string; added: boolean }
  message?: string
  error?: string
}
