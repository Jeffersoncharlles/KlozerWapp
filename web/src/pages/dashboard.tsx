import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Plus,
  UsersRound,
  Wifi,
  Zap,
} from "lucide-react";
import { Link, redirect, useLoaderData, useNavigation } from "react-router";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { SidebarTrigger } from "../components/ui/sidebar";
import { API_BASE_URL } from "../core/constants/api";

type DashboardMetrics = {
  total_contacts: number;
  total_messages: number;
  total_cards: number;
  active_workflows: number;
};

type DashboardLoaderData = {
  metrics?: DashboardMetrics;
  whatsappStatus?: string;
  error?: string;
};

async function getApiData<T>(path: string, token: string): Promise<T> {
  const response = await fetch(path, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Não foi possível carregar ${path}.`);
  }

  return (await response.json()) as T;
}

export async function loader() {
  const token = localStorage.getItem("klozer_token");
  if (!token) {
    throw redirect("/");
  }

  const [metricsResult, sessionResult] = await Promise.allSettled([
    getApiData<DashboardMetrics>(`${API_BASE_URL}/reports/dashboard`, token),
    getApiData<{ status: string }>(`${API_BASE_URL}/sessions/status`, token),
  ]);
  const errors = [metricsResult, sessionResult]
    .filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    )
    .map((result) =>
      result.reason instanceof Error
        ? result.reason.message
        : "Uma integração não respondeu.",
    );

  return {
    metrics:
      metricsResult.status === "fulfilled" ? metricsResult.value : undefined,
    whatsappStatus:
      sessionResult.status === "fulfilled"
        ? sessionResult.value.status
        : undefined,
    error: errors.length > 0 ? errors.join(" ") : undefined,
  } satisfies DashboardLoaderData;
}

const statCards = [
  {
    key: "total_contacts",
    label: "Contatos",
    icon: UsersRound,
    color: "text-sky-400",
    bg: "bg-sky-400/10",
  },
  {
    key: "total_messages",
    label: "Mensagens",
    icon: MessageCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
  },
  {
    key: "total_cards",
    label: "Atendimentos",
    icon: Activity,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
  },
  {
    key: "active_workflows",
    label: "Automações ativas",
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
  },
] as const;

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function isConnected(status?: string) {
  return status === "connected" || status === "open" || status === "online";
}

export const Dashboard = () => {
  const data = useLoaderData() as DashboardLoaderData;
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  const connected = isConnected(data.whatsappStatus);

  return (
    <div className="min-h-svh bg-background">
      <header className="flex h-16 items-center gap-3 border-b border-border/70 px-4 sm:px-6">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-1 h-5" />
        <div className="flex-1">
          <p className="text-sm font-medium">Visão geral</p>
          <p className="hidden text-xs text-muted-foreground sm:block">
            Acompanhe sua operação em tempo real
          </p>
        </div>
        <Button
          size="sm"
          className="hidden bg-emerald-500 text-emerald-950 hover:bg-emerald-400 sm:inline-flex"
          render={<Link to="/dashboard/conversations" />}
        >
          <Plus className="size-4" />
          Novo atendimento
        </Button>
        <Avatar size="sm">
          <AvatarFallback>JC</AvatarFallback>
        </Avatar>
      </header>

      <main className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm text-muted-foreground">
              Quarta-feira, 11 de novembro de 2026
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Bom dia, Jefferson <span aria-hidden="true">👋</span>
            </h1>
          </div>
          <Button variant="outline" size="sm" render={<Link to="/dashboard/reports" />}>
            <BarChart3 className="size-4" />
            Ver relatórios
            <ArrowUpRight className="size-3.5" />
          </Button>
        </div>

        {data.error && (
          <div
            className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-sm text-amber-200"
            role="alert"
          >
            <Clock3 className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">
                Alguns dados não puderam ser carregados
              </p>
              <p className="mt-1 text-amber-200/70">{data.error}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map(({ key, label, icon: Icon, color, bg }) => (
            <Card key={key} className="border-border/70 bg-card/70">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  {isLoading ? (
                    <Skeleton className="mt-2 h-8 w-20" />
                  ) : (
                    <p className="mt-2 text-3xl font-semibold tracking-tight">
                      {data.metrics ? formatNumber(data.metrics[key]) : "—"}
                    </p>
                  )}
                  <p className="mt-2 flex items-center gap-1 text-xs text-emerald-400">
                    <ArrowUpRight className="size-3" /> Operação em andamento
                  </p>
                </div>
                <div
                  className={`flex size-10 items-center justify-center rounded-xl ${bg} ${color}`}
                >
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
          <Card className="border-border/70 bg-card/70">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>Atividade da operação</CardTitle>
                <CardDescription>
                  Volume de mensagens e atendimentos nos últimos dias.
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex h-56 items-end gap-2 pt-6 sm:gap-4">
                {[42, 58, 45, 70, 62, 86, 74, 92, 68, 78, 64, 88].map(
                  (height, index) => (
                    <div
                      key={index}
                      className="group flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="relative w-full max-w-8 rounded-t-md bg-emerald-500/80 transition-colors group-hover:bg-emerald-400"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {
                          [
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
                          ][index]
                        }
                      </span>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/70">
            <CardHeader>
              <CardTitle>Conexão WhatsApp</CardTitle>
              <CardDescription>Status da sessão principal.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`flex items-center gap-3 rounded-xl border p-4 ${connected ? "border-emerald-400/20 bg-emerald-400/10" : "border-amber-400/20 bg-amber-400/10"}`}
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-full ${connected ? "bg-emerald-400/15 text-emerald-400" : "bg-amber-400/15 text-amber-400"}`}
                >
                  <Wifi className="size-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {connected
                      ? "Conectado e funcionando"
                      : "Conexão indisponível"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data.whatsappStatus ?? "Status não informado"}
                  </p>
                </div>
                <span
                  className={`size-2 rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`}
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

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/70 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Atendimentos recentes</CardTitle>
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
              {[
                [
                  "Mariana Costa",
                  "Olá, gostaria de saber mais sobre o plano...",
                  "Agora",
                  "MC",
                ],
                [
                  "Rafael Oliveira",
                  "Obrigado pelo atendimento, até logo!",
                  "12 min",
                  "RO",
                ],
                [
                  "Camila Ferreira",
                  "Preciso atualizar meus dados de contato.",
                  "28 min",
                  "CF",
                ],
              ].map(([name, message, time, initials]) => (
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

          <Card className="border-border/70 bg-card/70">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Equipe online</CardTitle>
                <CardDescription>Atendentes disponíveis agora.</CardDescription>
              </div>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-xl bg-muted/40 p-4">
                <AvatarGroup>
                  <Avatar>
                    <AvatarFallback className="bg-emerald-400/15 text-emerald-400">
                      JC
                    </AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback className="bg-sky-400/15 text-sky-400">
                      AS
                    </AvatarFallback>
                  </Avatar>
                  <Avatar>
                    <AvatarFallback className="bg-violet-400/15 text-violet-400">
                      MS
                    </AvatarFallback>
                  </Avatar>
                  <AvatarGroupCount>+4</AvatarGroupCount>
                </AvatarGroup>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-emerald-400" /> 7 online
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="outline" render={<Link to="/dashboard/queues" />}>
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
    </div>
  );
};
