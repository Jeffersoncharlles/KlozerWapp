import { CheckCircle2, Smartphone } from 'lucide-react'

import { Card, CardContent } from '../../../components/ui/card'

export function WhatsAppStatusCard({ connected }: { connected: boolean }) {
  return (
    <Card className="border-border bg-card shadow-none">
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
        <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
          {connected ? (
            <CheckCircle2 className="size-4 text-emerald-500" />
          ) : (
            <Smartphone className="size-4" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium">
            {connected ? 'Sua sessão está pronta para uso' : 'Conecte um aparelho para começar'}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            A conexão é necessária para enviar e receber mensagens no painel.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
