import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { LogOut, User, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useAdminOrg } from './AdminOrgContext';

export const AdminHeader = () => {
  const { user, signOut } = useAuth();
  const { isSuperadmin } = useUserRole();
  const { selectedOrgId, setSelectedOrgId, canViewAll } = useAdminOrg();
  const navigate = useNavigate();
  const [selectedOrg, setSelectedOrg] = useState<string>(selectedOrgId ?? 'all');

  // Always fetch organizations for superadmins - don't filter by is_active to get all
  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['admin-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('name');
      if (error) {
        console.error('Error fetching organizations:', error);
        throw error;
      }
      console.log('Organizations fetched:', data);
      return data ?? [];
    },
    enabled: isSuperadmin && canViewAll,
  });

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
    } else {
      toast.success('Sesión cerrada correctamente');
      navigate('/');
    }
  };

  const handleOrgChange = (value: string) => {
    setSelectedOrg(value);
    setSelectedOrgId(value);
    const orgName = value === 'all' ? 'Todas' : organizations?.find(o => o.id === value)?.name || value;
    toast.info(`Contexto: ${orgName}`);
  };

  useEffect(() => {
    setSelectedOrg(selectedOrgId ?? 'all');
  }, [selectedOrgId]);

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 md:px-6 bg-card shrink-0 w-full">
      <div className="flex items-center gap-4 min-w-0">
        <SidebarTrigger className="shrink-0" />
        <h1 className="text-xl font-semibold hidden md:block truncate">Panel de Administración</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        {isSuperadmin && canViewAll && (
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
            <Select value={selectedOrg} onValueChange={handleOrgChange}>
              <SelectTrigger className="w-[140px] md:w-[200px]">
                <SelectValue placeholder={orgsLoading ? "Cargando..." : "Seleccionar Org"} />
              </SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">Todas las Organizaciones</SelectItem>
                {organizations && organizations.length > 0 ? (
                  organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))
                ) : (
                  !orgsLoading && <SelectItem value="none" disabled>No hay organizaciones</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm border-l pl-2 md:pl-4 min-w-0">
          <User className="h-4 w-4 shrink-0" />
          <span className="text-muted-foreground hidden sm:inline-block truncate max-w-[120px] md:max-w-[200px]">{user?.email}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Cerrar Sesión" className="shrink-0">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};