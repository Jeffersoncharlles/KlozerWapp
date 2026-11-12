import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  MessageSquare,
  PhoneCall,
  TrendingUp,
  UsersRound,
} from 'lucide-react'
import { useNavigation } from 'react-router'

import { PageContainer, WorkspaceHeader } from '../../../components/workspace-header'
import type { DashboardReport, ReportsLoaderData } from '../types'
import { CallsCharts, MessagesCharts } from './report-charts'
import { ReportFilters } from './report-filters'
import { ReportMetricGrid, type Metric } from './report-metric-grid'
import { ReportRecordingsSection } from './report-recordings-section'
import { ReportSlaSection } from './report-sla-section'
import { ReportsEmptyState, ReportsErrorState, ReportsLoadingState } from './report-states'

const callMetrics: readonly Metric[] = [
  { key: 'total', label: 'Total', icon: PhoneCall, tone: 'sky' },
  { key: 'outgoing', label: 'Realizadas', icon: PhoneCall, tone: 'emerald' },
  { key: 'incoming', label: 'Recebidas', icon: PhoneCall, tone: 'emerald' },
  { key: 'answered', label: 'Atendidas', icon: TrendingUp, tone: 'emerald' },
  { key: 'missed', label: 'Perdidas', icon: AlertCircle, tone: 'rose' },
  { key: 'average_seconds', label: 'Duração média', icon: Clock3, tone: 'violet', suffix: 's' },
]

const chatMetrics: readonly Metric[] = [
  { key: 'messages', label: 'Mensagens', icon: MessageSquare, tone: 'sky' },
  { key: 'received', label: 'Recebidas', icon: PhoneCall, tone: 'emerald' },
  { key: 'sent', label: 'Enviadas', icon: MessageSquare, tone: 'emerald' },
  { key: 'open', label: 'Em aberto', icon: UsersRound, tone: 'primary' },
  { key: 'waiting', label: 'Aguardando', icon: Clock3, tone: 'violet' },
  { key: 'finished', label: 'Finalizados', icon: CheckCircle2, tone: 'emerald' },
]

export function ReportsContainer({ data }: { data: ReportsLoaderData }) {
  const navigation = useNavigation()
  const report = data.report
  const isLoading = navigation.state === 'loading'
  const periodLabel = report?.period.from.startsWith('0001-')
    ? 'Período padrão'
    : report
      ? `${report.period.from.slice(0, 10)} a ${report.period.to.slice(0, 10)}`
      : 'Período padrão'

  return (
    <PageContainer>
      <WorkspaceHeader
        title="Relatórios"
        description="Chamadas e atendimentos no período selecionado"
      />
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold">Indicadores da operação</h1>
          </div>
          <span className="text-xs text-muted-foreground">{periodLabel}</span>
        </div>
        <ReportFilters />
        {isLoading ? (
          <ReportsLoadingState />
        ) : data.error ? (
          <ReportsErrorState message={data.error} />
        ) : report ? (
          <ReportSections report={report} />
        ) : (
          <ReportsEmptyState />
        )}
      </main>
    </PageContainer>
  )
}

function ReportSections({ report }: { report: DashboardReport }) {
  return (
    <>
      <ReportSection title="Chamadas" icon={PhoneCall}>
        <ReportMetricGrid metrics={callMetrics} values={report.calls} />
        <CallsCharts report={report} />
      </ReportSection>
      <ReportSection title="Atendimentos no chat" icon={MessageSquare}>
        <ReportMetricGrid metrics={chatMetrics} values={report.chat} />
        <MessagesCharts report={report} />
      </ReportSection>
      <ReportSlaSection report={report} />
      <ReportRecordingsSection report={report} />
    </>
  )
}

function ReportSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof PhoneCall
  children: React.ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Icon className="size-4" />
        {title}
      </h2>
      {children}
    </section>
  )
}
