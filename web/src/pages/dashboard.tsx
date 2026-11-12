import { useLoaderData } from 'react-router'

import { DashboardContainer } from '../features/dashbaord/components/dashboard-container'
import { loadDashboard } from '../features/dashbaord/services/dashboard-service'
import type { DashboardLoaderData } from '../features/dashbaord/types'

export const loader = loadDashboard

export function Dashboard() {
  return <DashboardContainer data={useLoaderData() as DashboardLoaderData} />
}
