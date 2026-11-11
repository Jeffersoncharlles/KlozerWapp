import { createBrowserRouter, RouterProvider } from "react-router";
import { PublicAcessLayout } from "../layouts/public-access-layout";
import { AppLayout } from "../layouts/app-layout";

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

          return { Component: module.SignIn };
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

          return { Component: module.Dashboard };
        },
      },
    ],
  },
]);

export const AppRoutes = () => {
  return <RouterProvider router={router} />;
};
