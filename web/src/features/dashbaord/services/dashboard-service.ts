import { z } from "zod";
import { API_BASE_URL } from "../../../core/constants/api";
import { getAuthToken } from "../../../core/middlewares/authenticate";
import type { DashboardLoaderData } from "../types";

const dashboardMetricsSchema = z.object({
  total_contacts: z.number().nonnegative(),
  total_messages: z.number().nonnegative(),
  total_cards: z.number().nonnegative(),
  active_workflows: z.number().nonnegative(),
});

const whatsappSessionSchema = z.object({
  status: z.string().min(1),
});

async function getApiData<T>(path: string, token: string, schema: z.ZodType<T>): Promise<T> {
  const response = await fetch(path, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Não foi possível carregar ${path}.`);
  }

  return schema.parse(await response.json());
}

function getErrorMessage(reason: unknown) {
  if (reason instanceof z.ZodError) {
    return "A resposta recebida está em um formato inválido.";
  }

  return reason instanceof Error ? reason.message : "Uma integração não respondeu.";
}

export async function loadDashboard(): Promise<DashboardLoaderData> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Sessão inválida.");
  }

  const [metricsResult, sessionResult] = await Promise.allSettled([
    getApiData(`${API_BASE_URL}/reports/dashboard`, token, dashboardMetricsSchema),
    getApiData(`${API_BASE_URL}/sessions/status`, token, whatsappSessionSchema),
  ]);
  const errors = [metricsResult, sessionResult]
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => getErrorMessage(result.reason));

  return {
    metrics: metricsResult.status === "fulfilled" ? metricsResult.value : undefined,
    whatsappStatus: sessionResult.status === "fulfilled" ? sessionResult.value.status : undefined,
    error: errors.length > 0 ? errors.join(" ") : undefined,
  };
}
