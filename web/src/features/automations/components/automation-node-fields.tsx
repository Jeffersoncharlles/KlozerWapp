import { Input } from '../../../components/ui/input'
import type { AutomationNodeData } from '../types'
import type { AutomationCanvasNode } from './automation-flow-types'
import { AutomationInspectorTextField } from './automation-inspector-text-field'
import { AutomationNodeOptions } from './automation-node-options'

type Props = {
  node: AutomationCanvasNode
  onChange: (patch: Partial<AutomationNodeData>) => void
}

export function AutomationNodeFields({ node, onChange }: Props) {
  return (
    <>
      {(node.type === 'message' || node.type === 'interactive-message') && (
        <AutomationInspectorTextField
          node={node}
          label="Mensagem"
          field="message"
          placeholder="Use {{lastMessage}} ou suas variáveis"
          onChange={onChange}
        />
      )}
      {node.type === 'interactive-message' && (
        <AutomationNodeOptions node={node} onChange={onChange} />
      )}
      {(node.type === 'variable' || node.type === 'condition' || node.type === 'http-request') && (
        <label className="block space-y-1.5 text-xs font-medium">
          {node.type === 'http-request' ? 'Guardar resposta na variável' : 'Variável'}
          <Input
            value={node.data.variable ?? ''}
            maxLength={100}
            onChange={(event) => onChange({ variable: event.target.value })}
          />
        </label>
      )}
      {node.type === 'condition' && (
        <label className="block space-y-1.5 text-xs font-medium">
          Operador
          <select
            className="w-full rounded border border-input bg-background p-2"
            value={node.data.operator ?? 'equals'}
            onChange={(event) =>
              onChange({ operator: event.target.value as 'equals' | 'contains' | 'exists' })
            }
          >
            <option value="equals">Igual</option>
            <option value="contains">Contém</option>
            <option value="exists">Existe</option>
          </select>
        </label>
      )}
      {(node.type === 'variable' || node.type === 'condition') && (
        <AutomationInspectorTextField node={node} label="Valor" field="value" onChange={onChange} />
      )}
      {(node.type === 'delay' || node.type === 'interactive-message') && (
        <label className="block space-y-1.5 text-xs font-medium">
          {node.type === 'delay' ? 'Intervalo em segundos' : 'Timeout em segundos (padrão 300)'}
          <Input
            type="number"
            min={0}
            max={86400}
            value={node.data.seconds ?? 0}
            onChange={(event) => onChange({ seconds: Number(event.target.value) })}
          />
        </label>
      )}
      {node.type === 'http-request' && (
        <>
          <label className="block space-y-1.5 text-xs font-medium">
            URL pública
            <Input
              value={node.data.url ?? ''}
              onChange={(event) => onChange({ url: event.target.value })}
              placeholder="https://api.exemplo.com"
            />
          </label>
          <label className="block space-y-1.5 text-xs font-medium">
            Método
            <select
              className="w-full rounded border border-input bg-background p-2"
              value={node.data.method ?? 'GET'}
              onChange={(event) => onChange({ method: event.target.value as 'GET' | 'POST' })}
            >
              <option>GET</option>
              <option>POST</option>
            </select>
          </label>
          <AutomationInspectorTextField
            node={node}
            label="Corpo JSON"
            field="body"
            onChange={onChange}
          />
        </>
      )}
    </>
  )
}
