import { createBrowserRouter, RouterProvider } from "react-router";
import { PublicAcessLayout } from "../layouts/public-access-layout";
import { AppLayout } from "../layouts/app-layout";
import { FeaturePlaceholder } from "../pages/feature-placeholder";

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
        lazy: async () => ({ Component: (await import("../pages/kanban")).Kanban }),
      },
      {
        path: "automations",
        lazy: async () => ({ Component: (await import("../pages/automations")).Automations }),
      },
      {
        path: "campaigns",
        lazy: async () => ({ Component: (await import("../pages/campaigns")).Campaigns }),
      },
      {
        path: "reports",
        lazy: async () => ({ Component: (await import("../pages/reports")).Reports }),
      },
      ...[
        ["contacts", "Contatos"],
        ["queues", "Filas"],
        ["whatsapp", "WhatsApp"],
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
