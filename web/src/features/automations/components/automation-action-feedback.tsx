import type { AutomationActionResult } from '../types'

export function AutomationActionFeedback({ result }: { result?: AutomationActionResult }) {
  return (
    <>
      {result?.error && (
        <div
          role="alert"
          className="rounded border border-destructive/50 bg-destructive/5 p-3 text-sm"
        >
          <p>{result.error}</p>
          {result.fields?.length ? (
            <ul className="mt-2 list-inside list-disc">
              {result.fields.map((field, index) => (
                <li key={index}>
                  {field.field}: {field.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
      {result?.messages && (
        <pre
          role="status"
          className="max-h-60 overflow-auto whitespace-pre-wrap rounded border border-border bg-card p-3 text-sm"
        >
          {result.messages.join('\n\n')}
        </pre>
      )}
    </>
  )
}
