import { LoaderCircle, LogOut, QrCode, Unplug } from 'lucide-react'

import { Button } from '../../../components/ui/button'

export function WhatsAppConnectionActions({
  connected,
  isSubmitting,
  onConnection,
}: {
  connected: boolean
  isSubmitting: boolean
  onConnection: (action: 'connect' | 'disconnect' | 'logout') => void
}) {
  return (
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
  )
}
