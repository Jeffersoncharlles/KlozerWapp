import { createBrowserRouter, RouterProvider } from 'react-router'

import { authenticateMiddleware } from '../core/middlewares/authenticate'
import { AppLayout } from '../layouts/app-layout'
import { PublicAcessLayout } from '../layouts/public-access-layout'
import { FeaturePlaceholder } from '../pages/feature-placeholder'

function RouteFallback() {
  return <div role="status">Carregando aplicacao...</div>
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: PublicAcessLayout,
    HydrateFallback: RouteFallback,
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import('../pages/sign-in')

          return {
            Component: module.SignIn,
            action: module.action,
            loader: module.loader,
          }
        },
      },
    ],
  },
  {
    path: '/dashboard',
    Component: AppLayout,
    loader: authenticateMiddleware,
    HydrateFallback: RouteFallback,
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import('../pages/dashboard')

          return {
            Component: module.Dashboard,
            loader: module.loader,
          }
        },
      },
      {
        path: 'conversations',
        lazy: async () => {
          const module = await import('../pages/conversations')

          return { Component: module.Conversations, loader: module.loader, action: module.action }
        },
      },
      {
        path: 'kanban',
        lazy: async () => {
          const module = await import('../pages/kanban')

          return {
            Component: module.Kanban,
            loader: module.loader,
          }
        },
      },
      {
        path: 'automations',
        lazy: async () => {
          const module = await import('../pages/automations')

          return {
            Component: module.Automations,
            loader: module.loader,
            action: module.action,
            ErrorBoundary: module.AutomationErrorBoundary,
          }
        },
      },
      {
        path: 'automations/:id',
        lazy: async () => {
          const module = await import('../pages/automations')
          return {
            Component: module.Automations,
            loader: module.loader,
            action: module.action,
            ErrorBoundary: module.AutomationErrorBoundary,
          }
        },
      },
      {
        path: 'campaigns',
        lazy: async () => ({ Component: (await import('../pages/campaigns')).Campaigns }),
      },
      {
        path: 'reports',
        lazy: async () => {
          const module = await import('../pages/reports')

          return {
            Component: module.Reports,
            loader: module.loader,
            ErrorBoundary: module.ReportsErrorBoundary,
          }
        },
      },
      {
        path: 'whatsapp',
        lazy: async () => {
          const module = await import('../pages/whatsapp')

          return {
            Component: module.WhatsApp,
            loader: module.loader,
            action: module.action,
          }
        },
      },
      ...[
        ['contacts', 'Contatos'],
        ['queues', 'Filas'],
        ['quick-replies', 'Respostas rápidas'],
        ['calls', 'Chamadas'],
        ['settings', 'Configurações'],
      ].map(([path, title]) => ({
        path,
        lazy: async () => ({
          Component: () => <FeaturePlaceholder title={title} />,
        }),
      })),
      {
        path: 'docs',
        lazy: async () => ({ Component: (await import('../pages/docs')).Docs }),
      },
    ],
  },
])

export const AppRoutes = () => {
  return <RouterProvider router={router} />
}
