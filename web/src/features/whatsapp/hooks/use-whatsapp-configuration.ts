import { useState } from 'react'
import { useFetcher } from 'react-router'

import type { WhatsAppConfiguration } from '../domain/whatsapp-configuration'
import type { WhatsAppActionResult, WhatsAppLoaderData } from '../types'
import { hasSameWhatsAppConfiguration } from '../utils/whatsapp'

const emptyConfiguration: WhatsAppConfiguration = {
  flowId: '',
  queueId: '',
  businessHoursEnabled: false,
}

export function useWhatsAppConfiguration(data: WhatsAppLoaderData) {
  const fetcher = useFetcher<WhatsAppActionResult>()
  const initial = data.configuration ?? emptyConfiguration
  const [configuration, setConfiguration] = useState(initial)
  const dirty = !hasSameWhatsAppConfiguration(configuration, initial)

  function save() {
    if (!dirty || fetcher.state !== 'idle') return
    void fetcher.submit(
      { intent: 'save-configuration', configuration },
      { method: 'post', encType: 'application/json' },
    )
  }

  return {
    automations: data.automations,
    configuration,
    setConfiguration,
    dirty,
    error: fetcher.data?.error,
    isSubmitting: fetcher.state !== 'idle',
    queues: data.queues,
    save,
  }
}
