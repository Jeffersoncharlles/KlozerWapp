import {
  redirect,
  useLoaderData,
  useRouteError,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { z } from 'zod'

import { AutomationsContainer } from '../features/automations/components/automations-container'
import {
  AutomationAPIError,
  listAutomations,
  loadAutomation,
  createAutomation,
  saveAutomation,
  toggleAutomation,
  publishAutomation,
  duplicateAutomation,
  deleteAutomation,
  bindAutomation,
  loadAutomationBinding,
  simulateAutomation,
} from '../features/automations/services/automation-service'
import {
  automationMutationSchema,
  type AutomationActionResult,
  type AutomationLoaderData,
} from '../features/automations/types'

export async function loader({
  params,
  request,
}: LoaderFunctionArgs): Promise<AutomationLoaderData> {
  if (params.id) {
    const flow = await loadAutomation(params.id, request.signal)
    const binding = await loadAutomationBinding(request.signal).catch((error) => {
      if (error instanceof AutomationAPIError && error.status === 403) return undefined
      throw error
    })
    return { flow, boundFlowId: binding?.flowId }
  }
  const [flows, binding] = await Promise.all([
    listAutomations(request.signal),
    loadAutomationBinding(request.signal).catch((error) => {
      if (error instanceof AutomationAPIError && error.status === 403) return undefined
      throw error
    }),
  ])
  return { flows, boundFlowId: binding?.flowId }
}
export async function action({
  request,
  params,
}: ActionFunctionArgs): Promise<AutomationActionResult | Response> {
  try {
    const mutation = automationMutationSchema.parse(await request.json())
    switch (mutation.intent) {
      case 'create': {
        const flow = await createAutomation()
        return redirect(`/dashboard/automations/${flow.id}`)
      }
      case 'duplicate': {
        const flow = await duplicateAutomation(mutation.id)
        return redirect(`/dashboard/automations/${flow.id}`)
      }
      case 'delete':
        await deleteAutomation(mutation.id, mutation.revision)
        return { message: 'Automação excluída' }
      case 'toggle':
        await toggleAutomation(mutation.id, mutation.revision, mutation.enabled)
        return { message: 'Status atualizado' }
      case 'save':
        if (params.id !== mutation.flow.id) throw new Error('Fluxo inválido.')
        return { flow: await saveAutomation(mutation.flow), message: 'Rascunho salvo no servidor' }
      case 'publish':
        if (!params.id) throw new Error('Fluxo inválido.')
        return {
          flow: await publishAutomation(params.id, mutation.revision),
          message: 'Versão publicada',
        }
      case 'bind':
        await bindAutomation(mutation.flowId)
        return { message: mutation.flowId ? 'Fluxo vinculado à conexão' : 'Vínculo removido' }
      case 'simulate':
        if (!params.id) throw new Error('Fluxo inválido.')
        return {
          ...(await simulateAutomation(params.id, mutation.inputs)),
          message: 'Simulação concluída sem envios reais',
        }
    }
  } catch (error) {
    if (error instanceof AutomationAPIError) return { error: error.message, fields: error.fields }
    if (error instanceof z.ZodError)
      return {
        error: 'Confira os dados do fluxo.',
        fields: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      }
    return {
      error: error instanceof Error ? error.message : 'Não foi possível concluir a operação.',
    }
  }
}
export function Automations() {
  return <AutomationsContainer data={useLoaderData() as AutomationLoaderData} />
}
export function AutomationErrorBoundary() {
  const error = useRouteError()
  return (
    <main className="p-6">
      <h1 className="font-semibold">Não foi possível carregar as automações</h1>
      <p className="mt-2 text-sm">
        {error instanceof Error ? error.message : 'Verifique sua sessão e tente novamente.'}
      </p>
      <a className="mt-4 inline-block underline" href="/dashboard/automations">
        Voltar à lista
      </a>
    </main>
  )
}
