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
        // Get organization and agent info from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('organization_id, agent_level')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile data:', profileError);
          setRoleData(prev => ({ ...prev, loading: false }));
          return;
        }

        // Get all roles from role_assignments table
        const { data: roleAssignments, error: roleError } = await supabase
          .from('role_assignments')
          .select('role')
          .eq('user_id', user.id);

        if (roleError) {
          console.error('Error fetching roles:', roleError);
          setRoleData(prev => ({ ...prev, loading: false }));
          return;
        }

        // Determine highest role based on hierarchy
        let role: UserRole = 'user';
        if (roleAssignments && roleAssignments.length > 0) {
          const roles = roleAssignments.map(r => r.role);
          if (roles.includes('superadmin')) {
            role = 'superadmin';
          } else if (roles.includes('admin')) {
            role = 'admin';
          }
        }

        // If no admin role but has agent_level, consider them an agent
        if (role === 'user' && profileData?.agent_level) {
          role = 'agent';
        }

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
          organizationId: profileData?.organization_id ?? null,
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