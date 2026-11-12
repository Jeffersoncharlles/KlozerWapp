import type { WhatsAppConfiguration } from '../domain/whatsapp-configuration'

export function isWhatsAppConnected(status?: string) {
  return ['connected', 'open', 'online'].includes(status?.toLowerCase() ?? '')
}

export function hasSameWhatsAppConfiguration(
  left: WhatsAppConfiguration,
  right: WhatsAppConfiguration,
) {
  return (
    left.flowId === right.flowId &&
    left.queueId === right.queueId &&
    left.businessHoursEnabled === right.businessHoursEnabled
  )
}

export function getWhatsAppError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}
