import { Copy, Plus, Trash2, Workflow } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '../../../components/ui/button'
import type { AutomationActionResult, AutomationMutation, AutomationSummary } from '../types'
import { AutomationActionFeedback } from './automation-action-feedback'

type Props = {
  flows?: AutomationSummary[]
  boundFlowId?: string
  busy: boolean
  result?: AutomationActionResult
  onSubmit: (mutation: AutomationMutation) => void
}

export function AutomationList({ flows, boundFlowId, busy, result, onSubmit }: Props) {
  const createButton = (
    <Button disabled={busy} onClick={() => onSubmit({ intent: 'create' })}>
      <Plus className="size-4" />
      Criar automação
    </Button>
  )
  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Automações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Fluxos persistidos no CRM. Publique, ative e vincule à conexão para executar.
          </p>
        </div>
        {createButton}
      </div>
      <AutomationActionFeedback result={result} />
      {flows?.length ? (
        <div className="divide-y rounded-xl border border-border bg-card">
          {flows.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-4">
              <button
                type="button"
                disabled={busy || !item.publishedRevision}
                aria-label={item.enabled ? 'Desativar automação' : 'Ativar automação'}
                onClick={() =>
                  onSubmit({
                    intent: 'toggle',
                    id: item.id,
                    revision: item.revision,
                    enabled: !item.enabled,
                  })
                }
                className={`size-3 shrink-0 rounded-full disabled:opacity-40 ${item.enabled ? 'bg-emerald-600' : 'bg-muted-foreground'}`}
              />
              <Link to={`/dashboard/automations/${item.id}`} className="min-w-0 flex-1">
                <span className="block truncate font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.steps} passos · {item.enabled ? 'Ativa' : 'Desativada'} ·{' '}
                  {item.publishedRevision ? `Publicada ${item.publishedRevision}` : 'Rascunho'}
                  {boundFlowId === item.id ? ' · Vinculada à conexão' : ''}
                </span>
              </Link>
              <Button
                disabled={busy}
                variant="ghost"
                size="icon-sm"
                aria-label="Duplicar automação"
                onClick={() => onSubmit({ intent: 'duplicate', id: item.id })}
              >
                <Copy className="size-4" />
              </Button>
              <Button
                disabled={busy}
                variant="ghost"
                size="icon-sm"
                aria-label="Excluir automação"
                onClick={() => {
                  if (window.confirm(`Excluir "${item.name}" e encerrar suas sessões?`))
                    onSubmit({ intent: 'delete', id: item.id, revision: item.revision })
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <section className="max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-sm">
          <Workflow className="mx-auto mb-4 size-10 text-emerald-600" />
          <h2 className="text-xl font-semibold">Crie sua primeira automação</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Comece com uma saudação e um menu de opções. Personalize e conecte os passos antes de
            publicar.
          </p>
          <div className="mt-6">{createButton}</div>
        </section>
      )}
    </main>
  )
}
