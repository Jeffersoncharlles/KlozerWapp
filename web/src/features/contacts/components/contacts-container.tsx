import { Archive, Pencil, Plus, RotateCcw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useFetcher } from 'react-router'

import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { PageContainer, WorkspaceHeader } from '../../../components/workspace-header'
import type { Contact, ContactInput } from '../domain/contact'
import type { ContactActionResult, ContactLoaderData } from '../types'
import { ContactForm } from './contact-form'

export function ContactsContainer({ data }: { data: ContactLoaderData }) {
  const fetcher = useFetcher<ContactActionResult>()
  const [editing, setEditing] = useState<string | 'new'>()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [showArchived, setShowArchived] = useState(false)
  const selected =
    editing && editing !== 'new'
      ? data.contacts.items.find((contact) => contact.id === editing)
      : undefined
  const visible = useMemo(
    () =>
      data.contacts.items.filter((contact) => {
        const query = search.trim().toLowerCase()
        return (
          (!query ||
            contact.name.toLowerCase().includes(query) ||
            contact.phone.toLowerCase().includes(query)) &&
          (type === 'all' || contact.type === type) &&
          (showArchived || !contact.archived_at)
        )
      }),
    [data.contacts.items, search, showArchived, type],
  )
  const busy = fetcher.state !== 'idle'
  function save(contact: ContactInput) {
    void fetcher.submit(JSON.stringify({ intent: 'save', id: selected?.id, contact }), {
      method: 'post',
      encType: 'application/json',
    })
  }
  function archive(contact: Contact) {
    void fetcher.submit(
      JSON.stringify({ intent: 'archive', id: contact.id, archived: !contact.archived_at }),
      { method: 'post', encType: 'application/json' },
    )
  }
  return (
    <PageContainer>
      <WorkspaceHeader
        title="Contatos"
        description="Gerencie pessoas e grupos disponíveis para atendimento e transmissões."
      />
      <main className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold">Contatos</h1>
            <p className="text-sm text-muted-foreground">
              {data.contacts.total} contatos · {data.contacts.people} pessoas ·{' '}
              {data.contacts.groups} grupos
            </p>
          </div>
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" /> Novo contato
          </Button>
        </div>
        {fetcher.data?.error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {fetcher.data.error}
          </p>
        ) : null}
        {editing ? (
          <ContactForm
            contact={selected}
            busy={busy}
            onCancel={() => setEditing(undefined)}
            onSubmit={save}
          />
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, telefone ou JID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <select
            className="h-8 rounded-lg border border-input bg-transparent px-3 text-sm"
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="all">Todos</option>
            <option value="person">Pessoas</option>
            <option value="group">Grupos</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(event) => setShowArchived(event.target.checked)}
            />{' '}
            Arquivados
          </label>
        </div>
        <Card className="overflow-hidden border-border bg-card shadow-none">
          <CardContent className="p-0">
            <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_120px_120px] gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Contato</span>
              <span>Telefone</span>
              <span>Tipo</span>
              <span className="text-right">Ações</span>
            </div>
            {visible.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
                Nenhum contato encontrado.
              </div>
            ) : (
              visible.map((contact) => (
                <div
                  className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_120px_120px] items-center gap-4 border-b px-4 py-3 last:border-0"
                  key={contact.id}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{contact.name || 'Sem nome'}</p>
                    {contact.archived_at ? (
                      <span className="text-xs text-muted-foreground">Arquivado</span>
                    ) : null}
                  </div>
                  <span className="truncate text-sm text-muted-foreground">{contact.phone}</span>
                  <span className="text-sm">{contact.type === 'group' ? 'Grupo' : 'Pessoa'}</span>
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditing(contact.id)}>
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => archive(contact)}
                      title={contact.archived_at ? 'Restaurar' : 'Arquivar'}
                    >
                      {contact.archived_at ? (
                        <RotateCcw className="size-3.5" />
                      ) : (
                        <Archive className="size-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </PageContainer>
  )
}
