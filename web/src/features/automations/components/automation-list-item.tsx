import { Copy, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '../../../components/ui/button'
import type { AutomationMutation, AutomationSummary } from '../types'

type Props = {
  item: AutomationSummary
  boundFlowId?: string
  busy: boolean
  onSubmit: (mutation: AutomationMutation) => void
}

export function AutomationListItem({ item, boundFlowId, busy, onSubmit }: Props) {
  return (
    <div className="flex items-center gap-3 p-4">
      <button
        type="button"
        disabled={busy || !item.publishedRevision}
        aria-label={item.enabled ? 'Desativar automação' : 'Ativar automação'}
        data-enabled={item.enabled}
        onClick={() =>
          onSubmit({
            intent: 'toggle',
            id: item.id,
            revision: item.revision,
            enabled: !item.enabled,
          })
        }
        className="size-3 shrink-0 rounded-full bg-muted-foreground disabled:opacity-40 data-[enabled=true]:bg-emerald-600"
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
  )
}
