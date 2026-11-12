import { LoaderCircle, LogOut, QrCode, Unplug, Wifi, WifiOff } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import type { WhatsAppConnection } from '../types'

type Props = {
  connection?: WhatsAppConnection
  connected: boolean
  qrCode?: string
  isSubmitting: boolean
  onConnection: (action: 'connect' | 'disconnect' | 'logout') => void
}

export function WhatsAppConnectionCard({
  connection,
  connected,
  qrCode,
  isSubmitting,
  onConnection,
}: Props) {
  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader>
        <CardTitle>Dispositivo principal</CardTitle>
        <CardDescription>Estado atual da conexão com o WhatsApp.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center ${connected ? 'border-emerald-500/25 bg-emerald-500/10' : 'border-amber-500/25 bg-amber-500/10'}`}
        >
          <div
            className={`flex size-12 shrink-0 items-center justify-center rounded-full ${connected ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'}`}
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
            className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${connected ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'}`}
          >
            <span
              className={`size-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
            {connected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {connected ? (
            <>
              <Button
                variant="outline"
                onClick={() => onConnection('disconnect')}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <Unplug className="size-4" />
                )}
                Desconectar sessão
              </Button>
              <Button
                variant="destructive"
                onClick={() => onConnection('logout')}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}
                Remover aparelho
              </Button>
            </>
          ) : (
            <Button onClick={() => onConnection('connect')} disabled={isSubmitting}>
              {isSubmitting ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <QrCode className="size-4" />
              )}
              Conectar com QR Code
            </Button>
          )}
        </div>
        {qrCode ? (
          <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-border bg-secondary/40 p-5 text-center">
            <div className="rounded-lg bg-white p-3">
              <QRCodeSVG value={qrCode} size={192} level="M" />
            </div>
            <div>
              <p className="text-sm font-medium">Escaneie o QR Code</p>
              <p className="mt-1 text-xs text-muted-foreground">
                No WhatsApp, abra Aparelhos conectados e selecione Conectar um aparelho.
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
