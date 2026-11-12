import { CalendarDays, Filter } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'

import { Button } from '../../../components/ui/button'

export function ReportFilters() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = new URLSearchParams(location.search)

  return (
    <form
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:flex-wrap sm:items-end"
      onSubmit={(event) => {
        event.preventDefault()
        const form = new FormData(event.currentTarget)
        const next = new URLSearchParams(location.search)
        for (const name of ['from', 'to', 'connection_id']) {
          const value = String(form.get(name) ?? '')
          if (value) next.set(name, value)
          else next.delete(name)
        }
        void navigate(`${location.pathname}?${next.toString()}`)
      }}
    >
      <div className="flex items-center gap-2 text-sm font-medium sm:mr-auto">
        <Filter className="size-4 text-primary" />
        Filtros do relatório
      </div>
      <label className="grid gap-1 text-xs text-muted-foreground">
        Conexão
        <input
          name="connection_id"
          defaultValue={params.get('connection_id') ?? ''}
          placeholder="Todas as conexões"
          className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30 sm:w-44"
        />
      </label>
      <label className="grid gap-1 text-xs text-muted-foreground">
        De
        <input
          name="from"
          type="date"
          defaultValue={params.get('from') ?? ''}
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <label className="grid gap-1 text-xs text-muted-foreground">
        Até
        <input
          name="to"
          type="date"
          defaultValue={params.get('to') ?? ''}
          className="h-8 rounded-lg border border-input bg-background px-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/30"
        />
      </label>
      <Button type="submit" size="sm">
        <CalendarDays className="size-3.5" />
        Aplicar filtros
      </Button>
    </form>
  )
}
