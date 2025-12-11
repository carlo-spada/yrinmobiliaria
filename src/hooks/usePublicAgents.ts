import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logger } from '@/utils/logger';

// Use the actual database enum type for agent_level
type AgentLevel = Database['public']['Enums']['agent_level'];

// Cache times
const AGENT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const STATS_STALE_TIME = 60 * 1000; // 1 minute - stats are more real-time

// Public agent data - only non-sensitive fields exposed via secure RPC
// Contact details (email, phone, whatsapp) are intentionally excluded for privacy
export interface PublicAgent {
  id: string;
  display_name: string;
  photo_url: string | null;
  bio_es: string | null;
  bio_en: string | null;
  agent_level: AgentLevel | null;
  agent_years_experience: number | null;
  agent_license_number: string | null;
  agent_specialty: string[] | null;
  languages: string[] | null;
  service_zones: string[] | null;
  is_featured: boolean;
  organization_id: string | null;
  // Social links are public by nature (users control what they share)
  instagram_handle: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
}

export interface AgentStats {
  propertiesCount: number;
  inquiriesCount: number;
  visitsCount: number;
}

export function usePublicAgents() {
  return useQuery({
    queryKey: ['public-agents'],
    queryFn: async () => {
      // Use secure RPC function that only returns non-sensitive fields
      const { data, error } = await supabase.rpc('get_public_agents');

      if (error) throw error;
      return (data || []) as PublicAgent[];
    },
    staleTime: AGENT_STALE_TIME,
    retry: 2,
  });
}

export function useAgentStats(agentId: string) {
  return useQuery({
    queryKey: ['agent-stats', agentId],
    queryFn: async (): Promise<AgentStats> => {
      // Use Promise.allSettled for resilient parallel fetching
      const results = await Promise.allSettled([
        supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', agentId)
          .eq('status', 'disponible'),
        supabase
          .from('contact_inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_to_agent', agentId),
        supabase
          .from('scheduled_visits')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', agentId),
      ]);

      // Extract counts with error handling for each query
      const propertiesResult = results[0];
      const inquiriesResult = results[1];
      const visitsResult = results[2];

      // Log any failures but don't throw - partial data is better than none
      if (propertiesResult.status === 'rejected') {
        logger.error('Failed to fetch properties count', propertiesResult.reason);
      }
      if (inquiriesResult.status === 'rejected') {
        logger.error('Failed to fetch inquiries count', inquiriesResult.reason);
      }
      if (visitsResult.status === 'rejected') {
        logger.error('Failed to fetch visits count', visitsResult.reason);
      }

      return {
        propertiesCount:
          propertiesResult.status === 'fulfilled' ? propertiesResult.value.count ?? 0 : 0,
        inquiriesCount:
          inquiriesResult.status === 'fulfilled' ? inquiriesResult.value.count ?? 0 : 0,
        visitsCount:
          visitsResult.status === 'fulfilled' ? visitsResult.value.count ?? 0 : 0,
      };
    },
    enabled: !!agentId,
    staleTime: STATS_STALE_TIME,
    retry: 1, // Stats can fail gracefully, fewer retries
  });
}
