import { AlertCircle } from 'lucide-react'

import { Card, CardContent } from '../../../components/ui/card'
import { Skeleton } from '../../../components/ui/skeleton'

export function ReportsLoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12" />
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  )
}

export function ReportsErrorState({ message }: { message: string }) {
  return (
    <Card>
      <CardContent className="flex min-h-52 flex-col items-center justify-center text-center">
        <AlertCircle className="size-8 text-destructive" />
        <h2 className="mt-3 font-semibold">Não foi possível carregar os relatórios</h2>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

export function ReportsEmptyState() {
  return (
    <Card>
      <CardContent className="flex min-h-64 flex-col items-center justify-center text-center">
        <div className="flex size-12 items-end justify-center gap-1 rounded-xl bg-primary/10 p-3 text-primary">
          <span className="h-3 w-1.5 rounded-sm bg-current" />
          <span className="h-5 w-1.5 rounded-sm bg-current" />
          <span className="h-4 w-1.5 rounded-sm bg-current" />
        </div>
        <h2 className="mt-4 font-semibold">Sem dados no período</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Ajuste os filtros ou aguarde novos atendimentos para visualizar os indicadores.
        </p>
      </CardContent>
    </Card>
  )
}
