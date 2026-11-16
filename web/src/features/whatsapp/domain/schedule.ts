import { z } from 'zod'

export const scheduleIntervalSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe um horário válido.'),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Informe um horário válido.'),
})

export const scheduleExceptionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.'),
  open: z.boolean(),
  allDay: z.boolean(),
  intervals: z.array(scheduleIntervalSchema),
})

export const scheduleSchema = z.object({
  enabled: z.boolean(),
  timezone: z.string(),
  days: z.array(z.number().int().min(0).max(6)),
  intervals: z.array(scheduleIntervalSchema),
  allDay: z.boolean(),
  autoReplyEnabled: z.boolean(),
  welcomeMessage: z.string(),
  closedMessage: z.string(),
  manualWelcomeMessage: z.string().default(''),
  manualWelcomeEnabled: z.boolean().default(false),
  outsideHoursPolicy: z
    .enum(['send_and_close', 'keep_open', 'queue', 'automation', 'inform_only'])
    .default('send_and_close'),
  exceptions: z.array(scheduleExceptionSchema).default([]),
})

export type Schedule = z.infer<typeof scheduleSchema>
export type ScheduleException = z.infer<typeof scheduleExceptionSchema>

export const emptySchedule: Schedule = {
  enabled: false,
  timezone: '',
  days: [],
  intervals: [],
  allDay: false,
  autoReplyEnabled: false,
  welcomeMessage: '',
  closedMessage: '',
  manualWelcomeMessage: '',
  manualWelcomeEnabled: false,
  outsideHoursPolicy: 'send_and_close',
  exceptions: [],
}
