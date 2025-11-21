import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

// Setting value can be string, number, boolean, or null
export type SettingValue = string | number | boolean | null;

export interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: SettingValue;
  category: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingsMap {
  [key: string]: SettingValue;
}

export function useSiteSettings() {
  const queryClient = useQueryClient();

  const { data: settingsArray, isLoading, error } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_key');
      
      if (error) {
        logger.error('Failed to fetch site settings', error);
        throw error;
      }
      
      return data as SiteSetting[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Convert array to map for easy access
  const settings: SiteSettingsMap = settingsArray?.reduce((acc, setting) => {
    acc[setting.setting_key] = setting.setting_value;
    return acc;
  }, {} as SiteSettingsMap) || {};

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: SettingValue }) => {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', key)
        .select()
        .single();
      
      if (error) {
        logger.error('Failed to update site setting', error);
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: 'Configuración actualizada',
        description: 'Los cambios se guardaron correctamente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error al guardar',
        description: 'No se pudo actualizar la configuración. Intenta de nuevo.',
        variant: 'destructive',
      });
      logger.error('Update setting mutation error', error);
    },
  });

  const getSetting = (key: string, fallback?: SettingValue): SettingValue => {
    return settings?.[key] ?? fallback;
  };

  const getSettingsByCategory = (category: string): SiteSetting[] => {
    return settingsArray?.filter(s => s.category === category) || [];
  };

  return {
    settings,
    settingsArray,
    isLoading,
    error,
    getSetting,
    getSettingsByCategory,
    updateSetting: updateSettingMutation.mutate,
    isUpdating: updateSettingMutation.isPending,
  };
}
