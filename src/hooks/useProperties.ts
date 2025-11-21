import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyFilters } from '@/types/property';
import { logger } from '@/utils/logger';
import { Database } from '@/integrations/supabase/types';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type PropertyImageRow = Database['public']['Tables']['property_images']['Row'];

interface PropertyWithRelations extends PropertyRow {
  property_images?: PropertyImageRow[];
  agent?: {
    id: string;
    display_name: string;
    photo_url: string | null;
    agent_level: string | null;
    whatsapp_number?: string | null;
    phone?: string | null;
    email?: string | null;
    bio_es?: string | null;
    bio_en?: string | null;
  } | null;
}

// Transform database row to Property type with proper coordinate handling
const transformProperty = (row: PropertyWithRelations): Property => {
  // Ensure coordinates are numbers with fallbacks
  const lat = row.location?.coordinates?.lat;
  const lng = row.location?.coordinates?.lng;
  
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
      ...row.location,
      zone: row.location?.zone || '',
      neighborhood: row.location?.neighborhood || '',
      address: row.location?.address || '',
      coordinates: {
        lat: Number(lat) || 0,
        lng: Number(lng) || 0,
      },
    },
    features: row.features || {},
    amenities: row.amenities || [],
    images: row.property_images?.map((img) => img.image_url) || [],
    imagesAlt: row.property_images?.map((img) => ({
      es: img.alt_text_es || '',
      en: img.alt_text_en || '',
    })) || [],
    imageVariants: row.image_variants || [],
    status: row.status,
    featured: row.featured,
    publishedDate: row.published_date,
    agent: row.agent ? {
      id: row.agent.id,
      display_name: row.agent.display_name,
      photo_url: row.agent.photo_url,
      agent_level: row.agent.agent_level,
    } : undefined,
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
