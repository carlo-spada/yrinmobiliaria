import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useServiceZones() {
  return useQuery({
    queryKey: ['service-zones-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_zones')
        .select('name_es, name_en')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
