import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";


interface ProfileCompletionGuardProps {
  children: ReactNode;
}

export function ProfileCompletionGuard({ children }: ProfileCompletionGuardProps) {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile-completion', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_complete')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If profile exists but is not complete, redirect to onboarding
  if (profile && !profile.is_complete) {
    return <Navigate to="/onboarding/complete-profile" replace />;
  }

  return <>{children}</>;
}
