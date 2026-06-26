import { UserRole } from '@/contexts/AuthContextBase';
import { useAuthContext } from '@/contexts/useAuthContext';

export type { UserRole };

export interface UserRoleData {
  role: UserRole;
  isStaff: boolean;
  isSuperadmin: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  loading: boolean;
}

/**
 * Hook to determine user's role and permissions.
 * Uses the shared AuthContext for consistent state across the app.
 *
 * Role hierarchy (single-tenant):
 * - superadmin: Full system access
 * - admin: Manage all resources
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
    loading: context.roleLoading,
  };
}
