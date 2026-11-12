import { ArrowUpRight, type LucideIcon } from 'lucide-react'

import { Card, CardContent } from '../../../components/ui/card'
import { Skeleton } from '../../../components/ui/skeleton'
import type { DashboardLoaderData, DashboardMetrics } from '../types'
import { formatNumber } from '../utils/dashboard'

type Props = {
  data: DashboardLoaderData
  loading: boolean
  item: {
    key: string
    label: string
    icon: LucideIcon
    tone: 'contacts' | 'messages' | 'cards' | 'workflows'
  }
}

export function DashboardStatCard({ data, loading, item }: Props) {
  const { icon: Icon, key, label, tone } = item

  return (
    <Card className="rounded-lg border-border bg-card shadow-none">
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
        <div
          data-tone={tone}
          className="flex size-9 items-center justify-center rounded-lg bg-accent text-primary data-[tone=messages]:bg-emerald-500/10 data-[tone=messages]:text-emerald-600 dark:data-[tone=messages]:text-emerald-400 data-[tone=cards]:bg-violet-500/10 data-[tone=cards]:text-violet-600 dark:data-[tone=cards]:text-violet-400 data-[tone=workflows]:bg-amber-500/10 data-[tone=workflows]:text-amber-600 dark:data-[tone=workflows]:text-amber-400"
        >
          <Icon className="size-4" />
        </div>
      </CardContent>
    </Card>
  )
}
