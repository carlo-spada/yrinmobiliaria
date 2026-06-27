import { Suspense, lazy, type ComponentType, type ReactElement } from "react";
import { Route, Routes } from "react-router-dom";

import { ProfileCompletionGuard } from "@/components/auth/ProfileCompletionGuard";
import { RequireAuth, RequireRole } from "@/components/auth/RouteAccessGuard";
import { AuthenticatedAppShell } from "@/components/layout/AuthenticatedAppShell";
import { PublicAppShell } from "@/components/layout/PublicAppShell";
import { PageLoader } from "@/components/ui/page-loader";
import type { UserRole } from "@/hooks/useUserRole";

type LazyComponent = () => Promise<{ default: ComponentType<unknown> }>;

const lazyPage = (loader: LazyComponent): ReactElement => {
  const Component = lazy(loader);
  return <Component />;
};

type AppRoute = {
  path: string;
  element: ReactElement;
};

const withAuth = (element: ReactElement): ReactElement => <RequireAuth>{element}</RequireAuth>;

const withRole = (
  element: ReactElement,
  allowedRoles: UserRole[],
  options?: { requireCompletedProfile?: boolean }
): ReactElement => (
  <RequireRole allowedRoles={allowedRoles}>
    {options?.requireCompletedProfile ? (
      <ProfileCompletionGuard>{element}</ProfileCompletionGuard>
    ) : (
      element
    )}
  </RequireRole>
);

const publicRoutes: AppRoute[] = [
  { path: "/", element: lazyPage(() => import("@/screens/Index")) },
  { path: "/propiedades", element: lazyPage(() => import("@/screens/Properties")) },
  { path: "/propiedad/:id", element: lazyPage(() => import("@/screens/PropertyDetail")) },
  { path: "/favoritos", element: lazyPage(() => import("@/screens/Favorites")) },
  { path: "/mapa", element: lazyPage(() => import("@/screens/MapView")) },
  { path: "/contacto", element: lazyPage(() => import("@/screens/Contact")) },
  { path: "/agendar", element: lazyPage(() => import("@/screens/ScheduleVisit")) },
  { path: "/nosotros", element: lazyPage(() => import("@/screens/About")) },
  { path: "/privacidad", element: lazyPage(() => import("@/screens/PrivacyPolicy")) },
  { path: "/terminos", element: lazyPage(() => import("@/screens/TermsOfService")) },
  { path: "/agentes", element: lazyPage(() => import("@/screens/AgentDirectory")) },
  { path: "/agentes/:slug", element: lazyPage(() => import("@/screens/AgentProfile")) },
];

const authenticatedRoutes: AppRoute[] = [
  { path: "/auth", element: lazyPage(() => import("@/screens/Auth")) },
  { path: "/auth/accept-invitation", element: lazyPage(() => import("@/screens/auth/AcceptInvitation")) },
  {
    path: "/onboarding/complete-profile",
    element: withAuth(lazyPage(() => import("@/screens/onboarding/CompleteProfile"))),
  },
  { path: "/cuenta", element: lazyPage(() => import("@/screens/user/UserDashboard")) },
  {
    path: "/agent/dashboard",
    element: withRole(lazyPage(() => import("@/screens/agent/AgentDashboard")), ['agent', 'admin', 'superadmin'], {
      requireCompletedProfile: true,
    }),
  },
  {
    path: "/agent/profile/edit",
    element: withRole(lazyPage(() => import("@/screens/agent/EditProfile")), ['agent', 'admin', 'superadmin'], {
      requireCompletedProfile: true,
    }),
  },
  { path: "/admin", element: lazyPage(() => import("@/screens/admin/AdminDashboard")) },
  { path: "/admin/profile", element: lazyPage(() => import("@/screens/admin/AdminEditProfile")) },
  { path: "/admin/properties", element: lazyPage(() => import("@/screens/admin/AdminProperties")) },
  { path: "/admin/agents", element: lazyPage(() => import("@/screens/admin/AdminAgents")) },
  { path: "/admin/zones", element: lazyPage(() => import("@/screens/admin/AdminZones")) },
  { path: "/admin/inquiries", element: lazyPage(() => import("@/screens/admin/AdminInquiries")) },
  { path: "/admin/visits", element: lazyPage(() => import("@/screens/admin/AdminVisits")) },
  { path: "/admin/users", element: lazyPage(() => import("@/screens/admin/AdminUsers")) },
  { path: "/admin/audit-logs", element: lazyPage(() => import("@/screens/admin/AdminAuditLogs")) },
  { path: "/admin/settings", element: lazyPage(() => import("@/screens/admin/AdminSettings")) },
  { path: "/admin/health", element: lazyPage(() => import("@/screens/admin/AdminHealth")) },
  { path: "/admin/cms", element: lazyPage(() => import("@/screens/admin/AdminCMS")) },
];

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicAppShell />}>
          {publicRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
        <Route element={<AuthenticatedAppShell />}>
          {authenticatedRoutes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Route>
        <Route path="*" element={lazyPage(() => import("@/screens/NotFound"))} />
      </Routes>
    </Suspense>
  );
}
