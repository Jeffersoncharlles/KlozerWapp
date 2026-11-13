import { z } from 'zod'

import { contactInputSchema, contactListSchema, type ContactInput } from './domain/contact'

export type ContactLoaderData = { contacts: z.infer<typeof contactListSchema> }

export const contactMutationSchema = z.discriminatedUnion('intent', [
  z.object({ intent: z.literal('save'), id: z.string().optional(), contact: contactInputSchema }),
  z.object({ intent: z.literal('archive'), id: z.string().min(1), archived: z.boolean() }),
])

export type ContactMutation = z.infer<typeof contactMutationSchema>
export type ContactActionResult = { message?: string; error?: string }
export type { ContactInput }
