import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/utils/LanguageContext';

export interface ServiceZone {
  id: string;
  name_es: string;
  name_en: string;
  description_es: string | null;
  description_en: string | null;
  active: boolean;
  display_order: number;
}

export function useServiceZones() {
  const { language } = useLanguage();
  
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['service-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_zones')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as ServiceZone[];
    },
  });

  // Map zones to format expected by components with stable IDs and localized labels
  const mappedZones = zones.map((zone) => {
    // Generate slug from Spanish name for stable identifier
    const slug = zone.name_es.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/\s+/g, '-'); // Replace spaces with hyphens
    
    return {
      value: slug, // Stable identifier
      label: language === 'es' ? zone.name_es : zone.name_en,
      id: zone.id,
    };
  });

  return { zones: mappedZones, isLoading };
}
