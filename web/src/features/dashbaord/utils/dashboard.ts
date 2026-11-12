import { Activity, MessageCircle, UsersRound, Zap } from 'lucide-react'

export const statCards = [
  {
    key: 'total_contacts',
    label: 'Conversas abertas',
    icon: UsersRound,
    color: 'text-primary',
    bg: 'bg-accent',
  },
  {
    key: 'total_messages',
    label: 'Mensagens hoje',
    icon: MessageCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    key: 'total_cards',
    label: 'Atendimentos',
    icon: Activity,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    key: 'active_workflows',
    label: 'Automações ativas',
    icon: Zap,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
  },
] as const

export const chartHeights = [42, 58, 45, 70, 62, 86, 74, 92, 68, 78, 64, 88]
export const chartLabels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D', 'S', 'T', 'Q', 'Q', 'S']
export const recentConversations = [
  ['Mariana Costa', 'Olá, gostaria de saber mais sobre o plano...', 'Agora', 'MC'],
  ['Rafael Oliveira', 'Obrigado pelo atendimento, até logo!', '12 min', 'RO'],
  ['Camila Ferreira', 'Preciso atualizar meus dados de contato.', '28 min', 'CF'],
]

export function formatNumber(value: number) {
  return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  )
}

export function isConnected(status?: string) {
  return status === 'connected' || status === 'open' || status === 'online'
}
