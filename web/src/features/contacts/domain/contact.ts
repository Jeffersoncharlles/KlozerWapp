import { z } from 'zod'

export const contactSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  phone: z.string(),
  avatar_url: z.string().optional().default(''),
  type: z.enum(['person', 'group']).default('person'),
  archived_at: z.string().nullable().optional(),
  tags: z
    .array(z.object({ id: z.string(), name: z.string(), color: z.string().optional() }))
    .optional()
    .default([]),
})

export const contactInputSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  phone: z.string().trim().min(1, 'Telefone é obrigatório'),
  type: z.enum(['person', 'group']),
})

export const contactListSchema = z.object({
  items: z.array(contactSchema),
  total: z.number().nonnegative(),
  people: z.number().nonnegative(),
  groups: z.number().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
})

export type Contact = z.infer<typeof contactSchema>
export type ContactInput = z.infer<typeof contactInputSchema>
export type ContactList = z.infer<typeof contactListSchema>
