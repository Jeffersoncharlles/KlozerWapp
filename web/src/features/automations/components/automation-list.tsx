import { Plus } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import type { AutomationActionResult, AutomationMutation, AutomationSummary } from '../types'
import { AutomationActionFeedback } from './automation-action-feedback'
import { AutomationEmptyState } from './automation-empty-state'
import { AutomationListItem } from './automation-list-item'

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
            <AutomationListItem
              key={item.id}
              item={item}
              boundFlowId={boundFlowId}
              busy={busy}
              onSubmit={onSubmit}
            />
          ))}
        </div>
      ) : (
        <AutomationEmptyState busy={busy} onCreate={() => onSubmit({ intent: 'create' })} />
      )}
    </main>
  )
}
