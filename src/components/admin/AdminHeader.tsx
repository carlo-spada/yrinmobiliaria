import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';

export const AdminHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Error al cerrar sesión');
    } else {
      toast.success('Sesión cerrada correctamente');
      navigate('/');
    }
  };

  return (
    <header className="h-14 md:h-16 border-b flex items-center justify-between px-3 md:px-6 bg-card shrink-0 w-full">
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <SidebarTrigger className="shrink-0" />
        <h1 className="text-base md:text-xl font-semibold truncate">Panel Admin</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4 min-w-0">
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
