import {
  Form,
  redirect,
  useActionData,
  useNavigation,
  type ActionFunctionArgs,
} from "react-router";
import * as z from "zod";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Send,
  Settings2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { features } from "../core/constants/features";
import { API_BASE_URL } from "../core/constants/api";

const signInSchema = z.object({
  email: z.email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

type SignInActionData = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export function loader() {
  if (localStorage.getItem("klozer_token")) {
    return redirect("/dashboard");
  }

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
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

export const SignIn = () => {
  const actionData = useActionData<SignInActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(520px,1.2fr)_minmax(360px,0.8fr)] lg:gap-8 lg:p-10">
      <section className="relative order-2 overflow-hidden rounded-3xl bg-emerald-600 px-6 py-8 text-emerald-50 shadow-2xl shadow-emerald-950/30 sm:px-10 sm:py-10 lg:order-1 lg:px-12 lg:py-12">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="relative">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-emerald-950/20">
              <Send className="size-5" />
            </div>
            <Settings2 className="size-5 text-emerald-100/60" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-100/75">
            Tudo em um só lugar
          </p>
          <h2 className="max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            O CRM de WhatsApp que simplifica sua operação.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-emerald-50/85">
            Centralize conversas, equipes e processos para atender melhor e
            transformar cada interação em resultado.
          </p>

          <div className="mt-9 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-3">
                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-950/20">
                  <Check className="size-3.5" strokeWidth={3} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-emerald-100/80" />
                    <h3 className="text-sm font-bold text-white">{title}</h3>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-emerald-50/75">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="order-1 flex items-center justify-center py-8 lg:order-2 lg:py-12">
        <Card className="w-full max-w-md border-border/70 bg-card/80 shadow-2xl shadow-black/20 backdrop-blur">
          <CardHeader className="gap-3 px-6 pb-2 pt-7 sm:px-8 sm:pt-9">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-400/20">
                <BriefcaseBusiness className="size-5" />
              </div>
              <span className="text-sm font-semibold tracking-wide text-emerald-400">
                KLOZER CRM
              </span>
            </div>
            <div>
              <CardTitle className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="mt-2 text-sm leading-6">
                Entre na sua conta para continuar gerenciando seus atendimentos.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-7 pt-6 sm:px-8 sm:pb-9">
            <Form className="space-y-5" method="post">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  E-mail
                </label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="seu@email.com"
                  aria-invalid={Boolean(actionData?.fieldErrors?.email)}
                  aria-describedby="email-error"
                  className="h-11 bg-background/60 px-3"
                />
                {actionData?.fieldErrors?.email?.[0] && (
                  <p id="email-error" className="text-xs text-destructive">
                    {actionData.fieldErrors.email[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Senha
                  </label>
                  <a
                    className="text-xs text-emerald-400 transition-colors hover:text-emerald-300"
                    href="#recuperar-senha"
                  >
                    Esqueceu a senha?
                  </a>
                </div>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Digite sua senha"
                  aria-invalid={Boolean(actionData?.fieldErrors?.password)}
                  aria-describedby="password-error"
                  className="h-11 bg-background/60 px-3"
                />
                {actionData?.fieldErrors?.password?.[0] && (
                  <p id="password-error" className="text-xs text-destructive">
                    {actionData.fieldErrors.password[0]}
                  </p>
                )}
              </div>
              {actionData?.error && (
                <p
                  className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {actionData.error}
                </p>
              )}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="h-11 w-full bg-emerald-500 font-semibold text-emerald-950 hover:bg-emerald-400"
              >
                {isSubmitting ? "Entrando..." : "Entrar"}
                {!isSubmitting && <ArrowRight className="ml-2 size-4" />}
              </Button>
            </Form>
            <p className="mt-7 text-center text-xs text-muted-foreground">
              Ao entrar, você concorda com nossos termos de uso e política de
              privacidade.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
