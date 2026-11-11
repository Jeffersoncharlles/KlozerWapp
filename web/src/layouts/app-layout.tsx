import { Outlet } from "react-router";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { AppSidebar } from "../components/app-sidebar";

export const AppLayout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
};
