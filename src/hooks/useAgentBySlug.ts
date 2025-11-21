import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PublicAgent } from './usePublicAgents';

export function useAgentBySlug(slug: string) {
  return useQuery({
    queryKey: ['agent-by-slug', slug],
    queryFn: async () => {
      // Convert slug back to display_name pattern
      // "yasmin-ruiz" -> "yasmin ruiz"
      const searchName = slug.replace(/-/g, ' ');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_active', true)
        .eq('show_in_directory', true)
        .eq('is_complete', true)
        .ilike('display_name', searchName);

      if (error) throw error;
      
      // Find exact match (case-insensitive)
      const agent = data?.find(
        (a) => a.display_name.toLowerCase().replace(/ /g, '-') === slug.toLowerCase()
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
