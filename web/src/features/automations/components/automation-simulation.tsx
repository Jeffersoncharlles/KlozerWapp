import { Play } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

type Props = {
  busy: boolean
  isDirty: boolean
  onSimulate: (inputs: string[]) => void
}

export function AutomationSimulation({ busy, isDirty, onSimulate }: Props) {
  const [simulationInputs, setSimulationInputs] = useState('')

  return (
    <section className="flex flex-wrap items-center gap-2 border-t border-border p-4">
      <Input
        aria-label="Respostas para simulação"
        className="max-w-md"
        value={simulationInputs}
        onChange={(event) => setSimulationInputs(event.target.value)}
        placeholder="Respostas separadas por ; (ex.: 1;sim)"
      />
      <Button
        variant="outline"
        disabled={busy || isDirty}
        onClick={() =>
          onSimulate(
            simulationInputs ? simulationInputs.split(';').map((value) => value.trim()) : [],
          )
        }
      >
        <Play className="size-4" />
        Simular rascunho salvo
      </Button>
    </section>
  )
}
