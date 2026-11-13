import { useState, type FormEvent } from 'react'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { contactInputSchema, type Contact, type ContactInput } from '../domain/contact'

export function ContactForm({
  contact,
  busy,
  onCancel,
  onSubmit,
}: {
  contact?: Contact
  busy: boolean
  onCancel: () => void
  onSubmit: (value: ContactInput) => void
}) {
  const [name, setName] = useState(contact?.name ?? '')
  const [phone, setPhone] = useState(contact?.phone ?? '')
  const [type, setType] = useState<ContactInput['type']>(contact?.type ?? 'person')
  const [error, setError] = useState('')
  function submit(event: FormEvent) {
    event.preventDefault()
    const parsed = contactInputSchema.safeParse({ name, phone, type })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Confira os dados.')
      return
    }
    setError('')
    onSubmit(parsed.data)
  }
  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader>
        <CardTitle>{contact ? 'Editar contato' : 'Novo contato'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-3" onSubmit={submit}>
          <label className="space-y-1.5 text-sm font-medium">
            Nome
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Telefone ou JID
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            Tipo
            <select
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={type}
              onChange={(event) => setType(event.target.value as ContactInput['type'])}
            >
              <option value="person">Pessoa</option>
              <option value="group">Grupo</option>
            </select>
          </label>
          {error ? (
            <p className="sm:col-span-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex gap-2 sm:col-span-3">
            <Button type="submit" disabled={busy}>
              {contact ? 'Salvar alterações' : 'Criar contato'}
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
