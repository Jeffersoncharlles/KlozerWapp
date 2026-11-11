import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  MessageCircle,
  MoreHorizontal,
  Phone,
  UsersRound,
  Wifi,
  Zap,
} from "lucide-react";
import { Link, useNavigation } from "react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "../../../components/ui/avatar";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Skeleton } from "../../../components/ui/skeleton";
import type { DashboardLoaderData, DashboardMetrics } from "../types";

const statCards = [
  {
    key: "total_contacts",
    label: "Conversas abertas",
    icon: UsersRound,
    color: "text-primary",
    bg: "bg-accent",
  },
  {
    key: "total_messages",
    label: "Mensagens hoje",
    icon: MessageCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    key: "total_cards",
    label: "Atendimentos",
    icon: Activity,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    key: "active_workflows",
    label: "Automações ativas",
    icon: Zap,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
  },
] as const;

const chartHeights = [42, 58, 45, 70, 62, 86, 74, 92, 68, 78, 64, 88];
const chartLabels = [
  "S",
  "T",
  "Q",
  "Q",
  "S",
  "S",
  "D",
  "S",
  "T",
  "Q",
  "Q",
  "S",
];
const recentConversations = [
  [
    "Mariana Costa",
    "Olá, gostaria de saber mais sobre o plano...",
    "Agora",
    "MC",
  ],
  ["Rafael Oliveira", "Obrigado pelo atendimento, até logo!", "12 min", "RO"],
  [
    "Camila Ferreira",
    "Preciso atualizar meus dados de contato.",
    "28 min",
    "CF",
  ],
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function isConnected(status?: string) {
  return status === "connected" || status === "open" || status === "online";
}

export function DashboardOverview({ data }: { data: DashboardLoaderData }) {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const connected = isConnected(data.whatsappStatus);

  return (
    <main className="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6 lg:px-7 lg:py-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-muted-foreground">
            Quarta-feira, 11 de novembro de 2026
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
            Visão geral
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Acompanhe sua operação em tempo real
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-border bg-card"
          render={<Link to="/dashboard/reports" />}
        >
          <BarChart3 className="size-4" />
          Ver relatórios
          <ArrowUpRight className="size-3.5" />
        </Button>
      </div>

      {data.error && (
        <div
          className="flex items-start gap-3 rounded-lg border border-amber-500/25 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300"
          role="alert"
        >
          <Clock3 className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-medium">
              Alguns dados não puderam ser carregados
            </p>
            <p className="mt-1 text-amber-700/70 dark:text-amber-300/70">
              {data.error}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(({ key, label, icon: Icon, color, bg }) => (
          <Card
            key={key}
            className="rounded-lg border-border bg-card shadow-none"
          >
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {label}
                </p>
                {isLoading ? (
                  <Skeleton className="mt-2 h-7 w-20" />
                ) : (
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {data.metrics
                      ? formatNumber(
                          data.metrics[key as keyof DashboardMetrics],
                        )
                      : "—"}
                  </p>
                )}
                <p className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="size-3" /> Operação em andamento
                </p>
              </div>
              <div
                className={`flex size-9 items-center justify-center rounded-lg ${bg} ${color}`}
              >
                <Icon className="size-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">
        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Volume de conversas</CardTitle>
              <CardDescription>
                Mensagens e atendimentos nos últimos dias.
              </CardDescription>
            </div>
            <Button
              aria-label="Mais opções de volume"
              variant="ghost"
              size="icon-sm"
            >
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
                  <span className="text-[10px] text-muted-foreground">
                    {chartLabels[index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardHeader className="pb-3">
            <CardTitle>Conexão WhatsApp</CardTitle>
            <CardDescription>Status da sessão principal.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`flex items-center gap-3 rounded-lg border p-4 ${connected ? "border-emerald-500/20 bg-emerald-500/10" : "border-amber-500/20 bg-amber-500/10"}`}
            >
              <div
                className={`flex size-9 items-center justify-center rounded-full ${connected ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}
              >
                <Wifi className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {connected
                    ? "Conectado e funcionando"
                    : "Conexão indisponível"}
                </p>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {data.whatsappStatus ?? "Status não informado"}
                </p>
              </div>
              <span
                className={`size-2 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500"}`}
              />
            </div>
            <Button
              className="mt-4 w-full"
              variant="outline"
              render={<Link to="/dashboard/whatsapp" />}
            >
              Gerenciar conexão
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_350px]">
        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle>Conversas recentes</CardTitle>
              <CardDescription>Últimas interações da equipe.</CardDescription>
            </div>
            <Button
              variant="link"
              size="sm"
              render={<Link to="/dashboard/conversations" />}
            >
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
                  <p className="truncate text-xs text-muted-foreground">
                    {message}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground">
                  {time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border bg-card shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle>Equipe online</CardTitle>
              <CardDescription>Atendentes disponíveis agora.</CardDescription>
            </div>
            <Button
              aria-label="Mais opções da equipe"
              variant="ghost"
              size="icon-sm"
            >
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
                  <AvatarFallback className="bg-primary/15 text-primary">
                    AS
                  </AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback className="bg-violet-500/15 text-violet-600 dark:text-violet-400">
                    MS
                  </AvatarFallback>
                </Avatar>
                <AvatarGroupCount>+4</AvatarGroupCount>
              </AvatarGroup>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-emerald-500" /> 7 online
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                render={<Link to="/dashboard/queues" />}
              >
                <UsersRound className="size-4" /> Ver filas
              </Button>
              <Button variant="outline" render={<Link to="/dashboard/calls" />}>
                <Phone className="size-4" /> Chamadas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
