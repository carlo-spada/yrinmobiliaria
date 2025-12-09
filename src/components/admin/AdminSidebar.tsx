import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Home,
  MapPin,
  MessageSquare,
  Calendar,
  Users,
  UserCircle,
  FileText,
  Settings,
  Activity,
  Database,
  Building2,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/utils/LanguageContext';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';

type AllowedRole = 'superadmin' | 'admin' | 'agent' | 'user';

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
  exactMatch?: boolean;
  roles: AllowedRole[];
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
  roles: AllowedRole[];
}

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { t } = useLanguage();
  const { role, isSuperadmin, isAdmin, isAgent } = useUserRole();
  const currentPath = location.pathname;

  // Define menu groups with role-based access
  const menuGroups: MenuGroup[] = [
    {
      label: 'General',
      roles: ['superadmin', 'admin', 'agent', 'user'],
      items: [
        {
          title: 'Dashboard',
          url: '/admin',
          icon: LayoutDashboard,
          exactMatch: true,
          roles: ['superadmin', 'admin', 'agent'],
        },
        {
          title: 'Mi Perfil',
          url: '/admin/profile',
          icon: UserCircle,
          roles: ['superadmin', 'admin', 'agent', 'user'],
        },
      ],
    },
    {
      label: 'Operaciones',
      roles: ['superadmin', 'admin', 'agent'],
      items: [
        {
          title: 'Propiedades',
          url: '/admin/properties',
          icon: Home,
          roles: ['superadmin', 'admin', 'agent'],
        },
        {
          title: 'Consultas',
          url: '/admin/inquiries',
          icon: MessageSquare,
          roles: ['superadmin', 'admin', 'agent'],
        },
        {
          title: 'Visitas',
          url: '/admin/visits',
          icon: Calendar,
          roles: ['superadmin', 'admin', 'agent'],
        },
      ],
    },
    {
      label: 'Administración',
      roles: ['superadmin', 'admin'],
      items: [
        {
          title: 'Usuarios',
          url: '/admin/users',
          icon: Users,
          roles: ['superadmin', 'admin'],
        },
        {
          title: 'Agentes',
          url: '/admin/agents',
          icon: UserCircle,
          roles: ['superadmin', 'admin'],
        },
        {
          title: 'Zonas',
          url: '/admin/zones',
          icon: MapPin,
          roles: ['superadmin', 'admin'],
        },
        {
          title: 'Configuración',
          url: '/admin/settings',
          icon: Settings,
          roles: ['superadmin', 'admin'],
        },
        {
          title: 'Actividad',
          url: '/admin/audit-logs',
          icon: Activity,
          roles: ['superadmin', 'admin'],
        },
      ],
    },
    {
      label: 'Sistema',
      roles: ['superadmin'],
      items: [
        {
          title: 'Organizaciones',
          url: '/admin/settings',
          icon: Building2,
          roles: ['superadmin'],
        },
        {
          title: 'Salud del Sistema',
          url: '/admin/health',
          icon: Activity,
          roles: ['superadmin'],
        },
        {
          title: 'Schema Builder',
          url: '/admin/schema-builder',
          icon: Database,
          roles: ['superadmin'],
        },
        {
          title: 'Seed Database',
          url: '/admin/seed',
          icon: FileText,
          roles: ['superadmin'],
        },
      ],
    },
  ];

  // Check if user has access to an item
  const hasAccess = (roles: AllowedRole[]): boolean => {
    if (!role) return false;
    return roles.includes(role as AllowedRole);
  };

  // Filter groups and their items based on user role
  const visibleGroups = menuGroups
    .filter(group => hasAccess(group.roles))
    .map(group => ({
      ...group,
      items: group.items.filter(item => hasAccess(item.roles)),
    }))
    .filter(group => group.items.length > 0);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        {visibleGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className={!open ? 'sr-only' : ''}>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = item.exactMatch
                    ? currentPath === item.url
                    : currentPath.startsWith(item.url) && item.url !== '/admin';

                  // Special case for dashboard - only active on exact match
                  const isDashboardActive = item.url === '/admin' && currentPath === '/admin';
                  const finalIsActive = item.url === '/admin' ? isDashboardActive : isActive;

                  return (
                    <SidebarMenuItem key={item.url + item.title}>
                      <SidebarMenuButton asChild isActive={finalIsActive}>
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
            {groupIndex < visibleGroups.length - 1 && <SidebarSeparator />}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
