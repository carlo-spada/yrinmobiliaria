import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'superadmin' | 'admin' | 'agent' | 'user' | 'client';

export interface UserRoleData {
  role: UserRole;
  isStaff: boolean; // true for superadmin, admin, or agent
  isSuperadmin: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  organizationId: string | null;
  loading: boolean;
}

/**
 * Hook to determine user's role and permissions
 *
 * Role hierarchy:
 * - superadmin: Full system access, no org scoping
 * - admin: Org-scoped access, can manage org resources
 * - agent: Limited access to own properties/inquiries/visits
 * - user: Regular customer, no admin access
 */
export function useUserRole() {
  const { user } = useAuth();
  const [roleData, setRoleData] = useState<UserRoleData>({
    role: 'user',
    isStaff: false,
    isSuperadmin: false,
    isAdmin: false,
    isAgent: false,
    organizationId: null,
    loading: true,
  });

  useEffect(() => {
    async function checkRole() {
      if (!user) {
        setRoleData({
          role: 'user',
          isStaff: false,
          isSuperadmin: false,
          isAdmin: false,
          isAgent: false,
          organizationId: null,
          loading: false,
        });
        return;
      }

      try {
        // Fetch user system data
        const { data: userData, error } = await supabase
          .from('users')
          .select('role, organization_id')
          .eq('id', user.id)
          .single();

        if (error || !userData) {
          console.error('Error fetching user data:', error);
          setRoleData(prev => ({ ...prev, loading: false }));
          return;
        }

        const role = userData.role as UserRole;
        const isSuperadmin = role === 'superadmin';
        const isAdmin = role === 'admin' || isSuperadmin;
        const isAgent = role === 'agent' || isAdmin;
        const isStaff = isAgent; // All agents and above are staff

        setRoleData({
          role,
          isStaff,
          isSuperadmin,
          isAdmin,
          isAgent,
          organizationId: userData.organization_id,
          loading: false,
        });

      } catch (error) {
        console.error('Error checking user role:', error);
        setRoleData(prev => ({ ...prev, loading: false }));
      }
    }

    checkRole();
  }, [user]);

  return roleData;
}
