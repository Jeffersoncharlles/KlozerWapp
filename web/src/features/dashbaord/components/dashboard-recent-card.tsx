import { Link } from 'react-router'

import { Avatar, AvatarFallback } from '../../../components/ui/avatar'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { recentConversations } from '../utils/dashboard'

export function DashboardRecentCard() {
  return (
    <Card className="rounded-lg border-border bg-card shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle>Conversas recentes</CardTitle>
          <CardDescription>Últimas interações da equipe.</CardDescription>
        </div>
        <Button variant="link" size="sm" render={<Link to="/dashboard/conversations" />}>
          Ver todos
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentConversations.map(([name, message, time, initials]) => (
          <div key={name} className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{message}</p>
            </div>
            <span className="shrink-0 text-[11px] text-muted-foreground">{time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
