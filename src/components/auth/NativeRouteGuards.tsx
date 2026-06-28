'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type ReactNode } from 'react';

import { Navigate } from '@/components/nav/Navigate';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, type UserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { PageLoader } from '../ui/page-loader';

/**
 * Guards de ruta nativos para el grupo privado de Next (App Router).
 *
 * Usan `next/navigation` (usePathname/useSearchParams/useRouter) y el componente
 * `Navigate` (@/components/nav/Navigate) directamente. Se montan a nivel de
 * layout de ruta en `app/(app)/<group>/layout.tsx`.
 */

const buildAuthRedirect = (pathname: string, search: string) =>
  `/auth?redirect=${encodeURIComponent(`${pathname}${search}`)}`;

// `useSearchParams()` de Next devuelve los params en modo lectura; los
// serializamos al formato `?a=b` que espera buildAuthRedirect.
const toSearch = (sp: { toString(): string }): string => {
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to={buildAuthRedirect(pathname, toSearch(searchParams))} replace />;
  }

  return <>{children}</>;
}

export function RequireRole({
  allowedRoles,
  children,
  unauthorizedRedirectTo = '/',
  requireCompletedProfile = false,
}: {
  allowedRoles: UserRole[];
  children: ReactNode;
  unauthorizedRedirectTo?: string;
  requireCompletedProfile?: boolean;
}) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();

  if (authLoading || roleLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to={buildAuthRedirect(pathname, toSearch(searchParams))} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={unauthorizedRedirectTo} replace />;
  }

  return requireCompletedProfile ? (
    <RequireCompleteProfile>{children}</RequireCompleteProfile>
  ) : (
    <>{children}</>
  );
}

/**
 * Guard de "staff" (agent/admin/superadmin) para el panel `/admin`.
 *
 * Reemplaza el guard que vivía dentro de `AdminLayout`: aplica la misma cadena
 * auth → isStaff → perfil completo, pero a nivel de layout de ruta
 * (`app/(app)/admin/layout.tsx`) para que ningún screen del panel pueda quedar
 * sin proteger. Usa `isStaff` (no una lista de roles fija) para preservar la
 * semántica exacta actual (isStaff = agent | admin | superadmin). Conserva la
 * tarjeta "Acceso Denegado" (con email/rol + accesos directos) para usuarios
 * autenticados sin permisos, en lugar de un redirect silencioso.
 */
export function RequireStaff({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { isStaff, role, loading: roleLoading } = useUserRole();
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const router = useRouter();

  if (authLoading || roleLoading) {
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
    return <Navigate to={buildAuthRedirect(pathname, toSearch(searchParams))} replace />;
  }

  if (!isStaff) {
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
              <Button onClick={() => router.push('/')} variant="default">
                Ir al Inicio
              </Button>
              <Button onClick={() => router.push('/cuenta')} variant="outline">
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

  return <RequireCompleteProfile>{children}</RequireCompleteProfile>;
}

export function RequireCompleteProfile({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const pathname = usePathname() ?? '';
  const searchParams = useSearchParams();
  const shouldEnforceCompletion = !!user && role === 'agent';

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['profile-completion', user?.id],
    queryFn: async () => {
      if (!user) {
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('is_complete')
        .eq('user_id', user.id)
        .single();

      if (error) {
        logger.error('Error fetching profile:', error);
        throw error;
      }

      return data;
    },
    enabled: shouldEnforceCompletion,
    retry: false,
  });

  if (authLoading || roleLoading || (shouldEnforceCompletion && isLoading)) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to={buildAuthRedirect(pathname, toSearch(searchParams))} replace />;
  }

  if (!shouldEnforceCompletion) {
    return <>{children}</>;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>No pudimos validar tu perfil</CardTitle>
            </div>
            <CardDescription>
              La validación del perfil falló. Reintenta antes de continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => void refetch()} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile?.is_complete) {
    return <Navigate to="/onboarding/complete-profile" replace />;
  }

  return <>{children}</>;
}
