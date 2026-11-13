import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { useScheduleConfiguration } from '../hooks/use-schedule-configuration'
import type { WhatsAppLoaderData } from '../types'

const weekdays = [
  ['Domingo', 0],
  ['Segunda-feira', 1],
  ['Terça-feira', 2],
  ['Quarta-feira', 3],
  ['Quinta-feira', 4],
  ['Sexta-feira', 5],
  ['Sábado', 6],
] as const

export function ScheduleCard({ data }: { data: WhatsAppLoaderData }) {
  const { schedule, setSchedule, dirty, error, isSubmitting, save } = useScheduleConfiguration(data)
  const configured =
    schedule.timezone !== '' &&
    (schedule.allDay || (schedule.days.length > 0 && schedule.intervals.length > 0))
  const intervals = schedule.intervals.length ? schedule.intervals : [{ start: '', end: '' }]

  function updateInterval(index: number, field: 'start' | 'end', value: string) {
    const next = intervals.map((interval, currentIndex) =>
      currentIndex === index ? { ...interval, [field]: value } : interval,
    )
    setSchedule({ ...schedule, intervals: next })
  }

  return (
    <Card className="border-border bg-card shadow-none lg:col-span-2">
      <CardHeader>
        <CardTitle>Horário de atendimento</CardTitle>
        <CardDescription>
          Respostas automáticas só serão enviadas quando a agenda estiver configurada e ativada.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <p
            role="alert"
            className="rounded border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium">
            Fuso horário
            <input
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              placeholder="America/Sao_Paulo"
              value={schedule.timezone}
              onChange={(event) => setSchedule({ ...schedule, timezone: event.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 self-end text-sm">
            <input
              type="checkbox"
              checked={schedule.enabled}
              onChange={(event) => setSchedule({ ...schedule, enabled: event.target.checked })}
            />
            Ativar agenda
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={schedule.autoReplyEnabled}
            onChange={(event) =>
              setSchedule({ ...schedule, autoReplyEnabled: event.target.checked })
            }
          />
          Permitir respostas automáticas
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={schedule.allDay}
            onChange={(event) => setSchedule({ ...schedule, allDay: event.target.checked })}
          />
          Atendimento 24 horas
        </label>
        {!schedule.allDay ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Dias de atendimento</p>
            <div className="flex flex-wrap gap-3">
              {weekdays.map(([label, day]) => (
                <label key={day} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={schedule.days.includes(day)}
                    onChange={(event) =>
                      setSchedule({
                        ...schedule,
                        days: event.target.checked
                          ? [...schedule.days, day]
                          : schedule.days.filter((item) => item !== day),
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        ) : null}
        <div className="space-y-3">
          <p className="text-sm font-medium">Intervalos</p>
          {intervals.map((interval, index) => (
            <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" key={index}>
              <label className="space-y-1.5 text-sm font-medium">
                Abertura
                <input
                  type="time"
                  disabled={schedule.allDay}
                  value={interval.start}
                  onChange={(event) => updateInterval(index, 'start', event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
              <label className="space-y-1.5 text-sm font-medium">
                Fechamento
                <input
                  type="time"
                  disabled={schedule.allDay}
                  value={interval.end}
                  onChange={(event) => updateInterval(index, 'end', event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </label>
              <Button
                type="button"
                variant="ghost"
                disabled={schedule.allDay || intervals.length === 1}
                onClick={() =>
                  setSchedule({
                    ...schedule,
                    intervals: intervals.filter((_, currentIndex) => currentIndex !== index),
                  })
                }
              >
                Remover
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={schedule.allDay}
            onClick={() =>
              setSchedule({ ...schedule, intervals: [...intervals, { start: '', end: '' }] })
            }
          >
            Adicionar intervalo
          </Button>
        </div>
        <label className="space-y-1.5 text-sm font-medium">
          Mensagem de boas-vindas
          <textarea
            className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm"
            value={schedule.welcomeMessage}
            onChange={(event) => setSchedule({ ...schedule, welcomeMessage: event.target.value })}
          />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Mensagem fora do horário
          <textarea
            className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-sm"
            value={schedule.closedMessage}
            onChange={(event) => setSchedule({ ...schedule, closedMessage: event.target.value })}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={save} disabled={isSubmitting || !dirty}>
            Salvar horário
          </Button>
          <span className="text-xs text-muted-foreground" role="status">
            {!configured
              ? 'Agenda não configurada'
              : schedule.enabled
                ? 'Agenda ativa'
                : 'Agenda desativada'}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
