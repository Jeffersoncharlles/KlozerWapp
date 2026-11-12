import { z } from 'zod'

export const conversationContactSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  phone: z.string(),
  avatar_url: z.string().optional().default(''),
  tags: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string().optional().default('#000000'),
      }),
    )
    .optional()
    .default([]),
})

export const conversationMessageSchema = z.object({
  id: z.string().min(1),
  contact_id: z.string().min(1),
  content: z.string(),
  type: z.string(),
  is_from_me: z.boolean(),
  timestamp: z.string(),
})

export const conversationCardSchema = z.object({
  id: z.string().min(1),
  contact_id: z.string().min(1),
  column_id: z.string().min(1),
  position: z.number().int(),
})

export const conversationSchema = z.object({
  contact: conversationContactSchema,
  last_message: conversationMessageSchema.nullish(),
  card: conversationCardSchema.nullish(),
})

export type Conversation = z.infer<typeof conversationSchema>
export type ConversationMessage = z.infer<typeof conversationMessageSchema>
export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().optional().default('#000000'),
})
export type ConversationTag = z.infer<typeof tagSchema>
