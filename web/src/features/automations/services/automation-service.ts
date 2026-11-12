import { z } from 'zod'
import { API_BASE_URL } from '../../../core/constants/api'
import { getAuthToken } from '../../../core/middlewares/authenticate'
import { automationFlowSchema, automationSummarySchema, flowIssueSchema, type AutomationFlow } from '../types'

const apiErrorSchema = z.object({ code: z.string().optional(), message: z.string().optional(), error: z.string().optional(), fields: z.array(flowIssueSchema).nullish() })
export class AutomationAPIError extends Error {
  status: number
  fields: z.infer<typeof flowIssueSchema>[]
  constructor(message: string, status: number, fields: z.infer<typeof flowIssueSchema>[] = []) { super(message); this.status = status; this.fields = fields }
}
async function request<T>(path: string, schema: z.ZodType<T>, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  const token = getAuthToken()
  if (!token) throw new AutomationAPIError('Sessão inválida. Entre novamente.', 401)
  const response = await fetch(`${API_BASE_URL}${path}`, { method, signal,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body) })
  if (!response.ok) {
    const payload = apiErrorSchema.safeParse(await response.json().catch(() => null))
    const message = payload.success ? payload.data.message ?? payload.data.error : undefined
    throw new AutomationAPIError(message ?? `Não foi possível concluir a operação (${response.status}).`, response.status, payload.success ? payload.data.fields ?? [] : [])
  }
  return schema.parse(response.status === 204 ? null : await response.json())
}
// Parsing the wire graph strips selected/measured/dragging and data.isStart.
export function flowPayload(flow: AutomationFlow) {
  const parsed = automationFlowSchema.parse(flow)
  return { name: parsed.name, trigger: parsed.trigger, keywords: parsed.keywords,
    keywordMatch: parsed.keywordMatch, enabled: parsed.enabled, graph: parsed.graph, revision: parsed.revision }
}
export const listAutomations = (signal?: AbortSignal) => request('/flows/?kind=chat', z.array(automationSummarySchema), 'GET', undefined, signal)
export const loadAutomation = (id: string, signal?: AbortSignal) => request(`/flows/${encodeURIComponent(id)}`, automationFlowSchema, 'GET', undefined, signal)
export const createAutomation = () => request('/flows/', automationFlowSchema, 'POST', { name: 'Novo fluxo de conversa' })
export const saveAutomation = (flow: AutomationFlow) => request(`/flows/${encodeURIComponent(flow.id)}`, automationFlowSchema, 'PATCH', flowPayload(flow))
export const toggleAutomation = (id: string, revision: number, enabled: boolean) => request(`/flows/${encodeURIComponent(id)}`, automationFlowSchema, 'PATCH', { revision, enabled })
export const publishAutomation = (id: string, revision: number) => request(`/flows/${encodeURIComponent(id)}/publish`, automationFlowSchema, 'POST', { revision })
export const duplicateAutomation = (id: string) => request(`/flows/${encodeURIComponent(id)}/duplicate`, automationFlowSchema, 'POST', {})
export const deleteAutomation = (id: string, revision: number) => request(`/flows/${encodeURIComponent(id)}?revision=${revision}`, z.null(), 'DELETE')
export const bindAutomation = (flowId: string) => request('/sessions/automation', z.object({ flowId: z.string() }), 'PUT', { flowId })
export const loadAutomationBinding = (signal?: AbortSignal) => request('/sessions/automation', z.object({ flowId: z.string() }), 'GET', undefined, signal)
export const simulateAutomation = (id: string, inputs: string[]) => request(`/flows/${encodeURIComponent(id)}/simulate`, z.object({ messages: z.array(z.string()) }), 'POST', { inputs })
