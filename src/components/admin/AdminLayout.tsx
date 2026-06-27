import { AlertTriangle } from 'lucide-react';
import { ReactNode, useState } from 'react';

import { RequireCompleteProfile } from '@/components/auth/NativeRouteGuards';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useLocation, useNavigate } from '@/lib/router-compat';

import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-open';

interface AdminLayoutProps {
  children: ReactNode;
}

// Locked-viewport dashboard shell. The whole screen is partitioned into strict,
// non-overlapping regions:
//   ┌────────────┬──────────────────────┐
//   │            │  header (top)        │
//   │  sidebar   ├──────────────────────┤
//   │  (in-flow) │  main (scrolls)      │
//   └────────────┴──────────────────────┘
// The sidebar is an in-flow flex column (never `fixed`/`absolute`), so it
// physically reserves its own width and nothing can slide on top of it.
const AdminLayoutContent = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isStaff, role, loading: roleLoading } = useUserRole();
  const location = useLocation();
  const navigate = useNavigate();

  // Persist sidebar open state - use useState with initializer
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true; // Default to open
    } catch {
      return true;
    }
  });

  const handleSidebarChange = (open: boolean) => {
    setSidebarOpen(open);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
    } catch {
      // localStorage not available
    }
  };

  const loading = authLoading || roleLoading;

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

  if (!isStaff) {
    // Show access denied message for non-staff users
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Acceso Denegado</CardTitle>
            </div>
            <CardDescription>
              No tienes permisos para acceder al panel de administración.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Esta área está restringida solo para administradores y agentes del sistema.
              Si crees que deberías tener acceso, contacta al administrador principal.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/')} variant="default">
                Ir al Inicio
              </Button>
              <Button onClick={() => navigate('/cuenta')} variant="outline">
                Mi Cuenta
              </Button>
            </div>
            <div className="text-xs text-muted-foreground pt-4 border-t">
              <p className="font-mono">Usuario: {user.email}</p>
              <p className="font-mono">Rol: {role}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <RequireCompleteProfile>
      <ErrorBoundary>
        <SidebarProvider open={sidebarOpen} onOpenChange={handleSidebarChange}>
          <AdminLayoutContent>
            {children}
          </AdminLayoutContent>
        </SidebarProvider>
      </ErrorBoundary>
    </RequireCompleteProfile>
  );
};
