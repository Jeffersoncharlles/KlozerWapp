import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { useFetcher } from 'react-router'

import { Button } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { PageContainer, WorkspaceHeader } from '../../../components/workspace-header'
import type { UserInput } from '../domain/user'
import type { UserActionResult, UserLoaderData } from '../types'
import { UserForm } from './user-form'

export function UsersContainer({ data }: { data: UserLoaderData }) {
  const fetcher = useFetcher<UserActionResult>()
  const [editing, setEditing] = useState<string | 'new'>()
  const busy = fetcher.state !== 'idle'
  const selected =
    editing && editing !== 'new' ? data.users.find((user) => user.id === editing) : undefined

  function save(user: UserInput) {
    void fetcher.submit(JSON.stringify({ intent: 'save', id: selected?.id, user }), {
      method: 'post',
      encType: 'application/json',
    })
  }

  function toggle(id: string, isActive: boolean) {
    void fetcher.submit(JSON.stringify({ intent: 'status', id, isActive }), {
      method: 'post',
      encType: 'application/json',
    })
  }

  return (
    <PageContainer>
      <WorkspaceHeader
        title="Usuários"
        description="Gerencie acesso, papéis e atendentes do CRM."
      />
      <main className="space-y-5 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-2xl font-semibold">Usuários</h1>
            <p className="text-sm text-muted-foreground">
              Gerencie acesso, papéis e status da equipe.
            </p>
          </div>
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" /> Novo usuário
          </Button>
        </div>
        {fetcher.data?.error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
            {fetcher.data.error}
          </p>
        ) : null}
        {editing ? (
          <UserForm
            user={selected}
            busy={busy}
            onCancel={() => setEditing(undefined)}
            onSubmit={save}
          />
        ) : null}
        <Card className="overflow-hidden border-border bg-card shadow-none">
          <CardContent className="p-0">
            <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_140px_160px] gap-4 border-b bg-muted/40 px-4 py-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <span>Nome / E-mail</span>
              <span>Papel</span>
              <span>Status</span>
              <span className="text-right">Ações</span>
            </div>
            {data.users.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground">
                Nenhum usuário encontrado.
              </div>
            ) : (
              data.users.map((user) => (
                <div
                  className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_140px_160px] items-center gap-4 border-b px-4 py-3 last:border-0"
                  key={user.id}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{user.name}</p>
                    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="text-sm">
                    {user.role === 'ADMIN' ? 'Administrador' : 'Atendente'}
                  </span>
                  <span
                    className={
                      user.is_active ? 'text-sm text-emerald-600' : 'text-sm text-muted-foreground'
                    }
                  >
                    {user.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setEditing(user.id)}>
                      <Pencil className="size-3.5" /> Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggle(user.id, !user.is_active)}
                    >
                      {user.is_active ? 'Desativar' : 'Ativar'}
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
