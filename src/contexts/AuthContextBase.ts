import type { User, Session } from '@supabase/supabase-js';
import { createContext } from 'react';

import type { Database, Tables } from '@/integrations/supabase/types';

/**
 * Database role enum from role_assignments table
 * These are the actual roles stored in the database
 */
export type DatabaseRole = Database['public']['Enums']['app_role'];

/**
 * Inferred roles based on profile data (not stored in role_assignments)
 * - 'agent': User has agent_level set in their profile
 * - 'client': Regular user without admin/superadmin role and no agent_level
 */
export type InferredRole = 'agent' | 'client';

/**
 * UserRole combines database roles with inferred roles
 * - Database roles (from role_assignments): 'superadmin' | 'admin' | 'user'
 * - Inferred roles (from profile): 'agent' | 'client'
 *
 * Role determination logic (in AuthContext):
 * 1. Check role_assignments for 'superadmin' or 'admin'
 * 2. If only 'user' role, check profile.agent_level → 'agent'
 * 3. If no agent_level → 'user' (treated as regular client)
 */
export type UserRole = DatabaseRole | InferredRole;

type Profile = Tables<'profiles'>;

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  role: UserRole;
  isStaff: boolean;
  isSuperadmin: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  organizationId: string | null;
  roleLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
