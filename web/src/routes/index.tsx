import { createBrowserRouter, RouterProvider } from "react-router"

function RouteFallback() {
    return <div role="status">Carregando aplicacao...</div>
}

const router = createBrowserRouter([
    // {
    // 	path: "/",
    // 	Component: AuthenticationLayout,
    // 	HydrateFallback: RouteFallback,
    // 	children: [
    // 		{
    // 			index: true,
    // 			lazy: async () => {
    // 				const module = await import("@src/pages/login")

    // 				return { Component: module.Login }
    // 			},
    // 		},
    // 	],
    // },
    // {
    // 	Component: PublicAccessLayout,
    // 	HydrateFallback: RouteFallback,
    // 	children: [
    // 		{
    // 			path: "/public",
    // 			lazy: async () => {
    // 				const module = await import("@src/pages/public-access")

    // 				return { Component: module.PublicAccess }
    // 			},
    // 		},
    // 	],
    // },
    // {
    // 	Component: AppLayout,
    // 	HydrateFallback: RouteFallback,
    // 	children: [
    // 		{
    // 			path: "/clinical-reception",
    // 			lazy: async () => {
    // 				const module = await import("@src/layouts/clinical-reception-layout")

    // 				return { Component: module.ClinicalReceptionLayout }
    // 			},
    // 			children: [
    // 				{
    // 					index: true,
    // 					lazy: async () => {
    // 						const module = await import("@src/pages/clinical-reception")

    // 						return { Component: module.ClinicalReception }
    // 					},
    // 				},
    // 				{
    // 					path: "pacientes",
    // 					lazy: async () => {
    // 						const module = await import(
    // 							"@src/pages/clinical-reception-patients"
    // 						)

    // 						return { Component: module.ClinicalReceptionPatients }
    // 					},
    // 				},
    // 			],
    // 		},
    // 		{
    // 			path: "/clinical-doctor",
    // 			Component: ClinicalDoctorLayout,
    // 			children: [
    // 				{
    // 					index: true,
    // 					lazy: async () => {
    // 						const module = await import("@src/pages/clinical-doctor")

    // 						return { Component: module.ClinicalDoctor }
    // 					},
    // 				},
    // 			],
    // 		},
    // 		{
    // 			path: "/clinical-nurses",
    // 			lazy: async () => {
    // 				const module = await import("@src/layouts/clinical-nurses-layout")

    // 				return { Component: module.ClinicalNursesLayout }
    // 			},
    // 			children: [
    // 				{
    // 					index: true,
    // 					lazy: async () => {
    // 						const module = await import("@src/pages/clinical-nurses-queue")

    // 						return { Component: module.ClinicalNursesQueue }
    // 					},
    // 				},
    // 				{
    // 					path: "triagem/:attendanceId",
    // 					lazy: async () => {
    // 						const module = await import("@src/pages/clinical-nurses")

    // 						return { Component: module.ClinicalNurses }
    // 					},
    // 				},
    // 			],
    // 		},
    // 	],
    // },
])

export const AppRoutes = () => {
    return <RouterProvider router={router} />
}