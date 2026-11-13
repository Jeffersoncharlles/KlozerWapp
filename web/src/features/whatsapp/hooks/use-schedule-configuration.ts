import { useState } from 'react'
import { useFetcher } from 'react-router'

import { emptySchedule, type Schedule } from '../domain/schedule'
import type { WhatsAppActionResult, WhatsAppLoaderData } from '../types'

export function useScheduleConfiguration(data: WhatsAppLoaderData) {
  const fetcher = useFetcher<WhatsAppActionResult>()
  const initial = data.schedule ?? emptySchedule
  const [schedule, setSchedule] = useState(initial)
  const dirty = JSON.stringify(schedule) !== JSON.stringify(initial)

  function save() {
    if (!dirty || fetcher.state !== 'idle') return
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
    isSubmitting: fetcher.state !== 'idle',
    save,
  }
}
