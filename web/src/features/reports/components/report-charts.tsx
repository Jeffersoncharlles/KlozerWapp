import { BarChart3, MessageSquare, PhoneCall, UsersRound } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import type { DashboardReport } from '../types'

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}

function formatDate(value: unknown) {
  const raw = String(value ?? '')
  const date = new Date(`${raw}T00:00:00`)
  return Number.isNaN(date.valueOf())
    ? raw
    : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export function CallsCharts({ report }: { report: DashboardReport }) {
  const hasData = report.calls_by_day.length > 0
  const statuses = report.calls_by_status
  return (
    <div className="grid gap-4 xl:grid-cols-[1.65fr_0.75fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <BarChart3 className="size-4 text-primary" /> Ligações por dia
          </CardTitle>
          <p className="text-xs text-muted-foreground">Saídas e entradas no período</p>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={report.calls_by_day}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={formatDate} />
                <Bar dataKey="outgoing" name="Saídas" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                <Bar
                  dataKey="incoming"
                  name="Entradas"
                  fill="var(--chart-1)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="Sem ligações no período." />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <PhoneCall className="size-4 text-primary" /> Status das chamadas
          </CardTitle>
          <p className="text-xs text-muted-foreground">Distribuição no período</p>
        </CardHeader>
        <CardContent>
          {statuses.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statuses}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={54}
                    outerRadius={78}
                    paddingAngle={3}
                  >
                    {statuses.map((item, index) => (
                      <Cell
                        key={item.status}
                        fill={
                          ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-4)', 'var(--chart-3)'][
                            index % 4
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Sem status de chamadas." />
          )}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {statuses.map((item) => (
              <span key={item.status}>
                {item.status}: {item.count}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function MessagesCharts({ report }: { report: DashboardReport }) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.65fr_0.75fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageSquare className="size-4 text-primary" /> Mensagens por dia
          </CardTitle>
          <p className="text-xs text-muted-foreground">Recebidas e enviadas no período</p>
        </CardHeader>
        <CardContent>
          {report.messages_by_day.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={report.messages_by_day}
                margin={{ top: 8, right: 8, left: -24, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={formatDate} />
                <Bar dataKey="sent" name="Enviadas" fill="var(--chart-2)" radius={[3, 3, 0, 0]} />
                <Bar
                  dataKey="received"
                  name="Recebidas"
                  fill="var(--chart-1)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart label="Sem mensagens no período." />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <UsersRound className="size-4 text-primary" /> Tickets por status
          </CardTitle>
          <p className="text-xs text-muted-foreground">Snapshot atual</p>
        </CardHeader>
        <CardContent>
          {report.tickets_by_status.length ? (
            <div className="space-y-3 pt-2">
              {report.tickets_by_status.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.status}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart label="Sem tickets cadastrados." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
