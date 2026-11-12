import { CheckCheck } from 'lucide-react'

import { ScrollArea } from '../../../components/ui/scroll-area'
import type { ConversationMessage } from '../domain/conversation'

function formatTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(value),
  )
}

export function ConversationThread({ messages }: { messages: ConversationMessage[] }) {
  return (
    <ScrollArea className="min-h-0 flex-1 p-4 sm:p-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-3">
        <p className="self-center rounded-full bg-muted px-3 py-1 text-[10px] text-muted-foreground">
          Histórico
        </p>
        {messages.map((message) => (
          <div
            key={message.id}
            data-from-me={message.is_from_me || undefined}
            className="group flex max-w-[80%] flex-col gap-1 self-start items-start group-data-[from-me]:self-end group-data-[from-me]:items-end"
          >
            <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm group-data-[from-me]:rounded-tr-sm group-data-[from-me]:rounded-tl-none group-data-[from-me]:bg-emerald-500 group-data-[from-me]:text-emerald-950">
              {message.content}
            </div>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {message.is_from_me ? <CheckCheck className="size-3 text-emerald-400" /> : null}
              {formatTime(message.timestamp)}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
