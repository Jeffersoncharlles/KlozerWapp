import { z } from 'zod'

export const userSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(['ADMIN', 'ATTENDANT']),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const userInputSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().optional(),
  role: z.enum(['ADMIN', 'ATTENDANT']),
})

export type User = z.infer<typeof userSchema>
export type UserInput = z.infer<typeof userInputSchema>
