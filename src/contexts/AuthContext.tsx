import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tables } from '@/integrations/supabase/types';

export type UserRole = 'superadmin' | 'admin' | 'agent' | 'user' | 'client';

// Use the exact database type for profiles
type Profile = Tables<'profiles'>;

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: Profile | null;
  profileLoading: boolean;
  // Role data
  role: UserRole;
  isStaff: boolean;
  isSuperadmin: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  organizationId: string | null;
  roleLoading: boolean;
  // Actions
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Set up auth state listener once
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Invalidate queries when auth state changes
        if (event === 'SIGNED_OUT') {
          queryClient.clear();
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Fetch user profile with React Query (cached)
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        logger.error('Error fetching profile', error);
        return null;
      }

      return data;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch user roles with React Query (cached)
  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          role: 'user' as UserRole,
          isStaff: false,
          isSuperadmin: false,
          isAdmin: false,
          isAgent: false,
        };
      }

      // Get all roles from role_assignments table
      const { data: roleAssignments, error: roleError } = await supabase
        .from('role_assignments')
        .select('role')
        .eq('user_id', user.id);

      if (roleError) {
        logger.error('Error fetching roles:', roleError);
        return {
          role: 'user' as UserRole,
          isStaff: false,
          isSuperadmin: false,
          isAdmin: false,
          isAgent: false,
        };
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
      if (role === 'user' && profile?.agent_level) {
        role = 'agent';
      }

      const isSuperadmin = role === 'superadmin';
      const isAdmin = role === 'admin' || isSuperadmin;
      const isAgent = role === 'agent' || isAdmin;
      const isStaff = isAgent;

      return { role, isStaff, isSuperadmin, isAdmin, isAgent };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    // Create profile after successful signup
    if (!error && data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        email: data.user.email!,
        display_name: data.user.email!.split('@')[0],
        organization_id: null,
        is_complete: true,
      });

      if (profileError) {
        logger.error('Failed to create profile', profileError);
      }
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    loading,
    profile: profile ?? null,
    profileLoading,
    role: roleData?.role ?? 'user',
    isStaff: roleData?.isStaff ?? false,
    isSuperadmin: roleData?.isSuperadmin ?? false,
    isAdmin: roleData?.isAdmin ?? false,
    isAgent: roleData?.isAgent ?? false,
    organizationId: profile?.organization_id ?? null,
    roleLoading: roleLoading || profileLoading,
    signIn,
    signUp,
    signOut,
  }), [user, session, loading, profile, profileLoading, roleData, roleLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
