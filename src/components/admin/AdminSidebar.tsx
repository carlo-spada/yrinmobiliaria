import { 
  LayoutDashboard, 
  Home, 
  MapPin, 
  MessageSquare, 
  Calendar, 
  Users, 
  FileText,
  Settings,
  Activity
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '@/utils/LanguageContext';
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

export function AdminSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { t } = useLanguage();
  const currentPath = location.pathname;

  const menuItems = [
    { title: t.admin.dashboard, url: '/admin', icon: LayoutDashboard, exactMatch: true },
    { title: t.admin.properties, url: '/admin/properties', icon: Home },
    { title: t.admin.zones, url: '/admin/zones', icon: MapPin },
    { title: t.admin.inquiries, url: '/admin/inquiries', icon: MessageSquare },
    { title: t.admin.visits, url: '/admin/visits', icon: Calendar },
    { title: t.admin.users, url: '/admin/users', icon: Users },
    { title: t.admin.auditLogs, url: '/admin/audit-logs', icon: FileText },
    { title: t.admin.health, url: '/admin/health', icon: Activity },
    { title: t.admin.settings, url: '/admin/settings', icon: Settings },
  ];

  return (
    <Sidebar className={open ? 'w-64' : 'w-14'}>
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
