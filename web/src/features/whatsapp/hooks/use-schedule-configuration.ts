import { useState } from 'react'
import { useFetcher } from 'react-router'

import { emptySchedule, scheduleSchema, type Schedule } from '../domain/schedule'
import type { WhatsAppActionResult, WhatsAppLoaderData } from '../types'

export function useScheduleConfiguration(data: WhatsAppLoaderData) {
  const fetcher = useFetcher<WhatsAppActionResult>()
  const initial = data.schedule ?? emptySchedule
  const [schedule, setSchedule] = useState(initial)
  const dirty = JSON.stringify(schedule) !== JSON.stringify(initial)
  const validation = scheduleSchema.safeParse(schedule)

  function save() {
    if (!dirty || fetcher.state !== 'idle' || !validation.success) return
    void fetcher.submit(
      { intent: 'save-schedule', schedule },
      { method: 'post', encType: 'application/json' },
    )
  }

  return {
    schedule,
    setSchedule: (value: Schedule) => setSchedule(value),
    dirty,
    error: fetcher.data?.error,
    validationError: validation.success ? undefined : validation.error.issues[0]?.message,
    isSubmitting: fetcher.state !== 'idle',
    save,
  }
}
