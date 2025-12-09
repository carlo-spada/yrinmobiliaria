import { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Navigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { ProfileCompletionGuard } from '@/components/auth/ProfileCompletionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AdminOrgProvider } from './AdminOrgContext';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-open';

interface AdminLayoutProps {
  children: ReactNode;
}

// Inner component that has access to sidebar context
const AdminLayoutContent = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <AdminSidebar />
      <SidebarInset>
        <AdminHeader />
        <div className="flex-1 p-4 md:p-6 bg-background overflow-auto">
          {children}
        </div>
      </SidebarInset>
    </>
  );
};

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, loading: authLoading, profile } = useAuth();
  const { isStaff, role, loading: roleLoading, isSuperadmin } = useUserRole();
  const location = useLocation();

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
  // Don't show org warning for superadmins - they have access to all orgs
  const showOrgWarning = !!profile && !profile.organization_id && !isSuperadmin;

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
              <Button onClick={() => window.location.href = '/'} variant="default">
                Ir al Inicio
              </Button>
              <Button onClick={() => window.location.href = '/cuenta'} variant="outline">
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
    <ProfileCompletionGuard>
      <AdminOrgProvider organizationId={profile?.organization_id ?? null} canViewAll={isSuperadmin}>
        <SidebarProvider open={sidebarOpen} onOpenChange={handleSidebarChange}>
          <AdminLayoutContent>
            {showOrgWarning && (
              <Alert variant="default" className="mb-4 border-amber-500/40 bg-amber-50 text-amber-900">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Falta organización</AlertTitle>
                <AlertDescription>
                  No se detectó organización en tu perfil. Algunas acciones pueden fallar por políticas de acceso.
                  Contacta a un administrador para asignarte a una organización.
                </AlertDescription>
              </Alert>
            )}
            {children}
          </AdminLayoutContent>
        </SidebarProvider>
      </AdminOrgProvider>
    </ProfileCompletionGuard>
  );
};