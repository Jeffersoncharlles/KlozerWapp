import { z } from 'zod'

import { API_BASE_URL } from '../../../core/constants/api'
import { getAuthToken } from '../../../core/middlewares/authenticate'
import { dashboardReportSchema, type ReportsLoaderData } from '../types'

function getToken() {
  const token = getAuthToken()
  if (!token) throw new Error('Sessão inválida.')
  return token
}

export async function loadReports(url: string, signal?: AbortSignal): Promise<ReportsLoaderData> {
  try {
    const source = new URL(url)
    const params = new URLSearchParams()
    for (const key of ['from', 'to', 'connection_id']) {
      const value = source.searchParams.get(key)
      if (value) params.set(key, value)
    }
    const query = params.toString()
    const response = await fetch(`${API_BASE_URL}/reports/dashboard${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      signal,
    })
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string
        message?: string
      } | null
      throw new Error(
        payload?.error ?? payload?.message ?? 'Não foi possível carregar os relatórios.',
      )
    }
    return { report: dashboardReportSchema.parse(await response.json()) }
  } catch (error) {
    return {
      error:
        error instanceof z.ZodError
          ? 'A resposta do relatório está em um formato inválido.'
          : error instanceof Error
            ? error.message
            : 'Não foi possível carregar os relatórios.',
    }
  }
}
