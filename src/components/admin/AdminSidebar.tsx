import { 
  LayoutDashboard, 
  Home, 
  MapPin, 
  MessageSquare, 
  Calendar, 
  Users, 
  FileText,
  Settings
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
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

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard, exactMatch: true },
  { title: 'Propiedades', url: '/admin/properties', icon: Home },
  { title: 'Zonas de Servicio', url: '/admin/zones', icon: MapPin },
  { title: 'Consultas', url: '/admin/inquiries', icon: MessageSquare },
  { title: 'Visitas Agendadas', url: '/admin/visits', icon: Calendar },
  { title: 'Usuarios', url: '/admin/users', icon: Users },
  { title: 'Registro de Actividad', url: '/admin/audit-logs', icon: FileText },
  { title: 'Configuración', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar className={open ? 'w-64' : 'w-14'}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={!open ? 'sr-only' : ''}>
            Administración
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
