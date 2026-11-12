import { ArrowLeft, Link2, Save, Upload } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import type { AutomationFlow, AutomationMutation } from '../types'

type Props = {
  flow: AutomationFlow
  boundFlowId?: string
  busy: boolean
  isDirty: boolean
  name: string
  keywords: string
  keywordMatch: AutomationFlow['keywordMatch']
  enabled: boolean
  onNameChange: (value: string) => void
  onKeywordsChange: (value: string) => void
  onKeywordMatchChange: (value: AutomationFlow['keywordMatch']) => void
  onEnabledChange: (value: boolean) => void
  onSubmit: (mutation: AutomationMutation) => void
}

export function AutomationEditorHeader({
  flow,
  boundFlowId,
  busy,
  isDirty,
  name,
  keywords,
  keywordMatch,
  enabled,
  onNameChange,
  onKeywordsChange,
  onKeywordMatchChange,
  onEnabledChange,
  onSubmit,
}: Props) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-4 py-3 sm:px-6">
      <Button
        size="sm"
        variant="ghost"
        disabled={busy}
        onClick={() => navigate('/dashboard/automations')}
      >
        <ArrowLeft className="size-4" />
        Fluxos
      </Button>
      <Input
        aria-label="Nome da automação"
        disabled={busy}
        className="h-9 w-48"
        maxLength={120}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
      />
      <Input
        aria-label="Palavras-chave"
        disabled={busy}
        className="h-9 w-44"
        maxLength={1000}
        value={keywords}
        onChange={(event) => onKeywordsChange(event.target.value)}
        placeholder="Palavras-chave (vazio: todas)"
      />
      <select
        aria-label="Correspondência das palavras-chave"
        disabled={busy}
        className="h-9 rounded border border-input bg-background px-2 text-xs"
        value={keywordMatch}
        onChange={(event) =>
          onKeywordMatchChange(event.target.value as AutomationFlow['keywordMatch'])
        }
      >
        <option value="any">Qualquer palavra</option>
        <option value="all">Todas as palavras</option>
        <option value="exact">Texto exato</option>
      </select>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          disabled={busy || !flow.publishedRevision}
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
        />
        Ativo
      </label>
      <span className="text-xs text-muted-foreground">
        Revisão {flow.revision} ·{' '}
        {flow.publishedRevision ? `Publicada ${flow.publishedRevision}` : 'Não publicado'}
      </span>
      {isDirty && (
        <span className="text-xs text-amber-600 dark:text-amber-400">Alterações não salvas</span>
      )}
      <Button disabled={busy || !isDirty} onClick={() => onSubmit({ intent: 'save', flow })}>
        <Save className="size-4" />
        Salvar
      </Button>
      <Button
        variant="outline"
        disabled={busy || isDirty}
        onClick={() => onSubmit({ intent: 'publish', revision: flow.revision })}
      >
        <Upload className="size-4" />
        Publicar
      </Button>
      {boundFlowId !== undefined && (
        <Button
          variant="outline"
          disabled={busy || isDirty || !flow.publishedRevision}
          onClick={() =>
            onSubmit({ intent: 'bind', flowId: boundFlowId === flow.id ? '' : flow.id })
          }
        >
          <Link2 className="size-4" />
          {boundFlowId === flow.id ? 'Desvincular' : 'Vincular conexão'}
        </Button>
      )}
    </div>
  )
}
