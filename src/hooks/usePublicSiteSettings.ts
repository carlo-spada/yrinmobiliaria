import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export type PublicSettingValue = string | number | boolean | null;

export interface PublicSiteSetting {
  id: string;
  setting_key: string;
  setting_value: PublicSettingValue;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PublicSiteSettingsMap {
  [key: string]: PublicSettingValue;
}

export function usePublicSiteSettings() {
  const { data: settingsArray = [], isLoading, error } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_key');

      if (error) {
        logger.error('Failed to fetch public site settings', error);
        throw error;
      }

      return (data ?? []) as PublicSiteSetting[];
    },
    staleTime: 5 * 60 * 1000,
  });

  const settings = useMemo<PublicSiteSettingsMap>(
    () =>
      settingsArray.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as PublicSiteSettingsMap),
    [settingsArray]
  );

  const getSetting = (key: string, fallback: PublicSettingValue = null): PublicSettingValue =>
    settings[key] ?? fallback;

  return {
    settings,
    settingsArray,
    isLoading,
    error,
    getSetting,
  };
}
