import { LoaderCircle, Paperclip, Send, Smile } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

type Props = {
  draft: string
  sending: boolean
  onDraftChange: (value: string) => void
  onSend: () => void
}

export function ConversationComposer({ draft, sending, onDraftChange, onSend }: Props) {
  return (
    <div className="border-t border-border/70 p-3 sm:p-4">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-background/70 p-2">
        <Button variant="ghost" size="icon-sm" aria-label="Anexar arquivo">
          <Paperclip className="size-4" />
        </Button>
        <Input
          className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0"
          placeholder="Digite sua mensagem..."
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              onSend()
            }
          }}
        />
        <Button variant="ghost" size="icon-sm" aria-label="Inserir emoji">
          <Smile className="size-4" />
        </Button>
        <Button
          size="icon-sm"
          aria-label="Enviar mensagem"
          className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          onClick={onSend}
          disabled={sending || !draft.trim()}
        >
          {sending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
    </div>
  )
}
