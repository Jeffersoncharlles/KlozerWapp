import type { LucideIcon } from 'lucide-react'

import { Card, CardContent } from '../../../components/ui/card'

const number = new Intl.NumberFormat('pt-BR')

type Metric = {
  key: string
  label: string
  icon: LucideIcon
  tone?: 'sky' | 'emerald' | 'rose' | 'violet' | 'primary'
  suffix?: string
}

export function ReportMetricGrid({
  metrics,
  values,
}: {
  metrics: readonly Metric[]
  values: Record<string, number>
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {metrics.map((metric) => (
        <ReportMetricCard key={metric.key} metric={metric} value={values[metric.key] ?? 0} />
      ))}
    </div>
  )
}

function ReportMetricCard({ metric, value }: { metric: Metric; value: number }) {
  const Icon = metric.icon
  return (
    <Card>
      <CardContent className="p-4">
        <div
          data-tone={metric.tone ?? 'primary'}
          className="flex size-8 items-center justify-center rounded-lg text-primary data-[tone=emerald]:bg-emerald-500/10 data-[tone=emerald]:text-emerald-500 data-[tone=rose]:bg-rose-500/10 data-[tone=rose]:text-rose-500 data-[tone=sky]:bg-sky-500/10 data-[tone=sky]:text-sky-500 data-[tone=violet]:bg-violet-500/10 data-[tone=violet]:text-violet-500"
        >
          <Icon className="size-4" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{metric.label}</p>
        <p className="mt-1 text-2xl font-semibold">
          {number.format(value)}
          {metric.suffix ?? ''}
        </p>
      </CardContent>
    </Card>
  )
}

export type { Metric }
