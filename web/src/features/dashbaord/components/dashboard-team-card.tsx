import { CheckCircle2, MoreHorizontal, Phone, UsersRound } from 'lucide-react'
import { Link } from 'react-router'

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '../../../components/ui/avatar'
import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'

export function DashboardTeamCard() {
  return (
    <Card className="rounded-lg border-border bg-card shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle>Equipe online</CardTitle>
          <CardDescription>Atendentes disponíveis agora.</CardDescription>
        </div>
        <Button aria-label="Mais opções da equipe" variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg bg-secondary p-4">
          <AvatarGroup>
            <Avatar>
              <AvatarFallback className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                JC
              </AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-primary/15 text-primary">AS</AvatarFallback>
            </Avatar>
            <Avatar>
              <AvatarFallback className="bg-violet-500/15 text-violet-600 dark:text-violet-400">
                MS
              </AvatarFallback>
            </Avatar>
            <AvatarGroupCount>+4</AvatarGroupCount>
          </AvatarGroup>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-emerald-500" />7 online
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="outline" render={<Link to="/dashboard/queues" />}>
            <UsersRound className="size-4" />
            Ver filas
          </Button>
          <Button variant="outline" render={<Link to="/dashboard/calls" />}>
            <Phone className="size-4" />
            Chamadas
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
