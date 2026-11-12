import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card'

export function WhatsAppSetupCard() {
  const steps = [
    ['1', 'Abra o WhatsApp', 'No celular, acesse Configurações.'],
    ['2', 'Vá em aparelhos conectados', 'Selecione conectar um aparelho.'],
    ['3', 'Escaneie o QR Code', 'Use a câmera para confirmar a sessão.'],
  ]
  return (
    <Card className="border-border bg-card shadow-none">
      <CardHeader>
        <CardTitle>Como conectar</CardTitle>
        <CardDescription>Use o WhatsApp no seu celular.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map(([step, title, description]) => (
          <div key={step} className="flex gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {step}
            </span>
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
