import { MoreHorizontal } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'
import { chartHeights, chartLabels } from '../utils/dashboard'

export function DashboardVolumeCard() {
  return (
    <Card className="rounded-lg border-border bg-card shadow-none">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Volume de conversas</CardTitle>
          <CardDescription>Mensagens e atendimentos nos últimos dias.</CardDescription>
        </div>
        <Button aria-label="Mais opções de volume" variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex h-48 items-end gap-2 pt-5 sm:gap-4">
          {chartHeights.map((height, index) => (
            <div
              key={chartLabels[index] + height}
              className="group flex flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-36 w-full max-w-9 items-end gap-0.5">
                <div
                  className="w-1/2 rounded-t-sm bg-primary/90"
                  style={{ height: `${height}%` }}
                />
                <div
                  className="w-1/2 rounded-t-sm bg-emerald-500/90"
                  style={{ height: `${Math.max(height - 18, 20)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{chartLabels[index]}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
