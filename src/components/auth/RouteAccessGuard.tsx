import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { useUserRole, type UserRole } from '@/hooks/useUserRole';

import { PageLoader } from '../ui/page-loader';

interface RequireAuthProps {
  children: ReactNode;
}

interface RequireRoleProps extends RequireAuthProps {
  allowedRoles: UserRole[];
  unauthorizedRedirectTo?: string;
}

const buildAuthRedirect = (pathname: string, search: string) =>
  `/auth?redirect=${encodeURIComponent(`${pathname}${search}`)}`;

export function RequireAuth({ children }: RequireAuthProps) {
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
}: RequireRoleProps) {
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

  return <>{children}</>;
}
