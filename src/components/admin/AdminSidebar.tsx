import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Home,
  MapPin,
  MessageSquare,
  Calendar,
  Users,
  UserPlus,
  UserCircle,
  FileText,
  Settings,
  Activity,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/utils/LanguageContext';
import { useUserRole } from '@/hooks/useUserRole';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  exactMatch?: boolean;
  roles: ('superadmin' | 'admin' | 'agent')[];
}

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { t } = useLanguage();
  const { role } = useUserRole();
  const currentPath = location.pathname;

  // Define all menu items with role-based access
  const allMenuItems: MenuItem[] = [
    {
      title: t.admin.dashboard,
      url: '/admin',
      icon: LayoutDashboard,
      exactMatch: true,
      roles: ['superadmin', 'admin', 'agent']
    },
    {
      title: t.admin.properties,
      url: '/admin/properties',
      icon: Home,
      roles: ['superadmin', 'admin', 'agent']
    },
    {
      title: "Agentes",
      url: '/admin/agents',
      icon: UserPlus,
      roles: ['superadmin', 'admin']
    },
    {
      title: t.admin.zones,
      url: '/admin/zones',
      icon: MapPin,
      roles: ['superadmin', 'admin']
    },
    {
      title: t.admin.inquiries,
      url: '/admin/inquiries',
      icon: MessageSquare,
      roles: ['superadmin', 'admin', 'agent']
    },
    {
      title: t.admin.visits,
      url: '/admin/visits',
      icon: Calendar,
      roles: ['superadmin', 'admin', 'agent']
    },
    {
      title: t.admin.users,
      url: '/admin/users',
      icon: Users,
      roles: ['superadmin', 'admin']
    },
    {
      title: t.admin.profile,
      url: '/admin/profile',
      icon: UserCircle,
      roles: ['agent'] // Agents see profile instead of settings
    },
    {
      title: t.admin.auditLogs,
      url: '/admin/audit-logs',
      icon: FileText,
      roles: ['superadmin', 'admin']
    },
    {
      title: t.admin.health,
      url: '/admin/health',
      icon: Activity,
      roles: ['superadmin', 'admin']
    },
    {
      title: t.admin.settings,
      url: '/admin/settings',
      icon: Settings,
      roles: ['superadmin', 'admin']
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item =>
    item.roles.includes(role as 'superadmin' | 'admin' | 'agent')
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={!open ? 'sr-only' : ''}>
            {t.admin.dashboard}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = item.exactMatch 
                  ? currentPath === item.url 
                  : currentPath.startsWith(item.url);
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url}
                        className="hover:bg-accent"
                        activeClassName="bg-accent text-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4" />
                        {open && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
