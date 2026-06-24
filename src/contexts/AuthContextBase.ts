import type { User, Session } from '@supabase/supabase-js';
import { createContext } from 'react';

import type { Database, Tables } from '@/integrations/supabase/types';

/**
 * Application roles, stored in the role_assignments table.
 * Single-tenant and role-based: 'agent' is now a first-class DB role
 * (no longer inferred from profile.agent_level, which is display-only seniority).
 */
export type DatabaseRole = Database['public']['Enums']['app_role'];

/**
 * UserRole is the app_role enum: 'user' | 'agent' | 'admin' | 'superadmin'.
 * Determined in AuthContext from role_assignments (highest privilege wins).
 */
export type UserRole = DatabaseRole;

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
  roleLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
