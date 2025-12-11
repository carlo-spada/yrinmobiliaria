import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Cache times - zones rarely change
const ZONES_STALE_TIME = 30 * 60 * 1000; // 30 minutes
const ZONES_GC_TIME = 60 * 60 * 1000; // 1 hour

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
    staleTime: ZONES_STALE_TIME,
    gcTime: ZONES_GC_TIME,
    retry: 2,
  });

  // Memoize zone mapping to avoid re-computation on every render
  const mappedZones = useMemo(
    () =>
      zones.map((zone) => ({
        value: zone.name_es, // Use actual Spanish name (matches what's stored in properties)
        label: language === 'es' ? zone.name_es : zone.name_en,
        id: zone.id,
        name_es: zone.name_es, // Keep original for backward compatibility
        name_en: zone.name_en,
      })),
    [zones, language]
  );

  return { zones: mappedZones, isLoading };
}
