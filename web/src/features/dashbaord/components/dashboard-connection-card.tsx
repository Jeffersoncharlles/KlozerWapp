import { ArrowUpRight, Wifi } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { isConnected } from '../utils/dashboard'

export function DashboardConnectionCard({ status }: { status?: string }) {
  const connected = isConnected(status)
  return (
    <Card className="rounded-lg border-border bg-card shadow-none">
      <CardHeader className="pb-3">
        <CardTitle>Conexão WhatsApp</CardTitle>
        <CardDescription>Status da sessão principal.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          data-status={connected ? 'connected' : 'disconnected'}
          className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 data-[status=connected]:border-emerald-500/20 data-[status=connected]:bg-emerald-500/10"
        >
          <div
            data-status={connected ? 'connected' : 'disconnected'}
            className="flex size-9 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 data-[status=connected]:bg-emerald-500/15 data-[status=connected]:text-emerald-600 dark:data-[status=connected]:text-emerald-400"
          >
            <Wifi className="size-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {connected ? 'Conectado e funcionando' : 'Conexão indisponível'}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {status ?? 'Status não informado'}
            </p>
          </div>
          <span
            data-status={connected ? 'connected' : 'disconnected'}
            className="size-2 rounded-full bg-amber-500 data-[status=connected]:bg-emerald-500"
          />
        </div>
        <Button
          className="mt-4 w-full"
          variant="outline"
          render={<Link to="/dashboard/whatsapp" />}
        >
          Gerenciar conexão
          <ArrowUpRight className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  )
}
