import { Plus, Workflow } from 'lucide-react'

import { Button } from '../../../components/ui/button'

type Props = {
  busy: boolean
  onCreate: () => void
}

export function AutomationEmptyState({ busy, onCreate }: Props) {
  return (
    <section className="max-w-lg rounded-xl border border-border bg-card p-8 text-center shadow-sm">
      <Workflow className="mx-auto mb-4 size-10 text-emerald-600" />
      <h2 className="text-xl font-semibold">Crie sua primeira automação</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Comece com uma saudação e um menu de opções. Personalize e conecte os passos antes de
        publicar.
      </p>
      <div className="mt-6">
        <Button disabled={busy} onClick={onCreate}>
          <Plus className="size-4" />
          Criar automação
        </Button>
      </div>
    </section>
  )
}
