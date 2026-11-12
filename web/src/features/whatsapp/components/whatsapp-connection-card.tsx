import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import type { WhatsAppConnection } from '../types'
import { WhatsAppConnectionActions } from './whatsapp-connection-actions'
import { WhatsAppConnectionStatus } from './whatsapp-connection-status'
import { WhatsAppQrCode } from './whatsapp-qr-code'

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
        <WhatsAppConnectionStatus connection={connection} connected={connected} />
        <WhatsAppConnectionActions
          connected={connected}
          isSubmitting={isSubmitting}
          onConnection={onConnection}
        />
        {qrCode ? <WhatsAppQrCode value={qrCode} /> : null}
      </CardContent>
    </Card>
  )
}
