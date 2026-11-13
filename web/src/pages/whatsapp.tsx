import { useLoaderData, type ActionFunctionArgs } from 'react-router'
import { z } from 'zod'

import { WhatsAppContainer } from '../features/whatsapp/components/whatsapp-container'
import { scheduleSchema } from '../features/whatsapp/domain/schedule'
import {
  connectWhatsApp,
  disconnectWhatsApp,
  loadWhatsAppConnection,
  logoutWhatsApp,
  saveWhatsAppConfiguration,
  saveSchedule,
} from '../features/whatsapp/services/whatsapp-service'
import {
  whatsappMutationSchema,
  type WhatsAppLoaderData,
  type WhatsAppActionResult,
} from '../features/whatsapp/types'

export const loader = loadWhatsAppConnection

export async function action({ request }: ActionFunctionArgs): Promise<WhatsAppActionResult> {
  try {
    const mutation = whatsappMutationSchema.parse(await request.json())
    if (mutation.intent === 'save-configuration')
      await saveWhatsAppConfiguration(mutation.configuration, request.signal)
    else if (mutation.intent === 'save-schedule')
      await saveSchedule(scheduleSchema.parse(mutation.schedule), request.signal)
    else if (mutation.intent === 'connect') await connectWhatsApp(request.signal)
    else if (mutation.intent === 'disconnect') await disconnectWhatsApp(request.signal)
    else await logoutWhatsApp(request.signal)
    return {
      message:
        mutation.intent === 'save-configuration' ? 'Configuração salva' : 'Conexão atualizada',
    }
  } catch (error) {
    if (error instanceof z.ZodError) return { error: 'Confira os dados enviados.' }
    return {
      error: error instanceof Error ? error.message : 'Não foi possível atualizar o WhatsApp.',
    }
  }
}

export function WhatsApp() {
  return <WhatsAppContainer data={useLoaderData() as WhatsAppLoaderData} />
}
