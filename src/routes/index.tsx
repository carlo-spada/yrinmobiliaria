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
  { path: "/", element: lazyPage(() => import("@/pages/Index")) },
  { path: "/propiedades", element: lazyPage(() => import("@/pages/Properties")) },
  { path: "/propiedad/:id", element: lazyPage(() => import("@/pages/PropertyDetail")) },
  { path: "/favoritos", element: lazyPage(() => import("@/pages/Favorites")) },
  { path: "/mapa", element: lazyPage(() => import("@/pages/MapView")) },
  { path: "/contacto", element: lazyPage(() => import("@/pages/Contact")) },
  { path: "/agendar", element: lazyPage(() => import("@/pages/ScheduleVisit")) },
  { path: "/nosotros", element: lazyPage(() => import("@/pages/About")) },
  { path: "/privacidad", element: lazyPage(() => import("@/pages/PrivacyPolicy")) },
  { path: "/terminos", element: lazyPage(() => import("@/pages/TermsOfService")) },
  { path: "/agentes", element: lazyPage(() => import("@/pages/AgentDirectory")) },
  { path: "/agentes/:slug", element: lazyPage(() => import("@/pages/AgentProfile")) },
];

const authenticatedRoutes: AppRoute[] = [
  { path: "/auth", element: lazyPage(() => import("@/pages/Auth")) },
  { path: "/auth/accept-invitation", element: lazyPage(() => import("@/pages/auth/AcceptInvitation")) },
  {
    path: "/onboarding/complete-profile",
    element: withAuth(lazyPage(() => import("@/pages/onboarding/CompleteProfile"))),
  },
  { path: "/cuenta", element: lazyPage(() => import("@/pages/user/UserDashboard")) },
  {
    path: "/agent/dashboard",
    element: withRole(lazyPage(() => import("@/pages/agent/AgentDashboard")), ['agent', 'admin', 'superadmin'], {
      requireCompletedProfile: true,
    }),
  },
  {
    path: "/agent/profile/edit",
    element: withRole(lazyPage(() => import("@/pages/agent/EditProfile")), ['agent', 'admin', 'superadmin'], {
      requireCompletedProfile: true,
    }),
  },
  { path: "/admin", element: lazyPage(() => import("@/pages/admin/AdminDashboard")) },
  { path: "/admin/profile", element: lazyPage(() => import("@/pages/admin/AdminEditProfile")) },
  { path: "/admin/properties", element: lazyPage(() => import("@/pages/admin/AdminProperties")) },
  { path: "/admin/agents", element: lazyPage(() => import("@/pages/admin/AdminAgents")) },
  { path: "/admin/zones", element: lazyPage(() => import("@/pages/admin/AdminZones")) },
  { path: "/admin/inquiries", element: lazyPage(() => import("@/pages/admin/AdminInquiries")) },
  { path: "/admin/visits", element: lazyPage(() => import("@/pages/admin/AdminVisits")) },
  { path: "/admin/users", element: lazyPage(() => import("@/pages/admin/AdminUsers")) },
  { path: "/admin/audit-logs", element: lazyPage(() => import("@/pages/admin/AdminAuditLogs")) },
  { path: "/admin/settings", element: lazyPage(() => import("@/pages/admin/AdminSettings")) },
  { path: "/admin/health", element: lazyPage(() => import("@/pages/admin/AdminHealth")) },
  { path: "/admin/cms", element: lazyPage(() => import("@/pages/admin/AdminCMS")) },
  { path: "/admin/seed", element: lazyPage(() => import("@/pages/admin/DatabaseSeed")) },
  { path: "/admin/schema-builder", element: lazyPage(() => import("@/pages/admin/SchemaBuilder")) },
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
        <Route path="*" element={lazyPage(() => import("@/pages/NotFound"))} />
      </Routes>
    </Suspense>
  );
}
