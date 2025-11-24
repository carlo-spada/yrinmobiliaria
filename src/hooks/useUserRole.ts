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
        // Get organization and base role from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('organization_id, role')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          console.error('Error fetching user data:', userError);
          setRoleData(prev => ({ ...prev, loading: false }));
          return;
        }

        // Get all roles from role_assignments table
        const { data: roleData, error: roleError } = await supabase
          .from('role_assignments')
          .select('role')
          .eq('user_id', user.id);

        if (roleError) {
          console.error('Error fetching role:', roleError);
          setRoleData(prev => ({ ...prev, loading: false }));
          return;
        }

        // Determine highest role based on hierarchy (not alphabetical)
        // Note: role_assignments only has 'superadmin', 'admin', 'user' (app_role enum)
        let role: UserRole = 'user';
        if (roleData && roleData.length > 0) {
          const roles = roleData.map(r => r.role);
          if (roles.includes('superadmin')) {
            role = 'superadmin';
          } else if (roles.includes('admin')) {
            role = 'admin';
          }
        }

        // Fallback to users.role if no assignment found (or RLS trimmed results)
        if (role === 'user' && (userData.role === 'admin' || userData.role === 'superadmin')) {
          role = userData.role as UserRole;
        }
        
        // Check if user is an agent by looking at profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('agent_level')
          .eq('user_id', user.id)
          .single();
        
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
