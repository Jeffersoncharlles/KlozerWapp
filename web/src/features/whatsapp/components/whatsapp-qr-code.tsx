import { QRCodeSVG } from 'qrcode.react'

export function WhatsAppQrCode({ value }: { value: string }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-border bg-secondary/40 p-5 text-center">
      <div className="rounded-lg bg-white p-3">
        <QRCodeSVG value={value} size={192} level="M" />
      </div>
      <div>
        <p className="text-sm font-medium">Escaneie o QR Code</p>
        <p className="mt-1 text-xs text-muted-foreground">
          No WhatsApp, abra Aparelhos conectados e selecione Conectar um aparelho.
        </p>
      </div>
    </div>
  )
}
