import { Archive, MoreHorizontal, UserRound } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { Button } from '../../../components/ui/button'
import { contactDisplayName, contactInitials } from '../../../core/shared/contact'
import type { Conversation, ConversationTag } from '../domain/conversation'

type Props = {
  conversation: Conversation
  tags: ConversationTag[]
  tagID: string
  onTagIDChange: (value: string) => void
  onAddTag: () => void
  onRemoveTag: (tagID: string) => void
}

export function ConversationHeader({
  conversation,
  tags,
  tagID,
  onTagIDChange,
  onAddTag,
  onRemoveTag,
}: Props) {
  const selectedTags = conversation.contact.tags ?? []
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border/70 p-4">
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
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">
          {contactDisplayName(conversation.contact.name, conversation.contact.phone)}
        </p>
        <p className="text-xs text-muted-foreground">{conversation.contact.phone}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {selectedTags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              className="rounded-full px-2 py-0.5 text-[10px]"
              style={{ backgroundColor: `${tag.color}33`, color: tag.color }}
              onClick={() => onRemoveTag(tag.id)}
            >
              {tag.name}
            </button>
          ))}
          <select
            aria-label="Adicionar tag"
            className="h-6 rounded border border-border bg-background px-1 text-[10px]"
            value={tagID}
            onChange={(event) => onTagIDChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') void onAddTag()
            }}
          >
            <option value="">+ tag</option>
            {tags
              .filter((tag) => !selectedTags.some((current) => current.id === tag.id))
              .map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
          </select>
          {tagID ? (
            <Button size="sm" className="h-6 px-2 text-[10px]" onClick={onAddTag}>
              Adicionar
            </Button>
          ) : null}
        </div>
      </div>
      <Button variant="ghost" size="icon-sm" aria-label="Dados do contato">
        <UserRound className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Arquivar conversa">
        <Archive className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Mais opções">
        <MoreHorizontal className="size-4" />
      </Button>
    </div>
  )
}
