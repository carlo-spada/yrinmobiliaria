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
import { useState } from 'react';

export const AdminHeader = () => {
  const { user, signOut } = useAuth();
  const { isSuperadmin, organizationId } = useUserRole();
  const navigate = useNavigate();
  const [selectedOrg, setSelectedOrg] = useState<string>(organizationId || 'all');

  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: isSuperadmin,
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
    // In a real implementation, this would update a global context
    // that all data fetching hooks subscribe to.
    toast.info(`Cambiando contexto a: ${organizations?.find(o => o.id === value)?.name || 'Todas'}`);
  };

  return (
    <header className="h-16 border-b flex items-center justify-between px-6 bg-card">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold hidden md:block">Panel de Administración</h1>
      </div>

      <div className="flex items-center gap-4">
        {isSuperadmin && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedOrg} onValueChange={handleOrgChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar Org" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Organizaciones</SelectItem>
                {organizations?.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm border-l pl-4">
          <User className="h-4 w-4" />
          <span className="text-muted-foreground hidden sm:inline-block">{user?.email}</span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Cerrar Sesión">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
