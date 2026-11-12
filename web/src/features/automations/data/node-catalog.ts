import {
  CircleHelp,
  GitBranch,
  MessageSquareText,
  Variable,
  Webhook,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { AutomationNode, AutomationNodeType } from '../types'

export type AutomationNodeSpec = {
  type: AutomationNodeType
  title: string
  description: string
  icon: LucideIcon
  tone: string
}

export const automationNodeSpecs: AutomationNodeSpec[] = [
  {
    type: 'message',
    title: 'Texto',
    description: 'Envie uma mensagem de texto simples',
    icon: MessageSquareText,
    tone: 'text-emerald-700 dark:text-emerald-400',
  },
  {
    type: 'interactive-message',
    title: 'Mensagem interativa',
    description: 'Menu de opções numeradas no WhatsApp',
    icon: Zap,
    tone: 'text-sky-700 dark:text-sky-400',
  },
  {
    type: 'condition',
    title: 'Condição',
    description: 'Separe caminhos do fluxo',
    icon: GitBranch,
    tone: 'text-violet-700 dark:text-violet-400',
  },
  {
    type: 'delay',
    title: 'Intervalo',
    description: 'Espere alguns segundos antes de continuar',
    icon: CircleHelp,
    tone: 'text-amber-700 dark:text-amber-400',
  },
  {
    type: 'variable',
    title: 'Variável',
    description: 'Guarde um valor para usar depois',
    icon: Variable,
    tone: 'text-pink-700 dark:text-pink-400',
  },
  {
    type: 'http-request',
    title: 'Requisição HTTP',
    description: 'Chame uma API e aguarde a resposta',
    icon: Webhook,
    tone: 'text-slate-600 dark:text-slate-300',
  },
]

export function getAutomationNodeSpec(type: AutomationNodeType) {
  return automationNodeSpecs.find((node) => node.type === type)
}

export function createAutomationNode(type: AutomationNodeType, position: { x: number; y: number }): AutomationNode {
  const spec = getAutomationNodeSpec(type)

  if (!spec) {
    throw new Error(`Tipo de passo inválido: ${type}`)
  }

  return {
    id: `${type}-${crypto.randomUUID()}`,
    type,
    position,
    data: {
      label: spec.title,
      description: spec.description,
      message: type === 'message' ? 'Escreva a mensagem que será enviada.' : undefined,
      ...(type === 'interactive-message' ? { message: 'Escolha uma opção', options: [{ id: 'option-1', label: 'Opção 1' }], seconds: 300 } : {}),
      ...(type === 'delay' ? { seconds: 5 } : {}),
      ...(type === 'variable' ? { variable: 'nome', value: '{{lastMessage}}' } : {}),
      ...(type === 'condition' ? { variable: 'lastMessage', operator: 'equals' as const, value: '' } : {}),
      ...(type === 'http-request' ? { method: 'GET' as const, url: '', variable: 'response' } : {}),
    },
  }
}
