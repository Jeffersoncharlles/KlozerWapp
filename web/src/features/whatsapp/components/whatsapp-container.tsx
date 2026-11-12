import { CheckCircle2, LoaderCircle, LogOut, QrCode, RefreshCw, Smartphone, Wifi, WifiOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useRevalidator } from "react-router";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { PageContainer, WorkspaceHeader } from "../../../components/workspace-header";
import { connectWhatsApp, disconnectWhatsApp, subscribeToEvents } from "../services/whatsapp-service";
import type { WhatsAppLoaderData } from "../types";

function isConnected(status?: string) {
  return ["connected", "open", "online"].includes(status?.toLowerCase() ?? "");
}

export function WhatsAppContainer({ data }: { data: WhatsAppLoaderData }) {
  const { revalidate } = useRevalidator();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const [qrCode, setQRCode] = useState<string>();
  const connected = isConnected(data.connection?.status);

  useEffect(() => {
    if (connected) {
      setQRCode(undefined);
      return;
    }

    const controller = new AbortController();

    // Passamos o setQRCode para desenhar a imagem, e o revalidate para fechar 
    // a tela quando o celular conectar com sucesso!
    void subscribeToEvents(
      controller.signal,
      setQRCode,
      () => revalidate() // 🟢 Quando conectar, o Remix/React Router recarrega os dados do Loader!
    ).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        setActionError(error instanceof Error ? error.message : "Não foi possível acompanhar o QR Code.");
      }
    });

    return () => controller.abort();
  }, [connected, revalidate]);

  async function handleConnection(action: "connect" | "disconnect") {
    setActionError(undefined);
    if (action === "connect") {
      setQRCode(undefined);
    }
    setIsSubmitting(true);

    try {
      if (action === "connect") {
        await connectWhatsApp();
      } else {
        await disconnectWhatsApp();
      }

      revalidate();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Não foi possível atualizar a conexão.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const message = actionError ?? data.error;

  return (
    <PageContainer>
      <WorkspaceHeader title="WhatsApp" description="Conecte e gerencie o número usado nos atendimentos." />
      <main className="mx-auto w-full max-w-[1100px] space-y-5 p-4 sm:p-6 lg:py-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium text-muted-foreground">CANAL DE ATENDIMENTO</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Conexão WhatsApp</h1>
            <p className="mt-1 text-sm text-muted-foreground">Mantenha seu aparelho conectado para receber mensagens e chamadas.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => revalidate()} disabled={isSubmitting}>
            <RefreshCw className="size-3.5" /> Atualizar status
          </Button>
        </div>

        {message ? (
          <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {message}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle>Dispositivo principal</CardTitle>
              <CardDescription>Estado atual da conexão com o WhatsApp.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`flex flex-col gap-4 rounded-lg border p-5 sm:flex-row sm:items-center ${connected ? "border-emerald-500/25 bg-emerald-500/10" : "border-amber-500/25 bg-amber-500/10"}`}>
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${connected ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                  {connected ? <Wifi className="size-5" /> : <WifiOff className="size-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold">{connected ? "WhatsApp conectado" : "Nenhum dispositivo conectado"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {connected ? data.connection?.phone ?? data.connection?.name ?? "Sessão ativa e pronta para atender." : "Escaneie o QR Code no seu celular para iniciar uma nova sessão."}
                  </p>
                </div>
                <span className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${connected ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : "bg-amber-500/15 text-amber-700 dark:text-amber-400"}`}>
                  <span className={`size-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {connected ? "Conectado" : "Desconectado"}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {connected ? (
                  <Button variant="destructive" onClick={() => handleConnection("disconnect")} disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
                    Desconectar aparelho
                  </Button>
                ) : (
                  <Button onClick={() => handleConnection("connect")} disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <QrCode className="size-4" />}
                    Conectar com QR Code
                  </Button>
                )}
              </div>

              {qrCode ? (
                <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-border bg-secondary/40 p-5 text-center">
                  <div className="rounded-lg bg-white p-3">
                    <QRCodeSVG value={qrCode} size={192} level="M" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Escaneie o QR Code</p>
                    <p className="mt-1 text-xs text-muted-foreground">No WhatsApp, abra Aparelhos conectados e selecione Conectar um aparelho.</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-none">
            <CardHeader>
              <CardTitle>Como conectar</CardTitle>
              <CardDescription>Use o WhatsApp no seu celular.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                ["1", "Abra o WhatsApp", "No celular, acesse Configurações."],
                ["2", "Vá em aparelhos conectados", "Selecione conectar um aparelho."],
                ["3", "Escaneie o QR Code", "Use a câmera para confirmar a sessão."],
              ].map(([step, title, description]) => (
                <div key={step} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{step}</span>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card shadow-none">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              {connected ? <CheckCircle2 className="size-4 text-emerald-500" /> : <Smartphone className="size-4" />}
            </div>
            <div>
              <p className="text-sm font-medium">{connected ? "Sua sessão está pronta para uso" : "Conecte um aparelho para começar"}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">A conexão é necessária para enviar e receber mensagens no painel.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </PageContainer>
  );
}
