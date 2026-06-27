'use client';

import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { type ReactNode } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useUserRole, type UserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Navigate, useLocation } from '@/lib/router-compat';
import { logger } from '@/utils/logger';

import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { PageLoader } from '../ui/page-loader';

/**
 * Guards de ruta nativos para el grupo privado de Next (App Router).
 *
 * Son la versión "sin react-router" de RouteAccessGuard + ProfileCompletionGuard:
 * usan el shim @/lib/router-compat (next/navigation) en lugar de react-router-dom,
 * por lo que funcionan en páginas Next nativas sin BrowserRouter. La isla legacy
 * (admin, durante el port incremental) conserva sus propios guards de react-router
 * hasta que se elimine; estos guards la reemplazan ruta a ruta.
 */

const buildAuthRedirect = (pathname: string, search: string) =>
  `/auth?redirect=${encodeURIComponent(`${pathname}${search}`)}`;

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to={buildAuthRedirect(location.pathname, location.search)} replace />;
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
  const location = useLocation();

  if (authLoading || roleLoading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to={buildAuthRedirect(location.pathname, location.search)} replace />;
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

export function RequireCompleteProfile({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const location = useLocation();
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
    return <Navigate to={buildAuthRedirect(location.pathname, location.search)} replace />;
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
