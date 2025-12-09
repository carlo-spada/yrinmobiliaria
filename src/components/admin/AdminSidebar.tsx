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
  X,
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
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAdminOrg } from './AdminOrgContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const { open, isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();
  const { t } = useLanguage();
  const { role, isSuperadmin, isAdmin, isAgent } = useUserRole();
  const { profile } = useAuth();
  const { selectedOrgId, isAllOrganizations, canViewAll } = useAdminOrg();
  const currentPath = location.pathname;

  // Fetch the organization name for display
  const { data: selectedOrg } = useQuery({
    queryKey: ['org-name', selectedOrgId],
    queryFn: async () => {
      if (!selectedOrgId || selectedOrgId === 'all') return null;
      const { data, error } = await supabase
        .from('organizations')
        .select('name, slug')
        .eq('id', selectedOrgId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!selectedOrgId && selectedOrgId !== 'all',
  });

  // For non-superadmins, fetch their own org name
  const { data: userOrg } = useQuery({
    queryKey: ['user-org', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      const { data, error } = await supabase
        .from('organizations')
        .select('name, slug')
        .eq('id', profile.organization_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !canViewAll && !!profile?.organization_id,
  });

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
      {/* Mobile Header */}
      {isMobile && (
        <SidebarHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-semibold text-lg">Admin</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpenMobile(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar menú</span>
            </Button>
          </div>
        </SidebarHeader>
      )}
      <SidebarContent>
        {visibleGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className={!open && !isMobile ? 'sr-only' : ''}>
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
                          <item.icon className="h-4 w-4" />
                          {(open || isMobile) && <span>{item.title}</span>}
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

      {/* Organization indicator footer */}
      <SidebarFooter className="border-t p-3">
        <div className="flex items-center gap-2 text-xs">
          <Building2 className="h-4 w-4 text-primary shrink-0" />
          {(open || isMobile) && (
            <div className="min-w-0 flex-1">
              {canViewAll ? (
                // Superadmin view
                isAllOrganizations ? (
                  <span className="text-muted-foreground font-medium">Todas las Orgs</span>
                ) : (
                  <span className="font-medium text-foreground truncate block">
                    {selectedOrg?.name || 'Cargando...'}
                  </span>
                )
              ) : (
                // Admin/Agent view - show their org
                <span className="font-medium text-foreground truncate block">
                  {userOrg?.name || profile?.organization_id ? 'Cargando...' : 'Sin organización'}
                </span>
              )}
              <span className="text-muted-foreground text-[10px]">
                {canViewAll ? 'Contexto actual' : 'Tu organización'}
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
