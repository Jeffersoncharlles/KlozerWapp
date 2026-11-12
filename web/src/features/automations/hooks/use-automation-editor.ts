import { useCallback, useEffect, useRef, useState } from 'react'
import { useBeforeUnload, useBlocker, useFetcher } from 'react-router'
import { toast } from 'sonner'

import type { AutomationActionResult, AutomationFlow, AutomationMutation } from '../types'

function snapshot(flow: AutomationFlow) {
  return JSON.stringify({
    name: flow.name,
    keywords: flow.keywords,
    keywordMatch: flow.keywordMatch,
    enabled: flow.enabled,
    graph: {
      ...flow.graph,
      nodes: flow.graph.nodes.map(({ id, type, position, data }) => ({
        id,
        type,
        position,
        data: Object.fromEntries(
          Object.entries(data)
            .filter(
              ([key, value]) =>
                key !== 'isStart' &&
                (key === 'label' ||
                  key === 'description' ||
                  (value !== undefined &&
                    value !== '' &&
                    value !== 0 &&
                    (!Array.isArray(value) || value.length > 0))),
            )
            .sort(([a], [b]) => a.localeCompare(b)),
        ),
      })),
    },
  })
}

export function useAutomationEditor(initialFlow: AutomationFlow, currentFlow: AutomationFlow) {
  const fetcher = useFetcher<AutomationActionResult>()
  const [name, setName] = useState(initialFlow.name)
  const [keywords, setKeywords] = useState(initialFlow.keywords)
  const [keywordMatch, setKeywordMatch] = useState(initialFlow.keywordMatch)
  const [enabled, setEnabled] = useState(initialFlow.enabled)
  const [revision, setRevision] = useState(initialFlow.revision)
  const [publishedRevision, setPublishedRevision] = useState(initialFlow.publishedRevision)
  const [warnings, setWarnings] = useState(initialFlow.warnings)
  const [savedSnapshot, setSavedSnapshot] = useState(() => snapshot(initialFlow))
  const lastSaved = useRef<AutomationFlow | undefined>(undefined)
  const draft = {
    ...currentFlow,
    name,
    keywords,
    keywordMatch,
    enabled,
    revision,
    publishedRevision,
  }
  const isDirty = snapshot(draft) !== savedSnapshot
  const busy = fetcher.state !== 'idle'
  const blocker = useBlocker(
    useCallback(
      ({ currentLocation, nextLocation }) =>
        isDirty && currentLocation.pathname !== nextLocation.pathname,
      [isDirty],
    ),
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return
    if (window.confirm('Descartar alterações não salvas?')) blocker.proceed()
    else blocker.reset()
  }, [blocker])

  useBeforeUnload(
    useCallback(
      (event) => {
        if (isDirty) {
          event.preventDefault()
          event.returnValue = ''
        }
      },
      [isDirty],
    ),
  )

  useEffect(() => {
    const saved = fetcher.data?.flow
    if (!saved || saved === lastSaved.current) return
    lastSaved.current = saved
    setName(saved.name)
    setKeywords(saved.keywords)
    setKeywordMatch(saved.keywordMatch)
    setEnabled(saved.enabled)
    setRevision(saved.revision)
    setPublishedRevision(saved.publishedRevision)
    setWarnings(saved.warnings)
    setSavedSnapshot(snapshot(saved))
  }, [fetcher.data])

  useEffect(() => {
    if (fetcher.data?.message) toast.success(fetcher.data.message)
  }, [fetcher.data])

  const submit = useCallback(
    (mutation: AutomationMutation) => {
      void fetcher.submit(mutation, { method: 'post', encType: 'application/json' })
    },
    [fetcher],
  )

  return {
    busy,
    draft,
    fetcher,
    isDirty,
    name,
    setName,
    keywords,
    setKeywords,
    keywordMatch,
    setKeywordMatch,
    enabled,
    setEnabled,
    revision,
    publishedRevision,
    warnings,
    submit,
  }
}
