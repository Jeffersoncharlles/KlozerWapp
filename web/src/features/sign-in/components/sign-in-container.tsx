import { CircleHelp, ShieldCheck } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { SignInForm } from './sign-in-form'
import { SignInShowcase } from './sign-in-showcase'

export function SignInContainer() {
  return (
    <main className="grid min-h-svh bg-background lg:grid-cols-[minmax(0,1.08fr)_minmax(36rem,0.92fr)]">
      <SignInShowcase />
      <section className="flex min-h-svh flex-col bg-background px-5 py-6 sm:px-10 lg:px-16">
        <div className="flex h-9 items-center justify-between lg:justify-end lg:gap-3">
          <span className="text-sm font-semibold text-primary lg:hidden">KlozerWapp</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">Precisa de ajuda?</span>
          <Button className="gap-2" size="sm" variant="outline">
            <CircleHelp className="size-3.5" />
            Suporte
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <SignInForm />
        </div>
        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Ambiente seguro e protegido
        </p>
      </section>
    </main>
  )
}
