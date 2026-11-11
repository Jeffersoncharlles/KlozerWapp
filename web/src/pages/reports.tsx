import { Calendar, CheckCircle2, Clock3, MessageCircle, Phone, Settings2, TrendingUp, UsersRound } from "lucide-react";
import type { ComponentProps } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { PageContainer, WorkspaceHeader } from "../components/workspace-header";

const cards = [
  { label: "Mensagens", value: "17", icon: MessageCircle, color: "text-sky-400", bg: "bg-sky-400/10" },
  { label: "Recebidas", value: "4", icon: Phone, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { label: "Enviadas", value: "13", icon: SendIcon, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { label: "Em aberto", value: "1", icon: UsersRound, color: "text-amber-400", bg: "bg-amber-400/10" },
  { label: "Aguardando", value: "1", icon: Clock3, color: "text-violet-400", bg: "bg-violet-400/10" },
  { label: "Finalizados", value: "1", icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10" },
];

function SendIcon(props: ComponentProps<typeof MessageCircle>) { return <MessageCircle {...props} />; }

export const Reports = () => (
  <PageContainer>
    <WorkspaceHeader title="Relatórios" description="Chamadas e atendimentos no período selecionado" />
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-widest text-muted-foreground">Dashboard</p><h1 className="mt-1 text-2xl font-semibold">Indicadores da operação</h1></div><div className="flex gap-2"><Button variant="outline" size="sm">Todas as conexões</Button><Button variant="outline" size="sm"><Calendar className="size-4" /> Últimos 30 dias</Button><Button variant="ghost" size="icon-sm"><Settings2 className="size-4" /></Button></div></div>
      <section><p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Atendimentos no chat</p><div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">{cards.map(({ label, value, icon: Icon, color, bg }) => <Card key={label} className="border-border/70 bg-card/70"><CardContent className="p-4"><div className={`flex size-8 items-center justify-center rounded-lg ${bg} ${color}`}><Icon className="size-4" /></div><p className="mt-4 text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></CardContent></Card>)}</div></section>
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.7fr]"><Card className="border-border/70 bg-card/70"><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><TrendingUp className="size-4 text-emerald-400" /> Mensagens por dia</CardTitle><p className="text-xs text-muted-foreground">Recebidas e enviadas no período</p></CardHeader><CardContent><div className="flex h-64 items-end gap-2 border-b border-border/70 px-2 pt-5">{[4, 8, 6, 12, 9, 17, 7].map((value, index) => <div key={index} className="flex flex-1 items-end justify-center gap-1"><div className="w-5 rounded-t bg-emerald-500/80" style={{ height: `${value * 10}px` }} /><div className="w-5 rounded-t bg-sky-400/70" style={{ height: `${value * 5}px` }} /></div>)}</div><div className="mt-3 flex justify-center gap-5 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-emerald-500" /> Enviadas</span><span className="flex items-center gap-2"><i className="size-2 rounded-full bg-sky-400" /> Recebidas</span></div></CardContent></Card><Card className="border-border/70 bg-card/70"><CardHeader><CardTitle className="text-sm">Tickets por status</CardTitle><p className="text-xs text-muted-foreground">Snapshot atual</p></CardHeader><CardContent><div className="mx-auto mt-4 flex size-40 items-center justify-center rounded-full" style={{ background: "conic-gradient(#f59e0b 0 25%, #10b981 25% 60%, #8b5cf6 60% 100%)" }}><div className="flex size-24 items-center justify-center rounded-full bg-card text-xl font-semibold">3</div></div><div className="mt-5 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground"><span><i className="mx-auto mb-1 block size-2 rounded-full bg-violet-500" />Aguardando</span><span><i className="mx-auto mb-1 block size-2 rounded-full bg-amber-500" />Em aberto</span><span><i className="mx-auto mb-1 block size-2 rounded-full bg-emerald-500" />Finalizados</span></div></CardContent></Card></div>
      <Card className="border-border/70 bg-card/70"><CardHeader><CardTitle className="flex items-center gap-2 text-sm"><CheckCircle2 className="size-4 text-emerald-400" /> SLA por fila e conexão</CardTitle></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-3">{[["Atendimentos", "1"], ["1ª resposta média", "32s"], ["Resolução média", "2m 1s"], ["Resolvidos", "1"], ["Fora do SLA", "0"], ["Cumprimento", "100%"]].map(([label, value]) => <div key={label} className="rounded-lg border border-border/70 bg-background/50 p-3"><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-2 font-semibold">{value}</p></div>)}</div></CardContent></Card>
    </main>
  </PageContainer>
);
