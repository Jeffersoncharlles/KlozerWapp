import { createBrowserRouter, RouterProvider } from "react-router";
import { PublicAcessLayout } from "../layouts/public-access-layout";
import { AppLayout } from "../layouts/app-layout";
import { FeaturePlaceholder } from "../pages/feature-placeholder";
import { authenticateMiddleware } from "../core/middlewares/authenticate";

function RouteFallback() {
  return <div role="status">Carregando aplicacao...</div>;
}

const router = createBrowserRouter([
  {
    path: "/",
    Component: PublicAcessLayout,
    HydrateFallback: RouteFallback,
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import("../pages/sign-in");

          return {
            Component: module.SignIn,
            action: module.action,
            loader: module.loader,
          };
        },
      },
    ],
  },
  {
    path: "/dashboard",
    Component: AppLayout,
    loader: authenticateMiddleware,
    HydrateFallback: RouteFallback,
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import("../pages/dashboard");

          return {
            Component: module.Dashboard,
            loader: module.loader,
          };
        },
      },
      {
        path: "conversations",
        lazy: async () => ({ Component: (await import("../pages/conversations")).Conversations }),
      },
      {
        path: "kanban",
        lazy: async () => {
          const module = await import("../pages/kanban");

          return {
            Component: module.Kanban,
            loader: module.loader,
          };
        },
      },
      {
        path: "automations",
        lazy: async () => {
          const module = await import("../pages/automations");

          return {
            Component: module.Automations,
            loader: module.loader,
            action: module.action,
            ErrorBoundary: module.AutomationErrorBoundary,
          };
        },
      },
      {
        path: 'automations/:id',
        lazy: async () => {
          const module = await import('../pages/automations')
          return { Component: module.Automations, loader: module.loader, action: module.action, ErrorBoundary: module.AutomationErrorBoundary }
        },
      },
      {
        path: "campaigns",
        lazy: async () => ({ Component: (await import("../pages/campaigns")).Campaigns }),
      },
      {
        path: "reports",
        lazy: async () => ({ Component: (await import("../pages/reports")).Reports }),
      },
      {
        path: "whatsapp",
        lazy: async () => {
          const module = await import("../pages/whatsapp");

          return {
            Component: module.WhatsApp,
            loader: module.loader,
          };
        },
      },
      ...[
        ["contacts", "Contatos"],
        ["queues", "Filas"],
        ["quick-replies", "Respostas rápidas"],
        ["calls", "Chamadas"],
        ["docs", "Documentação"],
        ["settings", "Configurações"],
      ].map(([path, title]) => ({
        path,
        lazy: async () => ({
          Component: () => <FeaturePlaceholder title={title} />,
        }),
      })),
    ],
  },
]);

export const AppRoutes = () => {
  return <RouterProvider router={router} />;
};
