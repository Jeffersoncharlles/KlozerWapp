import { Bell, ChevronDown, Moon } from 'lucide-react'
import type { ReactNode } from 'react'

import { useWhatsAppStatus } from '../features/whatsapp/hooks/use-whatsapp-status'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { SidebarTrigger } from './ui/sidebar'

export function WorkspaceHeader({ title, description }: { title: string; description?: string }) {
  const { connected } = useWhatsAppStatus()

  return (
    <header className="flex min-h-16 items-center gap-3 border-b border-border bg-card px-4 sm:px-6">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mx-1 h-5" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        {description && (
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{description}</p>
        )}
      </div>
      <Button variant="outline" size="sm" className="inline-flex max-w-44">
        <span
          className={`size-2 shrink-0 rounded-full ${connected ? 'bg-emerald-400' : 'bg-muted-foreground/50'}`}
        />
        <span className="truncate">WhatsApp {connected ? 'conectado' : 'desconectado'}</span>
        <ChevronDown className="size-3.5" />
      </Button>
      <Button variant="ghost" size="icon-sm" className="hidden sm:inline-flex">
        <Bell className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" className="hidden sm:inline-flex">
        <Moon className="size-4" />
      </Button>
      <Avatar size="sm">
        <AvatarFallback>JC</AvatarFallback>
      </Avatar>
    </header>
  )
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="min-h-svh bg-background">{children}</div>
}

export function EmptyStateIcon({ children }: { children: ReactNode }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-400">
      {children}
    </div>
  )
}
