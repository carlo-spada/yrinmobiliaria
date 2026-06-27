import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Home,
  MapPin,
  MessageSquare,
  Calendar,
  Users,
  UserCircle,
  Settings,
  Activity,
  Building2,
} from 'lucide-react';
import { useMemo } from 'react';


import { NavLink } from '@/components/NavLink';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import {
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
import { useUserRole } from '@/hooks/useUserRole';
import { useLocation } from '@/lib/router-compat';
import { cn } from '@/lib/utils';

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
  const { open, isMobile, openMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const { role } = useUserRole();
  const currentPath = location.pathname;

  // Close mobile sidebar when navigating
  const handleNavClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

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
          title: 'Salud del Sistema',
          url: '/admin/health',
          icon: Activity,
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

  // Filter groups and their items based on user role (memoized for performance)
  const visibleGroups = useMemo(() =>
    menuGroups
      .filter(group => hasAccess(group.roles))
      .map(group => ({
        ...group,
        items: group.items.filter(item => hasAccess(item.roles)),
      }))
      .filter(group => group.items.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [role] // Only recompute when role changes
  );

  // Whether item labels (text) should be shown. On mobile the drawer is always
  // expanded; on desktop it follows the collapse state.
  const showLabels = open || isMobile;

  const navContent = (
    <SidebarContent>
      {visibleGroups.map((group, groupIndex) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel className={!showLabels ? 'sr-only' : ''}>
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
                        onClick={handleNavClick}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {showLabels && <span>{item.title}</span>}
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
  );

  return (
    <>
      {/*
        Desktop sidebar — an IN-FLOW grid/flex column. It physically occupies
        its own width (never `fixed`/`absolute`), so the header and main content
        can never overlap it. Width follows the collapse state.
      */}
      <aside
        className={cn(
          'hidden md:flex md:h-full md:shrink-0 md:flex-col',
          'overflow-y-auto border-r border-sidebar-border bg-sidebar text-sidebar-foreground',
          'transition-[width] duration-200 ease-linear',
          open ? 'md:w-64' : 'md:w-16',
        )}
      >
        {navContent}
      </aside>

      {/* Mobile sidebar — off-canvas drawer that overlays only when opened. */}
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          side="left"
          className="w-72 bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground"
        >
          <SheetTitle className="flex items-center gap-2 border-b px-4 py-3 text-lg font-semibold">
            <Building2 className="h-5 w-5 text-primary" />
            Admin
          </SheetTitle>
          <div className="flex h-full w-full flex-col overflow-y-auto">{navContent}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}
