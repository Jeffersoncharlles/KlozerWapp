import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import type { AutomationNodeData } from '../types'
import type { AutomationCanvasNode } from './automation-flow-types'

type Props = { node?: AutomationCanvasNode; onChange: (id: string, patch: Partial<AutomationNodeData>) => void; onRemove: (id: string) => void; onStart: (id: string) => void }
export function AutomationInspector({ node, onChange, onRemove, onStart }: Props) {
  const update = (patch: Partial<AutomationNodeData>) => { if (node) onChange(node.id, patch) }
  const textField = (label: string, key: 'message' | 'body' | 'value', placeholder?: string) => <label className="block space-y-1.5 text-xs font-medium">{label}<textarea className="min-h-24 w-full rounded-md border border-input bg-transparent p-2" value={node?.data[key] ?? ''} placeholder={placeholder} onChange={(event) => update({ [key]: event.target.value })} /></label>
  return <aside className="overflow-y-auto border-t border-border bg-card p-4 lg:border-l lg:border-t-0">
    <h2 className="border-b border-border pb-3 text-sm font-medium">Propriedades</h2>
    {node ? <div className="space-y-4 py-4">
      <label className="block space-y-1.5 text-xs font-medium">Título<Input maxLength={120} value={node.data.label} onChange={(event) => update({ label: event.target.value })} /></label>
      <Button className="w-full" variant="outline" disabled={node.data.isStart} onClick={() => onStart(node.id)}>{node.data.isStart ? 'Passo inicial' : 'Usar como início'}</Button>
      {(node.type === 'message' || node.type === 'interactive-message') && textField('Mensagem', 'message', 'Use {{lastMessage}} ou suas variáveis')}
      {node.type === 'interactive-message' && <div className="space-y-2">
        <p className="text-xs font-medium">Opções (ID da saída e texto)</p>
        {(node.data.options ?? []).map((option, index) => <div className="space-y-1 rounded border border-border p-2" key={index}>
          <Input aria-label={`ID da opção ${index + 1}`} value={option.id} onChange={(event) => update({ options: node.data.options?.map((item, i) => i === index ? { ...item, id: event.target.value } : item) })} />
          <Input aria-label={`Texto da opção ${index + 1}`} value={option.label} onChange={(event) => update({ options: node.data.options?.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} />
          <Button variant="ghost" size="sm" onClick={() => update({ options: node.data.options?.filter((_, i) => i !== index) })}>Remover opção</Button>
        </div>)}
        <Button variant="outline" size="sm" disabled={(node.data.options?.length ?? 0) >= 10} onClick={() => update({ options: [...(node.data.options ?? []), { id: `option-${crypto.randomUUID().slice(0, 8)}`, label: 'Nova opção' }] })}><Plus className="size-3" />Opção</Button>
      </div>}
      {(node.type === 'variable' || node.type === 'condition' || node.type === 'http-request') && <label className="block space-y-1.5 text-xs font-medium">{node.type === 'http-request' ? 'Guardar resposta na variável' : 'Variável'}<Input value={node.data.variable ?? ''} maxLength={100} onChange={(event) => update({ variable: event.target.value })} /></label>}
      {node.type === 'condition' && <label className="block space-y-1.5 text-xs font-medium">Operador<select className="w-full rounded border border-input bg-background p-2" value={node.data.operator ?? 'equals'} onChange={(event) => update({ operator: event.target.value as 'equals' | 'contains' | 'exists' })}><option value="equals">Igual</option><option value="contains">Contém</option><option value="exists">Existe</option></select></label>}
      {(node.type === 'variable' || node.type === 'condition') && textField('Valor', 'value')}
      {(node.type === 'delay' || node.type === 'interactive-message') && <label className="block space-y-1.5 text-xs font-medium">{node.type === 'delay' ? 'Intervalo em segundos' : 'Timeout em segundos (padrão 300)'}<Input type="number" min={0} max={86400} value={node.data.seconds ?? 0} onChange={(event) => update({ seconds: Number(event.target.value) })} /></label>}
      {node.type === 'http-request' && <>
        <label className="block space-y-1.5 text-xs font-medium">URL pública<Input value={node.data.url ?? ''} onChange={(event) => update({ url: event.target.value })} placeholder="https://api.exemplo.com" /></label>
        <label className="block space-y-1.5 text-xs font-medium">Método<select className="w-full rounded border border-input bg-background p-2" value={node.data.method ?? 'GET'} onChange={(event) => update({ method: event.target.value as 'GET' | 'POST' })}><option>GET</option><option>POST</option></select></label>
        {textField('Corpo JSON', 'body')}
      </>}
      <Button className="w-full" disabled={node.data.isStart} onClick={() => onRemove(node.id)} variant="outline"><Trash2 className="size-4" />Remover passo</Button>
      {node.data.isStart && <p className="text-xs text-muted-foreground">Escolha outro início antes de remover este passo.</p>}
    </div> : <p className="py-8 text-center text-xs text-muted-foreground">Selecione um passo para editar.</p>}
  </aside>
}
