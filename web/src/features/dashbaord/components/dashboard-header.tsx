import { Bell, Moon, Plus, Search, Sun } from 'lucide-react'
import { Link } from 'react-router'

import { Avatar, AvatarFallback } from '../../../components/ui/avatar'
import { Button } from '../../../components/ui/button'
import { SidebarTrigger } from '../../../components/ui/sidebar'
import { useTheme } from '../../../core/theme/theme-provider'

export function DashboardHeader() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex h-[72px] items-center gap-3 border-b border-border bg-card px-4 sm:px-7">
      <SidebarTrigger className="md:hidden" />
      <div className="hidden h-9 w-full max-w-[420px] items-center gap-2 rounded-md bg-secondary px-3 text-xs text-muted-foreground md:flex">
        <Search className="size-4" />
        Buscar contato, telefone ou conversa...
      </div>
      <div className="flex-1" />
      <div className="hidden items-center gap-2 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 sm:flex">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Operação online
      </div>
      <Button
        aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
        variant="ghost"
        size="icon-sm"
        className="bg-secondary"
        onClick={toggleTheme}
      >
        {theme === 'light' ? (
          <Moon className="size-4 text-muted-foreground" />
        ) : (
          <Sun className="size-4 text-muted-foreground" />
        )}
      </Button>
      <Button
        aria-label="Notificações"
        variant="ghost"
        size="icon-sm"
        className="hidden bg-secondary sm:inline-flex"
      >
        <Bell className="size-4 text-muted-foreground" />
      </Button>
      <Button
        size="sm"
        className="hidden bg-primary text-primary-foreground hover:bg-primary/90 lg:inline-flex"
        render={<Link to="/dashboard/conversations" />}
      >
        <Plus className="size-4" />
        Novo atendimento
      </Button>
      <Avatar size="sm">
        <AvatarFallback>JC</AvatarFallback>
      </Avatar>
    </header>
  )
}
