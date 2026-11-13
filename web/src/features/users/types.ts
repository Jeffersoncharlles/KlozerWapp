import { z } from 'zod'

import { userInputSchema, type User } from './domain/user'

export type UserLoaderData = { users: User[] }

export const userMutationSchema = z.discriminatedUnion('intent', [
  z.object({ intent: z.literal('save'), id: z.string().optional(), user: userInputSchema }),
  z.object({ intent: z.literal('status'), id: z.string().min(1), isActive: z.boolean() }),
])

export type UserMutation = z.infer<typeof userMutationSchema>
export type UserActionResult = { message?: string; error?: string }
