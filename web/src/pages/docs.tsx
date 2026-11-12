import {
  ArrowRight,
  BarChart3,
  Bot,
  ContactRound,
  FileText,
  Kanban,
  Megaphone,
  MessageCircle,
  PlugZap,
  UsersRound,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { PageContainer, WorkspaceHeader } from '../components/workspace-header'

type DocumentationCard = {
  title: string
  description: string
  icon: LucideIcon
  href: string
  status: 'Disponível' | 'Em breve'
}

const documentationCards: DocumentationCard[] = [
  {
    title: 'Conversas',
    description: 'Centralize atendimentos, mensagens e o histórico de cada cliente.',
    icon: MessageCircle,
    href: '/dashboard/conversations',
    status: 'Disponível',
  },
  {
    title: 'Contatos',
    description: 'Organize os dados dos clientes e mantenha sua base sempre acessível.',
    icon: ContactRound,
    href: '/dashboard/contacts',
    status: 'Em breve',
  },
  {
    title: 'Kanban',
    description: 'Acompanhe oportunidades e atendimentos por etapas do seu processo.',
    icon: Kanban,
    href: '/dashboard/kanban',
    status: 'Disponível',
  },
  {
    title: 'Filas',
    description: 'Distribua conversas entre equipes e acompanhe a operação em um só lugar.',
    icon: UsersRound,
    href: '/dashboard/queues',
    status: 'Em breve',
  },
  {
    title: 'Automações',
    description: 'Crie fluxos para reduzir tarefas manuais e responder com mais agilidade.',
    icon: Bot,
    href: '/dashboard/automations',
    status: 'Disponível',
  },
  {
    title: 'Campanhas',
    description: 'Planeje comunicações segmentadas e acompanhe suas campanhas.',
    icon: Megaphone,
    href: '/dashboard/campaigns',
    status: 'Disponível',
  },
  {
    title: 'Respostas rápidas',
    description: 'Acelere o atendimento com mensagens prontas para perguntas frequentes.',
    icon: Zap,
    href: '/dashboard/quick-replies',
    status: 'Em breve',
  },
  {
    title: 'WhatsApp',
    description: 'Conecte sua sessão e monitore o status do canal de atendimento.',
    icon: PlugZap,
    href: '/dashboard/whatsapp',
    status: 'Disponível',
  },
  {
    title: 'Relatórios',
    description: 'Consulte indicadores para entender o desempenho da sua operação.',
    icon: BarChart3,
    href: '/dashboard/reports',
    status: 'Disponível',
  },
]

export function Docs() {
  return (
    <PageContainer>
      <WorkspaceHeader
        title="Documentação"
        description="Conheça os recursos disponíveis no Klozer CRM"
      />
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <section className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Klozer CRM</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Recursos para uma operação mais simples
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Explore as áreas do workspace e encontre as ferramentas que ajudam sua equipe a atender,
            organizar e acompanhar cada etapa do relacionamento com seus clientes.
          </p>
        </section>

        <section
          aria-label="Recursos do Klozer"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {documentationCards.map(({ title, description, icon: Icon, href, status }) => (
            <Card
              key={title}
              className="border-border/70 bg-card/70 transition-colors hover:border-primary/40"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <span
                    data-status={status === 'Disponível' ? 'available' : 'coming-soon'}
                    className="rounded-full bg-amber-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-amber-500 data-[status=available]:bg-emerald-400/10 data-[status=available]:text-emerald-500"
                  >
                    {status}
                  </span>
                </div>
                <CardTitle className="mt-3">{title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                <Button
                  variant="outline"
                  className="mt-6 w-full justify-between"
                  render={<Link to={href} />}
                >
                  Abrir área
                  <ArrowRight className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card className="border-border/70 bg-primary/[0.06]">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <FileText className="size-4 text-primary" /> Precisa de ajuda?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Acesse uma área acima para começar a explorar o workspace.
              </p>
            </div>
            <Button variant="secondary" render={<Link to="/dashboard" />}>
              Ir para visão geral
            </Button>
          </CardContent>
        </Card>
      </main>
    </PageContainer>
  )
}
