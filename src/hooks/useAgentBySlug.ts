import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';

import { PublicAgent } from './usePublicAgents';

export function useAgentBySlug(slug: string) {
  return useQuery({
    queryKey: ['agent-by-slug', slug],
    queryFn: async () => {
      // Use secure RPC function that only returns non-sensitive fields
      const { data, error } = await supabase.rpc('get_public_agents');

      if (error) throw error;
      
      // Find exact match by converting display_name to slug format
      const agent = data?.find(
        (a: PublicAgent) => a.display_name.toLowerCase().replace(/ /g, '-') === slug.toLowerCase()
      );

      return agent as PublicAgent | null;
    },
    enabled: !!slug,
  });
}

export function generateSlug(displayName: string): string {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}
