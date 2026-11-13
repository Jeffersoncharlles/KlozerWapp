import { RefreshCw } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { PageContainer, WorkspaceHeader } from '../../../components/workspace-header'
import { useWhatsAppConnection } from '../hooks/use-whatsapp-connection'
import type { WhatsAppLoaderData } from '../types'
import { ScheduleCard } from './schedule-card'
import { WhatsAppConfigurationCard } from './whatsapp-configuration-card'
import { WhatsAppConnectionCard } from './whatsapp-connection-card'
import { WhatsAppSetupCard } from './whatsapp-setup-card'
import { WhatsAppStatusCard } from './whatsapp-status-card'

export function WhatsAppContainer({ data }: { data: WhatsAppLoaderData }) {
  const connection = useWhatsAppConnection(data)
  const message = connection.error ?? data.error
  return (
    <PageContainer>
      <WorkspaceHeader
        title="WhatsApp"
        description="Conecte e gerencie o número usado nos atendimentos."
      />
      <main className="mx-auto w-full max-w-[1100px] space-y-5 p-4 sm:p-6 lg:py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium text-muted-foreground">CANAL DE ATENDIMENTO</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Conexão WhatsApp</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Mantenha seu aparelho conectado para receber mensagens e chamadas.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => connection.refresh()}
            disabled={connection.isSubmitting}
          >
            <RefreshCw className="size-3.5" />
            Atualizar status
          </Button>
        </div>
        {message ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"
          >
            {message}
          </div>
        ) : null}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <WhatsAppConnectionCard
            connection={data.connection}
            connected={connection.connected}
            qrCode={connection.qrCode}
            isSubmitting={connection.isSubmitting}
            onConnection={connection.updateConnection}
          />
          <WhatsAppSetupCard />
          <WhatsAppConfigurationCard key={JSON.stringify(data.configuration ?? {})} data={data} />
          <ScheduleCard key={JSON.stringify(data.schedule ?? {})} data={data} />
        </div>
        <WhatsAppStatusCard connected={connection.connected} />
      </main>
    </PageContainer>
  )
}
