import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook to access authentication state and methods.
 * Uses the shared AuthContext for consistent state across the app.
 */
export const useAuth = () => {
  const context = useAuthContext();
  
  return {
    user: context.user,
    session: context.session,
    loading: context.loading,
    isAdmin: context.isAdmin,
    profile: context.profile,
    signIn: context.signIn,
    signUp: context.signUp,
    signOut: context.signOut,
  };
};
