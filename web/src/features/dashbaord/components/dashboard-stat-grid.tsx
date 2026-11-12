import type { DashboardLoaderData } from '../types'
import { statCards } from '../utils/dashboard'
import { DashboardStatCard } from './dashboard-stat-card'

export function DashboardStatGrid({
  data,
  loading,
}: {
  data: DashboardLoaderData
  loading: boolean
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {statCards.map((item) => (
        <DashboardStatCard key={item.key} data={data} loading={loading} item={item} />
      ))}
    </div>
  )
}
