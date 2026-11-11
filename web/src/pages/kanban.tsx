import { Clock3, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { PageContainer, WorkspaceHeader } from "../components/workspace-header";

const columns = [
  { title: "A fazer", color: "bg-slate-400", cards: [{ name: "Mariana Costa", text: "Enviar proposta comercial", tag: "Vendas" }, { name: "João Martins", text: "Retornar ligação", tag: "Suporte" }] },
  { title: "Em andamento", color: "bg-sky-400", cards: [{ name: "Camila Ferreira", text: "Atualizar cadastro", tag: "Atendimento" }] },
  { title: "Concluído", color: "bg-emerald-400", cards: [{ name: "Rafael Oliveira", text: "Dúvida sobre cobrança", tag: "Resolvido" }] },
  { title: "Aguardando", color: "bg-amber-400", cards: [] },
];

export const Kanban = () => (
  <PageContainer>
    <WorkspaceHeader title="Kanban" description="Organize e acompanhe os atendimentos da equipe" />
    <main className="space-y-5 overflow-auto p-4 sm:p-6">
      <div className="flex min-w-[920px] items-center gap-2 border-b border-border/70 pb-4"><Button className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400">Atendimento</Button><Button variant="outline">Vendas</Button><Button variant="outline">Suporte</Button><Button variant="outline"><Plus className="size-4" /> Novo board</Button><Button variant="ghost" className="ml-auto text-destructive"><Trash2 className="size-4" /> Remover board</Button></div>
      <div className="flex min-w-[920px] items-center justify-between"><div><h1 className="text-2xl font-semibold">Pipeline de atendimento</h1><p className="text-sm text-muted-foreground">Mova os cards conforme o progresso de cada conversa.</p></div><div className="relative w-64"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-9 pl-9" placeholder="Buscar card..." /></div></div>
      <div className="grid min-w-[920px] grid-cols-4 gap-4">{columns.map((column) => <Card key={column.title} className="min-h-[460px] border-border/70 bg-card/60"><CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-border/50 px-4 py-3"><CardTitle className="flex items-center gap-2 text-sm"><span className={`size-2 rounded-full ${column.color}`} />{column.title}<span className="text-xs font-normal text-muted-foreground">{column.cards.length}</span></CardTitle><Button variant="ghost" size="icon-xs"><MoreHorizontal className="size-4" /></Button></CardHeader><CardContent className="space-y-3 p-3">{column.cards.map((card) => <div key={card.name} className="rounded-xl border border-border/70 bg-background/70 p-3 shadow-sm"><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium">{card.text}</p><MoreHorizontal className="size-4 shrink-0 text-muted-foreground" /></div><p className="mt-3 text-xs text-muted-foreground">{card.name}</p><div className="mt-3 flex items-center justify-between"><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300">{card.tag}</span><span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock3 className="size-3" /> Hoje</span></div></div>)}<Button variant="ghost" className="w-full justify-start text-muted-foreground"><Plus className="size-4" /> Novo card</Button></CardContent></Card>)}</div>
    </main>
  </PageContainer>
);
