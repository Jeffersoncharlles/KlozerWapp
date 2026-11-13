import { z } from 'zod'

import { scheduleSchema, type Schedule } from './domain/schedule'
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
  schedule?: Schedule
  error?: string
}

export const whatsappMutationSchema = z.discriminatedUnion('intent', [
  z.object({ intent: z.enum(['connect', 'disconnect', 'logout']) }),
  z.object({ intent: z.literal('save-configuration'), configuration: whatsappConfigurationSchema }),
  z.object({ intent: z.literal('save-schedule'), schedule: scheduleSchema }),
])
export type WhatsAppMutation = z.infer<typeof whatsappMutationSchema>
export type WhatsAppActionResult = { message?: string; error?: string }
