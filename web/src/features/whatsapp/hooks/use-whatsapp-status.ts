import { useEffect, useState } from 'react'

import { loadWhatsAppStatus, type WhatsAppConnection } from '../services/whatsapp-service'
import { isWhatsAppConnected } from '../utils/whatsapp'

export function useWhatsAppStatus() {
  const [connection, setConnection] = useState<WhatsAppConnection>()

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    async function refresh() {
      try {
        const next = await loadWhatsAppStatus(controller.signal)
        if (active) setConnection(next)
      } catch {
        if (active) setConnection(undefined)
      }
    }

    void refresh()
    const interval = window.setInterval(() => void refresh(), 5000)
    return () => {
      active = false
      controller.abort()
      window.clearInterval(interval)
    }
  }, [])

  return {
    connected: isWhatsAppConnected(connection?.status),
    status: connection?.status,
  }
}
