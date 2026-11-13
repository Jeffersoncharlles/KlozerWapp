import { useState, type FormEvent } from 'react'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { userInputSchema, type User, type UserInput } from '../domain/user'

export function UserForm({
  user,
  busy,
  onCancel,
  onSubmit,
}: {
  user?: User
  busy: boolean
  onCancel: () => void
  onSubmit: (value: UserInput) => void
}) {
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<UserInput['role']>(user?.role ?? 'ATTENDANT')
  const [error, setError] = useState('')

  function submit(event: FormEvent) {
    event.preventDefault()
    const parsed = userInputSchema.safeParse({ name, email, password: password || undefined, role })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Confira os dados.')
      return
    }
    if (!user && !password) {
      setError('Senha é obrigatória para novos usuários.')
      return
    }
    setError('')
    onSubmit(parsed.data)
  }

  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader>
        <CardTitle>{user ? 'Editar usuário' : 'Novo usuário'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
          <label className="space-y-1.5 text-sm font-medium">
            Nome
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            E-mail
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Senha
            <Input
              type="password"
              placeholder={user ? 'Deixe vazio para manter' : ''}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Papel
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={role}
              onChange={(event) => setRole(event.target.value as UserInput['role'])}
            >
              <option value="ATTENDANT">Atendente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </label>
          {error ? (
            <p className="sm:col-span-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" disabled={busy}>
              {user ? 'Salvar alterações' : 'Criar usuário'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
