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
