import { z } from "zod";
import { API_BASE_URL } from "../../../core/constants/api";
import { getAuthToken } from "../../../core/middlewares/authenticate";
import type { WhatsAppLoaderData } from "../types";

const whatsappConnectionSchema = z.object({
  status: z.string().min(1),
  phone: z.string().optional(),
  name: z.string().optional(),
});

const connectionMessageSchema = z.object({
  message: z.string().min(1),
});

// 👇 1. Ajustamos o Schema para aceitar o status
const sseEventSchema = z.object({
  topic: z.string().optional(),
  data: z.object({
    code: z.string().optional(),
    status: z.string().optional()
  }).optional(),
});

function getToken() {
  const token = getAuthToken();
  if (!token) throw new Error("Sessão inválida.");
  return token;
}

async function request<T>(path: string, schema?: z.ZodType<T>, method = "GET") {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  if (!response.ok) throw new Error("Não foi possível atualizar a conexão do WhatsApp.");

  return schema ? schema.parse(await response.json()) : undefined;
}

export async function loadWhatsAppConnection(): Promise<WhatsAppLoaderData> {
  try {
    const connection = await request("/sessions/status", whatsappConnectionSchema);
    return { connection };
  } catch (error) {
    return {
      error: error instanceof z.ZodError ? "A resposta recebida está em um formato inválido." : (error as Error).message,
    };
  }
}

export async function connectWhatsApp() {
  await request("/sessions/connect", connectionMessageSchema, "POST");
}

export async function disconnectWhatsApp() {
  await request("/sessions/disconnect", undefined, "POST");
}

// 👇 2. Adicionamos o "onConnected" como um callback para a UI saber a hora de atualizar
export async function subscribeToEvents(
  signal: AbortSignal,
  onCode: (code: string) => void,
  onConnected: () => void
) {
  const response = await fetch(`${API_BASE_URL}/sessions/stream`, {
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${getToken()}`,
    },
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error("Não foi possível abrir o canal de conexão do WhatsApp.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (!signal.aborted) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const payload = event
        .split("\n")
        .filter((line) => line.startsWith("data: "))
        .map((line) => line.slice(6))
        .join("\n");

      if (!payload) continue;

      const parsed = sseEventSchema.safeParse(JSON.parse(payload));

      if (parsed.success) {
        // Evento 1: Recebeu o QR Code
        if (parsed.data.topic === "qr_code" && parsed.data.data?.code) {
          onCode(parsed.data.data.code);
        }

        // Evento 2: Conexão Bem Sucedida!
        if (parsed.data.topic === "connection_status" && parsed.data.data?.status === "connected") {
          onConnected();
        }
      }
    }
  }
}