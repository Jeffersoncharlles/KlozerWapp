import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { useWhatsAppConfiguration } from '../hooks/use-whatsapp-configuration'
import type { WhatsAppLoaderData } from '../types'

export function WhatsAppConfigurationCard({ data }: { data: WhatsAppLoaderData }) {
  const { configuration, automations, queues, dirty, isSubmitting, error, setConfiguration, save } =
    useWhatsAppConfiguration(data)

  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader>
        <CardTitle>Configuração do atendimento</CardTitle>
        <CardDescription>
          Automação, fila e horário são opcionais e podem ser definidos depois. Alterar esta
          configuração não desconecta o aparelho.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p
            role="alert"
            className="rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
        <label className="block space-y-1.5 text-sm font-medium">
          Automação
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={configuration.flowId}
            onChange={(event) => setConfiguration({ ...configuration, flowId: event.target.value })}
          >
            <option value="">Atendimento manual</option>
            {(automations ?? [])
              .filter((flow) => flow.enabled && flow.publishedRevision > 0)
              .map((flow) => (
                <option key={flow.id} value={flow.id}>
                  {flow.name}
                </option>
              ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm font-medium">
          Fila de transmissão
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={configuration.queueId}
            onChange={(event) =>
              setConfiguration({ ...configuration, queueId: event.target.value })
            }
          >
            <option value="">Sem fila definida</option>
            {(queues ?? [])
              .filter((queue) => queue.is_active)
              .map((queue) => (
                <option key={queue.id} value={queue.id}>
                  {queue.name}
                </option>
              ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={configuration.businessHoursEnabled}
            onChange={(event) =>
              setConfiguration({ ...configuration, businessHoursEnabled: event.target.checked })
            }
          />
          Usar horário de funcionamento
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={save} disabled={isSubmitting || !dirty}>
            Salvar configuração
          </Button>
          <span
            className={`text-xs ${dirty ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}
            role="status"
          >
            {dirty ? 'Alterações pendentes' : 'Configuração salva'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
