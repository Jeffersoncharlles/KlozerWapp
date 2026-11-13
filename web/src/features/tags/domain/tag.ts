import { z } from 'zod'

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Tag = z.infer<typeof tagSchema>
