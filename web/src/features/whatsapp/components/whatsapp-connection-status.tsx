import { Wifi, WifiOff } from 'lucide-react'

import type { WhatsAppConnection } from '../types'

export function WhatsAppConnectionStatus({
  connection,
  connected,
}: {
  connection?: WhatsAppConnection
  connected: boolean
}) {
  const status = connected ? 'connected' : 'disconnected'

  return (
    <div
      data-status={status}
      className="flex flex-col gap-4 rounded-lg border border-amber-500/25 bg-amber-500/10 p-5 data-[status=connected]:border-emerald-500/25 data-[status=connected]:bg-emerald-500/10 sm:flex-row sm:items-center"
    >
      <div
        data-status={status}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 data-[status=connected]:bg-emerald-500/15 data-[status=connected]:text-emerald-600 dark:data-[status=connected]:text-emerald-400"
      >
        {connected ? <Wifi className="size-5" /> : <WifiOff className="size-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold">
          {connected ? 'WhatsApp conectado' : 'Nenhum dispositivo conectado'}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {connected
            ? (connection?.phone ?? connection?.name ?? 'Sessão ativa e pronta para atender.')
            : 'Escaneie o QR Code no seu celular para iniciar uma nova sessão.'}
        </p>
      </div>
      <span
        data-status={status}
        className="flex w-fit items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-700 dark:text-amber-400 data-[status=connected]:bg-emerald-500/15 data-[status=connected]:text-emerald-700 dark:data-[status=connected]:text-emerald-400"
      >
        <span
          data-status={status}
          className="size-1.5 rounded-full bg-amber-500 data-[status=connected]:bg-emerald-500"
        />
        {connected ? 'Conectado' : 'Desconectado'}
      </span>
    </div>
  )
}
