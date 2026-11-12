import { useLoaderData, useRouteError, type LoaderFunctionArgs } from 'react-router'

import { ReportsContainer } from '../features/reports/components/reports-container'
import { loadReports } from '../features/reports/services/reports-service'
import type { ReportsLoaderData } from '../features/reports/types'

export function loader({ request }: LoaderFunctionArgs) {
  return loadReports(request.url, request.signal)
}

export function Reports() {
  return <ReportsContainer data={useLoaderData() as ReportsLoaderData} />
}

export function ReportsErrorBoundary() {
  const error = useRouteError()
  return (
    <ReportsContainer
      data={{
        error: error instanceof Error ? error.message : 'Não foi possível carregar os relatórios.',
      }}
    />
  )
}
