import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageLoader } from "@/components/ui/page-loader";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";


interface ProfileCompletionGuardProps {
  children: ReactNode;
}

export function ProfileCompletionGuard({ children }: ProfileCompletionGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const location = useLocation();
  const shouldEnforceCompletion = !!user && role === "agent";

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['profile-completion', user?.id],
    queryFn: async () => {
      if (!user) {
        return null;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_complete')
        .eq('user_id', user.id)
        .single();

      if (error) {
        logger.error("Error fetching profile:", error);
        throw error;
      }

      return data;
    },
    enabled: shouldEnforceCompletion,
    retry: false,
  });

  if (authLoading || roleLoading || (shouldEnforceCompletion && isLoading)) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <Navigate
        to={`/auth?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`}
        replace
      />
    );
  }

  if (!shouldEnforceCompletion) {
    return <>{children}</>;
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>No pudimos validar tu perfil</CardTitle>
            </div>
            <CardDescription>
              La validación del perfil falló. Reintenta antes de continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => void refetch()} className="w-full">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile?.is_complete) {
    return <Navigate to="/onboarding/complete-profile" replace />;
  }

  return <>{children}</>;
}
