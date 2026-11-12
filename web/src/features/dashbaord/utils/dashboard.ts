import { Activity, MessageCircle, UsersRound, Zap } from 'lucide-react'

export const statCards = [
  {
    key: 'total_contacts',
    label: 'Conversas abertas',
    icon: UsersRound,
    tone: 'contacts',
  },
  {
    key: 'total_messages',
    label: 'Mensagens hoje',
    icon: MessageCircle,
    tone: 'messages',
  },
  {
    key: 'total_cards',
    label: 'Atendimentos',
    icon: Activity,
    tone: 'cards',
  },
  {
    key: 'active_workflows',
    label: 'Automações ativas',
    icon: Zap,
    tone: 'workflows',
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
