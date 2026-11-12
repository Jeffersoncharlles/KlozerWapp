import { ReactFlowProvider } from '@xyflow/react'
import { useFetcher } from 'react-router'

import { PageContainer, WorkspaceHeader } from '../../../components/workspace-header'
import type { AutomationActionResult, AutomationLoaderData, AutomationMutation } from '../types'
import { AutomationEditor } from './automation-editor'
import { AutomationList } from './automation-list'

export function AutomationsContainer({ data }: { data: AutomationLoaderData }) {
  const fetcher = useFetcher<AutomationActionResult>()
  const submit = (mutation: AutomationMutation) => {
    void fetcher.submit(mutation, { method: 'post', encType: 'application/json' })
  }
  return (
    <PageContainer>
      <WorkspaceHeader
        title="Fluxos"
        description="Construa automações visuais para suas conversas"
      />
      {data.flow ? (
        <ReactFlowProvider key={data.flow.id}>
          <AutomationEditor initialFlow={data.flow} boundFlowId={data.boundFlowId} />
        </ReactFlowProvider>
      ) : (
        <AutomationList
          flows={data.flows}
          boundFlowId={data.boundFlowId}
          busy={fetcher.state !== 'idle'}
          result={fetcher.data}
          onSubmit={submit}
        />
      )}
    </PageContainer>
  )
}
