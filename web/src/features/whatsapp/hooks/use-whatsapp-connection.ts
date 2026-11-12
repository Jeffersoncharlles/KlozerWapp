import { useEffect, useState } from 'react'
import { useFetcher, useRevalidator } from 'react-router'

import { subscribeToEvents } from '../services/whatsapp-service'
import type { WhatsAppActionResult, WhatsAppLoaderData } from '../types'
import { getWhatsAppError, isWhatsAppConnected } from '../utils/whatsapp'

export function useWhatsAppConnection(data: WhatsAppLoaderData) {
  const { revalidate } = useRevalidator()
  const fetcher = useFetcher<WhatsAppActionResult>()
  const [streamError, setStreamError] = useState<string>()
  const [qrCode, setQRCode] = useState<string>()
  const connected = isWhatsAppConnected(data.connection?.status)

  useEffect(() => {
    if (connected) return
    const controller = new AbortController()
    void subscribeToEvents(controller.signal, setQRCode, revalidate).catch((reason: unknown) => {
      if (!controller.signal.aborted)
        setStreamError(getWhatsAppError(reason, 'Não foi possível acompanhar o QR Code.'))
    })
    return () => controller.abort()
  }, [connected, revalidate])

  function updateConnection(intent: 'connect' | 'disconnect' | 'logout') {
    if (fetcher.state !== 'idle') return
    if (intent === 'connect') setQRCode('')
    void fetcher.submit({ intent }, { method: 'post', encType: 'application/json' })
  }

  return {
    connected,
    error: fetcher.data?.error ?? streamError,
    isSubmitting: fetcher.state !== 'idle',
    qrCode: connected || qrCode === '' ? undefined : qrCode,
    refresh: revalidate,
    updateConnection,
  }
}
