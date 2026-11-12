import { Mic2 } from 'lucide-react'

import { Card, CardContent } from '../../../components/ui/card'
import type { DashboardReport } from '../types'

const number = new Intl.NumberFormat('pt-BR')

export function ReportRecordingsSection({ report }: { report: DashboardReport }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Mic2 className="size-4" />
        Gravações de ligações
      </h2>
      <Card>
        <CardContent className="flex min-h-20 items-center justify-center p-4 text-center text-sm text-muted-foreground">
          {report.recordings.available
            ? `${number.format(report.recordings.count)} gravações no período.`
            : 'Nenhuma gravação disponível. A fonte de gravações ainda não está persistida.'}
        </CardContent>
      </Card>
    </section>
  )
}
