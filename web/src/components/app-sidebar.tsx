import { NavLink } from "react-router";
import {
  ChevronRight,
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
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <MessageCircle className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="font-bold tracking-tight">Klozer</span>
            <span className="text-xs text-sidebar-foreground/60">CRM WhatsApp</span>
          </div>
        </div>
      </SidebarHeader>
      <div className="mx-3 mb-1 flex items-center gap-2 rounded-lg bg-secondary px-3 py-2 group-data-[collapsible=icon]:mx-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
        <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
        <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden"><p className="truncate text-xs font-semibold">WhatsApp conectado</p><p className="truncate text-[10px] text-sidebar-foreground/60">Sessão principal online</p></div>
        <ChevronRight className="size-4 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden" />
      </div>
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
