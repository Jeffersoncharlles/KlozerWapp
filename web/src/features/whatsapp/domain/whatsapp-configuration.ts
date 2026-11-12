import { z } from 'zod'

export const whatsappConfigurationSchema = z.object({
  flowId: z.string(),
  queueId: z.string(),
  businessHoursEnabled: z.boolean(),
})

export const whatsappAutomationOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  enabled: z.boolean(),
  publishedRevision: z.number().int().nonnegative(),
})

export const whatsappQueueOptionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  is_active: z.boolean(),
})

export type WhatsAppConfiguration = z.infer<typeof whatsappConfigurationSchema>
export type WhatsAppAutomationOption = z.infer<typeof whatsappAutomationOptionSchema>
export type WhatsAppQueueOption = z.infer<typeof whatsappQueueOptionSchema>
