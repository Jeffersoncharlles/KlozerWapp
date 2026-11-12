import { z } from 'zod'

import type {
  WhatsAppAutomationOption,
  WhatsAppConfiguration,
  WhatsAppQueueOption,
} from './domain/whatsapp-configuration'
import { whatsappConfigurationSchema } from './domain/whatsapp-configuration'

export type WhatsAppConnection = {
  status: string
  phone?: string
  name?: string
}

export type WhatsAppLoaderData = {
  connection?: WhatsAppConnection
  configuration?: WhatsAppConfiguration
  automations?: WhatsAppAutomationOption[]
  queues?: WhatsAppQueueOption[]
  error?: string
}

export const whatsappMutationSchema = z.discriminatedUnion('intent', [
  z.object({ intent: z.enum(['connect', 'disconnect', 'logout']) }),
  z.object({ intent: z.literal('save-configuration'), configuration: whatsappConfigurationSchema }),
])
export type WhatsAppMutation = z.infer<typeof whatsappMutationSchema>
export type WhatsAppActionResult = { message?: string; error?: string }
