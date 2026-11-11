import { Archive, CheckCheck, Filter, MoreHorizontal, Paperclip, Search, Send, Smile, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { ScrollArea } from "../components/ui/scroll-area";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { PageContainer, WorkspaceHeader } from "../components/workspace-header";

const conversations = [
  { name: "Mariana Costa", preview: "Olá, gostaria de saber mais sobre o plano...", time: "Agora", initials: "MC", unread: 2, color: "bg-sky-400/15 text-sky-300" },
  { name: "Rafael Oliveira", preview: "Obrigado pelo atendimento, até logo!", time: "12 min", initials: "RO", unread: 0, color: "bg-violet-400/15 text-violet-300" },
  { name: "Camila Ferreira", preview: "Preciso atualizar meus dados de contato.", time: "28 min", initials: "CF", unread: 1, color: "bg-amber-400/15 text-amber-300" },
  { name: "João Martins", preview: "Pode me enviar o catálogo?", time: "1 h", initials: "JM", unread: 0, color: "bg-emerald-400/15 text-emerald-300" },
];

export const Conversations = () => {
  const [selected, setSelected] = useState(conversations[0]);
  return (
    <PageContainer>
      <WorkspaceHeader title="Conversas" description="Central de atendimento e histórico de mensagens" />
      <main className="flex h-[calc(100svh-4rem)] min-h-[620px] flex-col overflow-hidden p-4 sm:p-6 lg:flex-row">
        <Card className="flex w-full shrink-0 flex-col overflow-hidden rounded-b-none border-border/70 bg-card/70 lg:w-[360px] lg:rounded-r-none lg:rounded-bl-xl">
          <div className="border-b border-border/70 p-4">
            <div className="mb-4 flex items-center justify-between"><div><h1 className="text-lg font-semibold">Chats</h1><p className="text-xs text-muted-foreground">12 conversas ativas</p></div><Button variant="outline" size="icon-sm"><Filter className="size-4" /></Button></div>
            <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-9 pl-9" placeholder="Buscar conversa..." /></div>
          </div>
          <ScrollArea className="min-h-0 flex-1"><div className="space-y-1 p-2">{conversations.map((conversation) => <button key={conversation.name} type="button" onClick={() => setSelected(conversation)} className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${selected.name === conversation.name ? "bg-emerald-400/10 ring-1 ring-emerald-400/30" : "hover:bg-muted/50"}`}><Avatar><AvatarFallback className={conversation.color}>{conversation.initials}</AvatarFallback></Avatar><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{conversation.name}</strong><small className="shrink-0 text-[10px] text-muted-foreground">{conversation.time}</small></span><span className="mt-1 flex items-center justify-between gap-2"><span className="truncate text-xs text-muted-foreground">{conversation.preview}</span>{conversation.unread > 0 && <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-emerald-950">{conversation.unread}</span>}</span></span></button>)}</div></ScrollArea>
        </Card>
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-none border-border/70 bg-card/50 lg:rounded-l-none lg:rounded-tr-xl">
          <div className="flex items-center gap-3 border-b border-border/70 p-4"><Avatar><AvatarFallback className="bg-sky-400/15 text-sky-300">{selected.initials}</AvatarFallback></Avatar><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{selected.name}</p><p className="flex items-center gap-1 text-xs text-emerald-400"><span className="size-1.5 rounded-full bg-emerald-400" /> Online agora</p></div><Button variant="ghost" size="icon-sm"><UserRound className="size-4" /></Button><Button variant="ghost" size="icon-sm"><Archive className="size-4" /></Button><Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button></div>
          <ScrollArea className="min-h-0 flex-1 p-4 sm:p-6"><div className="mx-auto flex max-w-2xl flex-col gap-4"><p className="self-center rounded-full bg-muted px-3 py-1 text-[10px] text-muted-foreground">Hoje</p><div className="max-w-[80%] self-start rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm">Olá! Gostaria de saber mais sobre o plano Enterprise.</div><div className="max-w-[80%] self-end rounded-2xl rounded-tr-sm bg-emerald-500 px-4 py-3 text-sm text-emerald-950">Olá, Mariana! Claro. Posso te apresentar todos os recursos e condições.</div><span className="flex items-center justify-end gap-1 text-[10px] text-muted-foreground"><CheckCheck className="size-3 text-emerald-400" /> 10:42</span><div className="max-w-[80%] self-start rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-sm">Perfeito, aguardo as informações 😊</div></div></ScrollArea>
          <div className="border-t border-border/70 p-3 sm:p-4"><div className="flex items-center gap-2 rounded-xl border border-border bg-background/70 p-2"><Button variant="ghost" size="icon-sm"><Paperclip className="size-4" /></Button><Input className="h-8 border-0 bg-transparent shadow-none focus-visible:ring-0" placeholder="Digite sua mensagem..." /><Button variant="ghost" size="icon-sm"><Smile className="size-4" /></Button><Button size="icon-sm" className="bg-emerald-500 text-emerald-950 hover:bg-emerald-400"><Send className="size-4" /></Button></div></div>
        </Card>
      </main>
    </PageContainer>
  );
};
