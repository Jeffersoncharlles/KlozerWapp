import { Outlet } from 'react-router'

import { AppSidebar } from '../components/app-sidebar'
import { SidebarInset, SidebarProvider } from '../components/ui/sidebar'

export const AppLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
