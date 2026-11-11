import { ArrowLeft, CircleHelp, GitBranch, MessageSquareText, MoreHorizontal, Save, Variable, Webhook, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { PageContainer, WorkspaceHeader } from "../components/workspace-header";

const steps = [
  { title: "Texto", description: "Envie uma mensagem de texto simples", icon: MessageSquareText, tone: "text-emerald-400" },
  { title: "Mensagem interativa", description: "Botões nativos do WhatsApp", icon: Zap, tone: "text-sky-400" },
  { title: "Condição", description: "Separe caminhos do fluxo", icon: GitBranch, tone: "text-violet-400" },
  { title: "Intervalo", description: "Espere alguns segundos antes de continuar", icon: CircleHelp, tone: "text-amber-400" },
  { title: "Variável", description: "Guarde um valor para usar depois", icon: Variable, tone: "text-pink-400" },
  { title: "Requisição HTTP", description: "Chame uma API e aguarde a resposta", icon: Webhook, tone: "text-slate-300" },
];

export const Automations = () => (
  <PageContainer>
    <WorkspaceHeader title="Fluxos" description="Construa automações visuais para suas conversas" />
    <main className="flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border/70 px-4 py-3 sm:px-6"><Button variant="ghost" size="sm"><ArrowLeft className="size-4" /> Fluxos</Button><Input className="h-9 w-48" defaultValue="Novo fluxo de conversa" /><Input className="h-9 w-44" placeholder="Palavras-chave..." /><label className="flex items-center gap-2 text-xs text-muted-foreground"><input type="checkbox" defaultChecked className="accent-emerald-500" /> Ativo</label><span className="ml-auto text-xs text-amber-300">Alterações não salvas</span><Button className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"><Save className="size-4" /> Salvar</Button></div>
      <div className="grid min-h-[700px] flex-1 lg:grid-cols-[250px_1fr_280px]">
        <aside className="border-b border-border/70 bg-card/30 p-3 lg:border-b-0 lg:border-r"><p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Adicionar passo</p><div className="space-y-2">{steps.map(({ title, description, icon: Icon, tone }) => <button key={title} type="button" className="flex w-full items-center gap-3 rounded-lg border border-border/70 bg-background/60 p-2 text-left transition-colors hover:border-emerald-400/40 hover:bg-emerald-400/5"><Icon className={`size-4 ${tone}`} /><span className="min-w-0"><span className="block text-xs font-medium">{title}</span><span className="block truncate text-[10px] text-muted-foreground">{description}</span></span></button>)}</div></aside>
        <section className="relative min-h-[520px] overflow-hidden bg-background/70" style={{ backgroundImage: "radial-gradient(circle, rgb(148 163 184 / 0.18) 1px, transparent 1px)", backgroundSize: "22px 22px" }}><div className="absolute left-[18%] top-[42%] w-[56%] border-t border-dashed border-emerald-400/60" /><Card className="absolute left-[10%] top-[32%] w-56 border-l-2 border-l-emerald-400 bg-card/95"><div className="p-3"><div className="flex items-center gap-2 text-sm font-medium"><MessageSquareText className="size-4 text-emerald-400" /> Texto <span className="ml-auto rounded bg-emerald-400/10 px-1.5 py-0.5 text-[9px] text-emerald-300">INÍCIO</span></div><p className="mt-2 text-xs text-muted-foreground">Olá! 👋 Como podemos ajudar?</p></div></Card><Card className="absolute left-[58%] top-[32%] w-56 border-l-2 border-l-sky-400 bg-card/95"><div className="p-3"><div className="flex items-center gap-2 text-sm font-medium"><Zap className="size-4 text-sky-400" /> Mensagem interativa</div><p className="mt-2 text-xs text-muted-foreground">Como podemos ajudar?</p><div className="mt-3 flex justify-end gap-1"><span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[9px] text-emerald-300">Compras</span><span className="rounded-full bg-emerald-400/15 px-2 py-1 text-[9px] text-emerald-300">Suporte</span></div></div></Card></section>
        <aside className="border-t border-border/70 bg-card/30 p-4 lg:border-l lg:border-t-0"><div className="flex items-center justify-between border-b border-emerald-400 pb-3 text-sm font-medium">Propriedades<Button variant="ghost" size="icon-xs"><MoreHorizontal className="size-4" /></Button></div><div className="flex h-full items-center justify-center text-center text-xs text-muted-foreground">Clique em um passo do fluxo para editar o que ele faz.</div></aside>
      </div>
    </main>
  </PageContainer>
);
