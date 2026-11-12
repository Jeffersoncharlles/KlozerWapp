import type { AutomationActionResult, FlowIssue } from '../types'
import { AutomationActionFeedback } from './automation-action-feedback'

type Props = {
  result?: AutomationActionResult
  warnings: FlowIssue[]
}

export function AutomationEditorStatus({ result, warnings }: Props) {
  return (
    <div className="space-y-2 px-4 py-2">
      <AutomationActionFeedback result={result} />
      {warnings.length > 0 && (
        <details className="text-xs text-amber-700 dark:text-amber-300">
          <summary>{warnings.length} aviso(s) no rascunho</summary>
          <ul className="mt-2 list-inside list-disc">
            {warnings.map((issue, index) => (
              <li key={index}>{issue.message}</li>
            ))}
          </ul>
        </details>
      )}
      <p className="text-xs text-muted-foreground">
        Salvar altera o rascunho. Publicar atualiza novas conversas; conversas em andamento mantêm a
        versão original. Publicação e vínculo exigem administrador.
      </p>
    </div>
  )
}
