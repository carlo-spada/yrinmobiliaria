import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ProfileCompletionGuard } from '@/components/auth/ProfileCompletionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: ReactNode;
}

// Inner component that has access to sidebar context
const AdminLayoutContent = ({ children }: { children: ReactNode }) => {
  const { open } = useSidebar();

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar space reservation - width changes based on open state */}
      <div className={cn(
        "flex-shrink-0 transition-all duration-200",
        open ? "w-64" : "w-14"
      )}>
        <AdminSidebar />
      </div>
      {/* Main content - starts after sidebar space */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 bg-background overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth with return URL
    return <Navigate to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!isAdmin) {
    // Show access denied message instead of silent redirect
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Acceso Denegado</CardTitle>
            </div>
            <CardDescription>
              No tienes permisos de administrador para acceder a esta página.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta área está restringida solo para administradores del sistema.
              Si crees que deberías tener acceso, contacta al administrador principal.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.href = '/'} variant="default">
                Ir al Inicio
              </Button>
              <Button onClick={() => window.location.href = '/cuenta'} variant="outline">
                Mi Cuenta
              </Button>
            </div>
            <div className="text-xs text-muted-foreground pt-4 border-t">
              <p className="font-mono">Usuario: {user.email}</p>
              <p className="font-mono">ID: {user.id}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ProfileCompletionGuard>
      <SidebarProvider defaultOpen={true}>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </ProfileCompletionGuard>
  );
};
