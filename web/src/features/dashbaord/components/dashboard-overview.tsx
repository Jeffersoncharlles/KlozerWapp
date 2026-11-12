import { BarChart3, Clock3 } from 'lucide-react'
import { Link, useNavigation } from 'react-router'

import { Button } from '../../../components/ui/button'
import type { DashboardLoaderData } from '../types'
import { DashboardConnectionCard } from './dashboard-connection-card'
import { DashboardRecentCard } from './dashboard-recent-card'
import { DashboardStatGrid } from './dashboard-stat-grid'
import { DashboardTeamCard } from './dashboard-team-card'
import { DashboardVolumeCard } from './dashboard-volume-card'

export function DashboardOverview({ data }: { data: DashboardLoaderData }) {
  const navigation = useNavigation()
  return (
    <main className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6 lg:px-7 lg:py-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Quarta-feira, 11 de novembro de 2026
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">Visão geral</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acompanhe sua operação em tempo real</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-border bg-card"
          render={<Link to="/dashboard/reports" />}
        >
          <BarChart3 className="size-4" />
          Ver relatórios
        </Button>
      </div>
      {data.error ? (
        <div
          className="flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300"
          role="alert"
        >
          <Clock3 className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">Alguns dados não puderam ser carregados</p>
            <p className="mt-1 text-amber-700/70 dark:text-amber-300/70">{data.error}</p>
          </div>
        </div>
      ) : null}
      <DashboardStatGrid data={data} loading={navigation.state === 'loading'} />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
        <DashboardVolumeCard />
        <DashboardConnectionCard status={data.whatsappStatus} />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_350px]">
        <DashboardRecentCard />
        <DashboardTeamCard />
      </div>
    </main>
  )
}
