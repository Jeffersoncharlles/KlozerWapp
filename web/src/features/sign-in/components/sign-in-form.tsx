import { ArrowRight, Eye, LockKeyhole, Mail } from 'lucide-react'
import { Form, useActionData, useNavigation } from 'react-router'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Field, FieldError, FieldGroup, FieldLabel } from '../../../components/ui/field'
import { Input } from '../../../components/ui/input'
import type { SignInActionData } from '../types'

export function SignInForm() {
  const actionData = useActionData<SignInActionData>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <Card className="w-full max-w-[27.5rem] gap-6 border-border bg-card py-9 shadow-xl shadow-slate-950/10">
      <CardHeader className="gap-2 px-9">
        <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
        <p className="text-sm text-muted-foreground">
          Entre para continuar no seu espaço de trabalho.
        </p>
      </CardHeader>
      <CardContent className="px-9">
        <Form className="space-y-6" method="post">
          <FieldGroup>
            <Field data-invalid={Boolean(actionData?.fieldErrors?.email)}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="voce@empresa.com"
                  aria-invalid={Boolean(actionData?.fieldErrors?.email)}
                  aria-describedby="email-error"
                  className="h-11 bg-muted/50 pl-10"
                />
              </div>
              {actionData?.fieldErrors?.email?.[0] && (
                <FieldError id="email-error">{actionData.fieldErrors.email[0]}</FieldError>
              )}
            </Field>

            <Field data-invalid={Boolean(actionData?.fieldErrors?.password)}>
              <div className="flex items-center justify-between gap-4">
                <FieldLabel htmlFor="password">Senha</FieldLabel>
                <a
                  className="text-xs font-semibold text-primary hover:underline"
                  href="#recuperar-senha"
                >
                  Esqueci minha senha
                </a>
              </div>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Digite sua senha"
                  aria-invalid={Boolean(actionData?.fieldErrors?.password)}
                  aria-describedby="password-error"
                  className="h-11 bg-muted/50 pl-10 pr-10"
                />
                <Eye className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              {actionData?.fieldErrors?.password?.[0] && (
                <FieldError id="password-error">{actionData.fieldErrors.password[0]}</FieldError>
              )}
            </Field>
          </FieldGroup>

          {actionData?.error && (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {actionData.error}
            </p>
          )}

          <Button className="h-11 w-full font-semibold" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Entrando...' : 'Entrar na plataforma'}
            {!isSubmitting && <ArrowRight className="size-4" />}
          </Button>
        </Form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ainda não tem acesso? Solicite um convite ao administrador.
        </p>
      </CardContent>
    </Card>
  )
}
