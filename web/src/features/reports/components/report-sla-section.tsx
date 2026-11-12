import { CheckCircle2, Clock3, Timer, UsersRound } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import type { DashboardReport } from '../types'

const queueSections = ['Por fila', 'Por conexão', 'Por atendente']
const number = new Intl.NumberFormat('pt-BR')

export function ReportSlaSection({ report }: { report: DashboardReport }) {
  const available = report.sla?.available ?? false
  return (
    <section className="space-y-3">
      <ReportSectionTitle icon={Timer}>SLA por fila e conexão</ReportSectionTitle>
      <Card>
        <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
          <SlaMetric
            label="Atendimentos"
            value={number.format(report.chat.messages)}
            icon={UsersRound}
          />
          <SlaMetric
            label="1ª resposta média"
            value={available ? 'Disponível' : 'Não disponível'}
            icon={Clock3}
          />
          <SlaMetric
            label="Cumprimento"
            value={available ? 'Disponível' : 'Não disponível'}
            icon={CheckCircle2}
          />
        </CardContent>
      </Card>
      <div className="grid gap-3 lg:grid-cols-3">
        {queueSections.map((title) => (
          <SlaBreakdown key={title} title={title} />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
            Alertas de SLA
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-20 items-center justify-center text-sm text-muted-foreground">
          {available
            ? 'Os alertas de SLA estão disponíveis para esta conexão.'
            : 'Nenhum dado de SLA persistido para o período.'}
        </CardContent>
      </Card>
    </section>
  )
}

function SlaBreakdown({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-20 items-center justify-center text-sm text-muted-foreground">
        Sem dados no período.
      </CardContent>
    </Card>
  )
}

function SlaMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Clock3
}) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <Icon className="size-4 text-primary" />
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  )
}

function ReportSectionTitle({ icon: Icon, children }: { icon: typeof Timer; children: string }) {
  return (
    <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      <Icon className="size-4" />
      {children}
    </h2>
  )
}
