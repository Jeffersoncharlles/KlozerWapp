import { z } from 'zod'

export const tagMutationSchema = z.discriminatedUnion('intent', [
  z.object({
    intent: z.literal('create'),
    name: z.string().trim().min(1, 'Informe o nome da tag.'),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Escolha uma cor válida.'),
  }),
  z.object({ intent: z.literal('delete'), id: z.string().min(1) }),
])

export type TagLoaderData = { tags: import('./domain/tag').Tag[] }
export type TagActionResult = { message?: string; error?: string }
