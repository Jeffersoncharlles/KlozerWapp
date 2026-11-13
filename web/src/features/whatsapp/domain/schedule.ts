import { z } from 'zod'

export const scheduleIntervalSchema = z.object({
  start: z.string(),
  end: z.string(),
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
})

export type Schedule = z.infer<typeof scheduleSchema>

export const emptySchedule: Schedule = {
  enabled: false,
  timezone: '',
  days: [],
  intervals: [],
  allDay: false,
  autoReplyEnabled: false,
  welcomeMessage: '',
  closedMessage: '',
}
