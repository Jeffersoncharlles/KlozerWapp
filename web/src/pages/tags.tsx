import { Plus, Tags, Trash2 } from 'lucide-react'
import {
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from 'react-router'
import { z } from 'zod'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { PageContainer, WorkspaceHeader } from '../components/workspace-header'
import { createTag, deleteTag, loadTags } from '../features/tags/services/tag-service'
import { tagMutationSchema, type TagActionResult, type TagLoaderData } from '../features/tags/types'

export async function loader({ request }: LoaderFunctionArgs): Promise<TagLoaderData> {
  return { tags: await loadTags(request.signal) }
}

export async function action({ request }: ActionFunctionArgs): Promise<TagActionResult> {
  try {
    const payload = request.headers.get('content-type')?.includes('application/json')
      ? await request.json()
      : Object.fromEntries(await request.formData())
    const mutation = tagMutationSchema.parse(payload)
    if (mutation.intent === 'delete') {
      await deleteTag(mutation.id, request.signal)
      return { message: 'Tag excluída.' }
    }
    await createTag({ name: mutation.name, color: mutation.color }, request.signal)
    return { message: 'Tag criada.' }
  } catch (error) {
    return {
      error:
        error instanceof z.ZodError
          ? error.issues.map((issue) => issue.message).join(', ')
          : error instanceof Error
            ? error.message
            : 'Não foi possível atualizar as tags.',
    }
  }
}

export function TagsPage() {
  const { tags } = useLoaderData() as TagLoaderData
  const fetcher = useFetcher<TagActionResult>()
  const busy = fetcher.state !== 'idle'

  return (
    <PageContainer>
      <WorkspaceHeader title="Tags" description="Organize contatos e conversas por etiquetas" />
      <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-emerald-400 uppercase">
              Organização
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Gerencie suas tags</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Crie etiquetas para filtrar e acompanhar seus contatos.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="size-2 rounded-full bg-emerald-400" /> {tags.length}{' '}
            {tags.length === 1 ? 'tag criada' : 'tags criadas'}
          </div>
        </section>

        <Card className="border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-4 text-emerald-400" /> Nova tag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <fetcher.Form
              method="post"
              className="grid gap-4 sm:grid-cols-[1fr_auto_auto] sm:items-end"
            >
              <input type="hidden" name="intent" value="create" />
              <div className="space-y-2">
                <label htmlFor="tag-name" className="text-xs font-medium">
                  Nome
                </label>
                <Input id="tag-name" name="name" placeholder="Ex.: Cliente VIP" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="tag-color" className="text-xs font-medium">
                  Cor
                </label>
                <Input
                  id="tag-color"
                  name="color"
                  type="color"
                  defaultValue="#10b981"
                  className="h-9 w-16 cursor-pointer p-1"
                />
              </div>
              <Button type="submit" disabled={busy}>
                Criar tag
              </Button>
            </fetcher.Form>
            {fetcher.data?.error && (
              <p className="mt-3 text-sm text-destructive">{fetcher.data.error}</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="size-4 text-emerald-400" /> Tags cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 text-center">
                <Tags className="mb-3 size-8 text-muted-foreground/60" />
                <p className="text-sm font-medium">Nenhuma tag criada ainda</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Crie sua primeira tag para começar a organizar os contatos.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/40 p-3"
                  >
                    <span
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{tag.name}</span>
                    <fetcher.Form
                      method="post"
                      onSubmit={(event) => {
                        if (!window.confirm(`Excluir a tag ${tag.name}?`)) event.preventDefault()
                      }}
                    >
                      <input type="hidden" name="intent" value="delete" />
                      <input type="hidden" name="id" value={tag.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Excluir ${tag.name}`}
                        disabled={busy}
                      >
                        <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </fetcher.Form>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </PageContainer>
  )
}
