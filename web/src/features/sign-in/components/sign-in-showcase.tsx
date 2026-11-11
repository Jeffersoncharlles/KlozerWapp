import { BarChart3, KanbanSquare, MessageCircleMore, Sparkles } from "lucide-react";

const highlights = [
  {
    icon: MessageCircleMore,
    title: "Atendimento centralizado",
    description: "Todas as conversas em um único lugar.",
  },
  {
    icon: KanbanSquare,
    title: "Kanban de oportunidades",
    description: "Visualize cada negociação com clareza.",
  },
  {
    icon: Sparkles,
    title: "Automações inteligentes",
    description: "Ganhe escala sem perder o cuidado.",
  },
  {
    icon: BarChart3,
    title: "Relatórios em tempo real",
    description: "Decida com dados que acompanham você.",
  },
];

const metrics = [
  ["12k+", "conversas por dia"],
  ["38%", "mais agilidade"],
  ["99,9%", "de disponibilidade"],
];

export function SignInShowcase() {
  return (
    <section className="relative hidden overflow-hidden bg-primary px-10 py-12 text-primary-foreground lg:flex lg:flex-col xl:px-16">
      <div className="absolute inset-x-0 top-0 h-56 bg-linear-to-br from-white/10 to-transparent" />
      <div className="relative flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-white text-primary">
          <MessageCircleMore className="size-5" />
        </div>
        <span className="cn-font-heading text-xl font-bold">KlozerWapp</span>
      </div>

      <div className="relative mt-16 max-w-xl">
        <p className="text-xs font-bold tracking-[0.14em] text-primary-foreground/75">
          CRM PARA WHATSAPP
        </p>
        <h1 className="cn-font-heading mt-4 text-4xl leading-[1.08] font-bold tracking-tight xl:text-5xl">
          Transforme conversas em relacionamentos que crescem.
        </h1>
        <p className="mt-5 text-base leading-7 text-primary-foreground/80">
          Organize sua operação, responda mais rápido e acompanhe cada
          oportunidade em um só lugar.
        </p>
      </div>

      <div className="relative mt-10 grid max-w-xl gap-3">
        {highlights.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
              <Icon className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="mt-0.5 text-xs text-primary-foreground/75">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-auto flex gap-8 pt-12">
        {metrics.map(([value, label]) => (
          <div key={label}>
            <p className="cn-font-heading text-xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-primary-foreground/70">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
