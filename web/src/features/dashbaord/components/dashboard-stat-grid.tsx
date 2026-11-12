import { ArrowUpRight } from 'lucide-react'

import { Card, CardContent } from '../../../components/ui/card'
import { Skeleton } from '../../../components/ui/skeleton'
import type { DashboardLoaderData, DashboardMetrics } from '../types'
import { formatNumber, statCards } from '../utils/dashboard'

export function DashboardStatGrid({
  data,
  loading,
}: {
  data: DashboardLoaderData
  loading: boolean
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map(({ key, label, icon: Icon, color, bg }) => (
        <Card key={key} className="rounded-lg border-border bg-card shadow-none">
          <CardContent className="flex items-start justify-between p-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              {loading ? (
                <Skeleton className="mt-2 h-7 w-20" />
              ) : (
                <p className="mt-2 text-2xl font-semibold tracking-tight">
                  {data.metrics ? formatNumber(data.metrics[key as keyof DashboardMetrics]) : '—'}
                </p>
              )}
              <p className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="size-3" />
                Operação em andamento
              </p>
            </div>
            <div className={`flex size-9 items-center justify-center rounded-lg ${bg} ${color}`}>
              <Icon className="size-4" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
