import { useAuthContext } from '@/contexts/useAuthContext';
import { UserRole } from '@/contexts/AuthContextBase';

export type { UserRole };

export interface UserRoleData {
  role: UserRole;
  isStaff: boolean;
  isSuperadmin: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  organizationId: string | null;
  loading: boolean;
}

/**
 * Hook to determine user's role and permissions.
 * Uses the shared AuthContext for consistent state across the app.
 *
 * Role hierarchy:
 * - superadmin: Full system access, no org scoping
 * - admin: Org-scoped access, can manage org resources
 * - agent: Limited access to own properties/inquiries/visits
 * - user: Regular customer, no admin access
 */
export function useUserRole(): UserRoleData {
  const context = useAuthContext();

  return {
    role: context.role,
    isStaff: context.isStaff,
    isSuperadmin: context.isSuperadmin,
    isAdmin: context.isAdmin,
    isAgent: context.isAgent,
    organizationId: context.organizationId,
    loading: context.roleLoading,
  };
}
