import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';

export interface Agent {
  id: string;
  display_name: string;
  email: string;
  photo_url: string | null;
  agent_level: string | null;
  is_active: boolean;
}

export function useAgents(organizationId?: string) {
  return useQuery({
    queryKey: ['agents', organizationId],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('id, display_name, email, photo_url, agent_level, is_active')
        .eq('is_active', true)
        .order('display_name');

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Agent[];
    },
    enabled: true,
  });
}
