import { Card } from '../../../components/ui/card'
import { PageContainer, WorkspaceHeader } from '../../../components/workspace-header'
import { useConversations } from '../hooks/use-conversations'
import { ConversationComposer } from './conversation-composer'
import { ConversationHeader } from './conversation-header'
import { ConversationList } from './conversation-list'
import { ConversationThread } from './conversation-thread'

export function ConversationsContainer() {
  const conversations = useConversations()
  return (
    <PageContainer>
      <WorkspaceHeader
        title="Conversas"
        description="Central de atendimento e histórico de mensagens"
      />
      <main className="flex h-[calc(100svh-4rem)] min-h-[620px] flex-col overflow-hidden p-4 sm:p-6 lg:flex-row">
        <ConversationList
          conversations={conversations.conversations}
          visible={conversations.visible}
          selectedID={conversations.selectedID}
          loading={conversations.loading}
          search={conversations.search}
          onSearchChange={conversations.setSearch}
          onSelect={conversations.setSelectedID}
        />
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-none border-border/70 bg-card/50 lg:rounded-l-none lg:rounded-tr-xl">
          {conversations.selected ? (
            <>
              <ConversationHeader
                conversation={conversations.selected}
                tags={conversations.tags}
                tagID={conversations.tagID}
                onTagIDChange={conversations.setTagID}
                onAddTag={conversations.addTag}
                onRemoveTag={conversations.removeTag}
              />
              {conversations.error ? (
                <div
                  role="alert"
                  className="border-b border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  {conversations.error}
                </div>
              ) : null}
              <ConversationThread messages={conversations.messages} />
              <ConversationComposer
                draft={conversations.draft}
                sending={conversations.sending}
                onDraftChange={conversations.setDraft}
                onSend={() => void conversations.send()}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
              Selecione uma conversa para começar.
            </div>
          )}
        </Card>
      </main>
    </PageContainer>
  )
}
