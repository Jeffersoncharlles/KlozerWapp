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
            className={`flex max-w-[80%] flex-col gap-1 ${message.is_from_me ? 'self-end items-end' : 'self-start items-start'}`}
          >
            <div
              className={`rounded-2xl px-4 py-3 text-sm ${message.is_from_me ? 'rounded-tr-sm bg-emerald-500 text-emerald-950' : 'rounded-tl-sm bg-muted'}`}
            >
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
