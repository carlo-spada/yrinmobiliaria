import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { Property, PropertyFilters, PropertyLocation, PropertyFeatures } from '@/types/property';
import { logger } from '@/utils/logger';

type PropertyRow = Database['public']['Tables']['properties']['Row'];

interface AgentInfo {
  id: string;
  display_name: string;
  photo_url: string | null;
  agent_level: string | null;
  whatsapp_number?: string | null;
  phone?: string | null;
  email?: string | null;
  bio_es?: string | null;
  bio_en?: string | null;
}

interface PropertyWithRelations extends PropertyRow {
  property_images?: {
    alt_text_en: string | null;
    alt_text_es: string | null;
    display_order: number;
    image_url: string;
  }[];
  agent?: AgentInfo | null;
}


// Transform database row to Property type with proper coordinate handling
const transformProperty = (row: PropertyWithRelations): Property => {
  // Cast Json types to proper structures
  const location = row.location as unknown as PropertyLocation;
  const features = row.features as unknown as PropertyFeatures;
  const imageVariants = row.image_variants as unknown as Property['imageVariants'];
  
  const agentData = row.agent;
  
  return {
    id: row.id,
    title: {
      es: row.title_es || '',
      en: row.title_en || '',
    },
    description: {
      es: row.description_es || '',
      en: row.description_en || '',
    },
    type: row.type,
    operation: row.operation,
    price: Number(row.price) || 0,
    location: {
      zone: location?.zone || '',
      neighborhood: location?.neighborhood || '',
      address: location?.address || '',
      coordinates: {
        lat: Number(location?.coordinates?.lat) || 0,
        lng: Number(location?.coordinates?.lng) || 0,
      },
    },
    features: features || { bathrooms: 0, constructionArea: 0 },
    amenities: row.amenities || [],
    images: row.property_images?.map((img) => img.image_url) || [],
    imagesAlt: row.property_images?.map((img) => ({
      es: img.alt_text_es || '',
      en: img.alt_text_en || '',
    })) || [],
    imageVariants: imageVariants || [],
    status: row.status,
    featured: row.featured ?? false,
    publishedDate: row.published_date ?? '',
    agent: agentData ? (() => {
      const a = agentData as unknown as Record<string, unknown>;
      return {
        id: String(a['id'] ?? ''),
        display_name: String(a['display_name'] ?? ''),
        photo_url: a['photo_url'] as string | null,
        agent_level: a['agent_level'] as 'junior' | 'associate' | 'senior' | 'partner' | null,
      };
    })() : undefined,
  };
};

export const useProperties = (filters?: PropertyFilters) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      try {
        // Build query
        let query = supabase
          .from('properties')
          .select(`
            *,
            property_images (
              image_url,
              display_order,
              alt_text_es,
              alt_text_en
            ),
            agent:profiles!properties_agent_id_fkey (
              id,
              display_name,
              photo_url,
              agent_level
            )
          `)
          .order('created_at', { ascending: false });

        // Apply filters if provided
        if (filters?.type) {
          query = query.eq('type', filters.type);
        }

        if (filters?.operation) {
          query = query.eq('operation', filters.operation);
        }

        if (filters?.featured) {
          query = query.eq('featured', true);
        }

        if (filters?.minPrice) {
          query = query.gte('price', filters.minPrice);
        }

        if (filters?.maxPrice) {
          query = query.lte('price', filters.maxPrice);
        }

        // Execute query
        const { data, error } = await query;

        if (error) {
          logger.error('Error fetching properties', error);
          throw error;
        }

        // Return empty array if no data (no mock fallback)
        if (!data || data.length === 0) {
          return [];
        }

        // Transform and return properties
        return data.map(transformProperty);
      } catch (error) {
        logger.error('Error in useProperties', error);
        throw error;
      }
    },
    // Refetch every 5 minutes
    staleTime: 5 * 60 * 1000,
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            *,
            property_images (
              image_url,
              display_order,
              alt_text_es,
              alt_text_en
            ),
            agent:profiles!properties_agent_id_fkey (
              id,
              display_name,
              photo_url,
              agent_level,
              whatsapp_number,
              phone,
              email,
              bio_es,
              bio_en
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          logger.error('Error fetching property', error);
          return null;
        }

        if (!data) {
          return null;
        }

        return transformProperty(data);
      } catch (error) {
        logger.error('Error in useProperty', error);
        return null;
      }
    },
    enabled: !!id,
  });
};
