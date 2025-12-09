import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Public agent data - only non-sensitive fields exposed via secure RPC
// Contact details (email, phone, whatsapp) are intentionally excluded for privacy
export interface PublicAgent {
  id: string;
  display_name: string;
  photo_url: string | null;
  bio_es: string | null;
  bio_en: string | null;
  agent_level: 'junior' | 'associate' | 'senior' | 'partner' | null;
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
  });
}

export function useAgentStats(agentId: string) {
  return useQuery({
    queryKey: ['agent-stats', agentId],
    queryFn: async () => {
      // Get properties count
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agentId)
        .eq('status', 'disponible');

      // Get inquiries count
      const { count: inquiriesCount } = await supabase
        .from('contact_inquiries')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to_agent', agentId);

      // Get visits count
      const { count: visitsCount } = await supabase
        .from('scheduled_visits')
        .select('*', { count: 'exact', head: true })
        .eq('agent_id', agentId);

      return {
        propertiesCount: propertiesCount || 0,
        inquiriesCount: inquiriesCount || 0,
        visitsCount: visitsCount || 0,
      } as AgentStats;
    },
  });
}
