import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'superadmin' | 'admin' | 'agent' | 'user';

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
export const useUserRole = (): UserRoleData => {
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
    const checkUserRole = async () => {
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
        // Check for superadmin role (global, no org)
        const { data: superadminRole } = await supabase
          .from('role_assignments')
          .select('role, organization_id')
          .eq('user_id', user.id)
          .eq('role', 'superadmin')
          .is('organization_id', null)
          .maybeSingle();

        if (superadminRole) {
          setRoleData({
            role: 'superadmin',
            isStaff: true,
            isSuperadmin: true,
            isAdmin: false,
            isAgent: false,
            organizationId: null,
            loading: false,
          });
          return;
        }

        // Check for admin role (org-scoped)
        const { data: adminRole } = await supabase
          .from('role_assignments')
          .select('role, organization_id')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .not('organization_id', 'is', null)
          .maybeSingle();

        if (adminRole) {
          setRoleData({
            role: 'admin',
            isStaff: true,
            isSuperadmin: false,
            isAdmin: true,
            isAgent: false,
            organizationId: adminRole.organization_id,
            loading: false,
          });
          return;
        }

        // Check if user has agent profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('agent_level, organization_id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.agent_level && profile?.organization_id) {
          setRoleData({
            role: 'agent',
            isStaff: true,
            isSuperadmin: false,
            isAdmin: false,
            isAgent: true,
            organizationId: profile.organization_id,
            loading: false,
          });
          return;
        }

        // Default to regular user
        setRoleData({
          role: 'user',
          isStaff: false,
          isSuperadmin: false,
          isAdmin: false,
          isAgent: false,
          organizationId: null,
          loading: false,
        });
      } catch (error) {
        console.error('Error checking user role:', error);
        setRoleData({
          role: 'user',
          isStaff: false,
          isSuperadmin: false,
          isAdmin: false,
          isAgent: false,
          organizationId: null,
          loading: false,
        });
      }
    };

    checkUserRole();
  }, [user]);

  return roleData;
};
