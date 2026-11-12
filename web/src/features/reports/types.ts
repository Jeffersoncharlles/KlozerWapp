import { z } from 'zod'

const countSchema = z.number().int().nonnegative()

export const reportPeriodSchema = z.object({ from: z.string(), to: z.string() })
export const callReportSchema = z.object({
  total: countSchema,
  outgoing: countSchema,
  incoming: countSchema,
  answered: countSchema,
  missed: countSchema,
  rejected: countSchema,
  average_seconds: countSchema,
})
export const dailyCallReportSchema = z.object({
  date: z.string(),
  outgoing: countSchema,
  incoming: countSchema,
})
export const statusReportSchema = z.object({ status: z.string(), count: countSchema })
export const chatReportSchema = z.object({
  messages: countSchema,
  received: countSchema,
  sent: countSchema,
  open: countSchema,
  waiting: countSchema,
  finished: countSchema,
})
export const dailyMessageReportSchema = z.object({
  date: z.string(),
  received: countSchema,
  sent: countSchema,
})
export const slaSchema = z.object({ available: z.boolean() })
export const recordingsSchema = z.object({ available: z.boolean(), count: countSchema })

export const dashboardReportSchema = z.object({
  period: reportPeriodSchema,
  calls: callReportSchema,
  calls_by_day: z.array(dailyCallReportSchema),
  calls_by_status: z.array(statusReportSchema),
  chat: chatReportSchema,
  messages_by_day: z.array(dailyMessageReportSchema),
  tickets_by_status: z.array(statusReportSchema),
  sla: slaSchema.nullable(),
  recordings: recordingsSchema,
})

export type DashboardReport = z.infer<typeof dashboardReportSchema>
export type ReportsLoaderData = { report?: DashboardReport; error?: string }
