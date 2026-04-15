import { type Session } from '@supabase/supabase-js';
import {
  type QueryClient,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useEffect } from 'react';

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

const PUBLIC_SESSION_QUERY_KEY = ['public-session'] as const;

const sessionSyncRegistry = new Map<
  QueryClient,
  { count: number; unsubscribe: () => void }
>();

const attachSessionSync = (queryClient: QueryClient) => {
  const existing = sessionSyncRegistry.get(queryClient);

  if (existing) {
    existing.count += 1;
    return () => {
      existing.count -= 1;
      if (existing.count === 0) {
        existing.unsubscribe();
        sessionSyncRegistry.delete(queryClient);
      }
    };
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    queryClient.setQueryData(PUBLIC_SESSION_QUERY_KEY, session);
    void queryClient.invalidateQueries({ queryKey: ['favorites'] });
  });

  sessionSyncRegistry.set(queryClient, {
    count: 1,
    unsubscribe: () => data.subscription.unsubscribe(),
  });

  return () => {
    const registered = sessionSyncRegistry.get(queryClient);
    if (!registered) {
      return;
    }

    registered.count -= 1;
    if (registered.count === 0) {
      registered.unsubscribe();
      sessionSyncRegistry.delete(queryClient);
    }
  };
};

export function usePublicSession() {
  const queryClient = useQueryClient();

  useEffect(() => attachSessionSync(queryClient), [queryClient]);

  const { data: session = null, isLoading } = useQuery<Session | null>({
    queryKey: PUBLIC_SESSION_QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        logger.error('Error fetching public session', error);
        return null;
      }

      return data.session;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return {
    session,
    user: session?.user ?? null,
    loading: isLoading,
  };
}
