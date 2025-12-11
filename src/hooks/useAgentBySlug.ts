import { useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';

import { PublicAgent } from './usePublicAgents';

// Cache times for agent data
const AGENT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const AGENT_GC_TIME = 30 * 60 * 1000; // 30 minutes

export function useAgentBySlug(slug: string) {
  const queryClient = useQueryClient();

  return useQuery({
    // Use hierarchical query key: ['agent', 'slug', slug]
    queryKey: ['agent', 'slug', slug],
    queryFn: async () => {
      // First, try to find in cached public-agents data to avoid N+1
      const cachedAgents = queryClient.getQueryData<PublicAgent[]>(['public-agents']);

      if (cachedAgents) {
        const agent = cachedAgents.find(
          (a) => a.display_name.toLowerCase().replace(/ /g, '-') === slug.toLowerCase()
        );
        if (agent) return agent;
      }

      // Fallback: fetch all agents (this also populates the cache for future lookups)
      const { data, error } = await supabase.rpc('get_public_agents');

      if (error) throw error;

      // Update the public-agents cache for future lookups
      if (data) {
        queryClient.setQueryData(['public-agents'], data);
      }

      // Find exact match by converting display_name to slug format
      const agent = data?.find(
        (a: PublicAgent) => a.display_name.toLowerCase().replace(/ /g, '-') === slug.toLowerCase()
      );

      return agent ?? null;
    },
    enabled: !!slug,
    staleTime: AGENT_STALE_TIME,
    gcTime: AGENT_GC_TIME,
    retry: 2,
  });
}

export function generateSlug(displayName: string): string {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}
