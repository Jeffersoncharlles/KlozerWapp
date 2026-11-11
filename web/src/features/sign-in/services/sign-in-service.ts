import { redirect, type ActionFunctionArgs } from "react-router";
import { z } from "zod";
import { API_BASE_URL } from "../../../core/constants/api";
import type { SignInActionData } from "../types";

const signInSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export function loadSignIn() {
  if (localStorage.getItem("klozer_token")) {
    return redirect("/dashboard");
  }

  return null;
}

export async function signIn({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const result = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!result.success) {
    const errors = z.flattenError(result.error);

    return {
      error: errors.formErrors[0],
      fieldErrors: errors.fieldErrors,
    } satisfies SignInActionData;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result.data),
    });
    const data = (await response.json()) as {
      token?: string;
      message?: string;
    };

    if (!response.ok || !data.token) {
      return {
        error: data.message ?? "Não foi possível entrar. Verifique seus dados.",
      } satisfies SignInActionData;
    }

    localStorage.setItem("klozer_token", data.token);
    return redirect("/dashboard");
  } catch {
    return {
      error: "Não foi possível conectar ao servidor. Tente novamente.",
    } satisfies SignInActionData;
  }
}
