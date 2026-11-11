import { NavLink } from "react-router";
import {
  BarChart3,
  Bot,
  ContactRound,
  FileText,
  Kanban,
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  Phone,
  PlugZap,
  Settings,
  UsersRound,
  Zap,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "./ui/sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";

const mainNavigation = [
  { title: "Visão geral", href: "/dashboard", icon: LayoutDashboard },
  { title: "Conversas", href: "/dashboard/conversations", icon: MessageCircle },
  { title: "Contatos", href: "/dashboard/contacts", icon: ContactRound },
  { title: "Filas", href: "/dashboard/queues", icon: UsersRound },
  { title: "Kanban", href: "/dashboard/kanban", icon: Kanban },
];

const operationsNavigation = [
  { title: "WhatsApp", href: "/dashboard/whatsapp", icon: PlugZap },
  { title: "Respostas rápidas", href: "/dashboard/quick-replies", icon: Zap },
  { title: "Automações", href: "/dashboard/automations", icon: Bot },
  { title: "Campanhas", href: "/dashboard/campaigns", icon: Megaphone },
  { title: "Chamadas", href: "/dashboard/calls", icon: Phone },
];

const analysisNavigation = [
  { title: "Relatórios", href: "/dashboard/reports", icon: BarChart3 },
  { title: "Documentação", href: "/dashboard/docs", icon: FileText },
];

function NavigationGroup({
  label,
  items,
}: {
  label: string;
  items: typeof mainNavigation;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map(({ title, href, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                tooltip={title}
                render={<NavLink to={href} />}
              >
                <Icon />
                <span>{title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500 text-emerald-950">
            <MessageCircle className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="font-bold tracking-tight">Klozer</span>
            <span className="text-xs text-sidebar-foreground/60">CRM WhatsApp</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator className="mx-3 w-auto" />
      <SidebarContent>
        <NavigationGroup label="Workspace" items={mainNavigation} />
        <NavigationGroup label="Operação" items={operationsNavigation} />
        <NavigationGroup label="Análise" items={analysisNavigation} />
      </SidebarContent>
      <SidebarFooter className="p-3">
        <SidebarSeparator className="mb-3" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Configurações" render={<NavLink to="/dashboard/settings" />}>
              <Settings />
              <span>Configurações</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="Minha conta">
              <Avatar size="sm">
                <AvatarFallback>JC</AvatarFallback>
              </Avatar>
              <span className="grid flex-1 text-left text-xs leading-tight">
                <span className="truncate font-medium">Minha conta</span>
                <span className="truncate text-sidebar-foreground/60">Administrador</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
