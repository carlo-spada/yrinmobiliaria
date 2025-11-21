import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicAgent {
  id: string;
  display_name: string;
  email: string;
  phone: string | null;
  whatsapp_number: string | null;
  photo_url: string | null;
  bio_es: string | null;
  bio_en: string | null;
  agent_level: 'junior' | 'associate' | 'senior' | 'partner' | null;
  agent_years_experience: number | null;
  agent_license_number: string | null;
  agent_specialty: string[] | null;
  languages: string[] | null;
  service_zones: string[] | null;
  instagram_handle: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  is_featured: boolean;
  organization_id: string | null;
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .eq('show_in_directory', true)
        .eq('is_complete', true)
        .order('is_featured', { ascending: false })
        .order('display_name');

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
