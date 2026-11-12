import { Filter, LoaderCircle, Search } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { ScrollArea } from '../../../components/ui/scroll-area'
import { contactDisplayName, contactInitials } from '../../../core/shared/contact'
import type { Conversation } from '../domain/conversation'

function formatTime(value?: string) {
  if (!value) return ''
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(
    new Date(value),
  )
}

type Props = {
  conversations: Conversation[]
  visible: Conversation[]
  selectedID?: string
  loading: boolean
  search: string
  onSearchChange: (value: string) => void
  onSelect: (id: string) => void
}

export function ConversationList({
  conversations,
  visible,
  selectedID,
  loading,
  search,
  onSearchChange,
  onSelect,
}: Props) {
  return (
    <Card className="flex w-full shrink-0 flex-col overflow-hidden rounded-b-none border-border/70 bg-card/70 lg:w-[360px] lg:rounded-r-none lg:rounded-bl-xl">
      <div className="border-b border-border/70 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Chats</h1>
            <p className="text-xs text-muted-foreground">{conversations.length} conversa(s)</p>
          </div>
          <Button variant="outline" size="icon-sm" aria-label="Filtrar conversas">
            <Filter className="size-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="h-9 pl-9"
            placeholder="Buscar conversa..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-1 p-2">
          {loading ? (
            <div className="flex items-center justify-center p-8 text-sm text-muted-foreground">
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              Carregando conversas
            </div>
          ) : null}
          {!loading && visible.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma conversa encontrada.
            </p>
          ) : null}
          {visible.map((conversation) => (
            <button
              key={conversation.contact.id}
              type="button"
              onClick={() => onSelect(conversation.contact.id)}
              data-selected={selectedID === conversation.contact.id || undefined}
              className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-muted/50 data-[selected]:bg-emerald-400/10 data-[selected]:ring-1 data-[selected]:ring-emerald-400/30"
            >
              <Avatar>
                {conversation.contact.avatar_url ? (
                  <AvatarImage
                    src={conversation.contact.avatar_url}
                    alt={`Foto de ${contactDisplayName(conversation.contact.name, conversation.contact.phone)}`}
                  />
                ) : null}
                <AvatarFallback className="bg-sky-400/15 text-sky-300">
                  {contactInitials(conversation.contact.name, conversation.contact.phone)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <strong className="truncate text-sm">
                    {contactDisplayName(conversation.contact.name, conversation.contact.phone)}
                  </strong>
                  <small className="shrink-0 text-[10px] text-muted-foreground">
                    {formatTime(conversation.last_message?.timestamp)}
                  </small>
                </span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {conversation.last_message?.content ?? 'Nenhuma mensagem'}
                </span>
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  )
}
