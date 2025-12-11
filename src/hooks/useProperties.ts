import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/integrations/supabase/client';
import { Database, Json } from '@/integrations/supabase/types';
import { Property, PropertyFilters, PropertyLocation, PropertyFeatures } from '@/types/property';
import { logger } from '@/utils/logger';

type PropertyRow = Database['public']['Tables']['properties']['Row'];
type AgentLevel = Database['public']['Enums']['agent_level'];

// Cache times
const PROPERTIES_STALE_TIME = 2 * 60 * 1000; // 2 minutes - properties change more often

interface AgentInfo {
  id: string;
  display_name: string;
  photo_url: string | null;
  agent_level: AgentLevel | null;
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

// Type guards for safe JSON parsing
function isPropertyLocation(obj: Json): obj is Record<string, unknown> & PropertyLocation {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  const loc = obj as Record<string, unknown>;
  return 'zone' in loc || 'coordinates' in loc;
}

function isPropertyFeatures(obj: Json): obj is Record<string, unknown> & PropertyFeatures {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  return true; // Features are flexible
}

// Parse coordinates safely with defaults
function parseCoordinates(location: Json): { lat: number; lng: number } {
  if (!isPropertyLocation(location)) {
    return { lat: 0, lng: 0 };
  }
  const coords = location.coordinates as { lat?: unknown; lng?: unknown } | undefined;
  return {
    lat: Number(coords?.lat) || 0,
    lng: Number(coords?.lng) || 0,
  };
}

// Transform database row to Property type with proper coordinate handling
const transformProperty = (row: PropertyWithRelations): Property => {
  // Safe JSON parsing with type guards
  const location = isPropertyLocation(row.location) ? row.location : null;
  const features = isPropertyFeatures(row.features) ? row.features : null;
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
      zone: (location?.zone as string) || '',
      neighborhood: (location?.neighborhood as string) || '',
      address: (location?.address as string) || '',
      coordinates: parseCoordinates(row.location),
    },
    features: features
      ? {
          bedrooms: Number(features.bedrooms) || undefined,
          bathrooms: Number(features.bathrooms) || 0,
          parking: Number(features.parking) || undefined,
          constructionArea: Number(features.constructionArea) || 0,
          landArea: Number(features.landArea) || undefined,
        }
      : { bathrooms: 0, constructionArea: 0 },
    amenities: row.amenities || [],
    images: row.property_images?.map((img) => img.image_url) || [],
    imagesAlt:
      row.property_images?.map((img) => ({
        es: img.alt_text_es || '',
        en: img.alt_text_en || '',
      })) || [],
    imageVariants: imageVariants || [],
    status: row.status,
    featured: row.featured ?? false,
    publishedDate: row.published_date ?? '',
    agent: agentData
      ? {
          id: agentData.id,
          display_name: agentData.display_name,
          photo_url: agentData.photo_url,
          agent_level: agentData.agent_level,
        }
      : undefined,
  };
};

export const useProperties = (filters?: PropertyFilters) => {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: async () => {
      // Build query
      let query = supabase
        .from('properties')
        .select(
          `
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
          `
        )
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
    },
    staleTime: PROPERTIES_STALE_TIME,
    retry: 2,
  });
};

export const useProperty = (id: string) => {
  return useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(
          `
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
          `
        )
        .eq('id', id)
        .single();

      if (error) {
        // PGRST116 = no rows found - return null instead of throwing
        if (error.code === 'PGRST116') {
          return null;
        }
        logger.error('Error fetching property', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      return transformProperty(data);
    },
    enabled: !!id,
    staleTime: PROPERTIES_STALE_TIME,
    retry: (failureCount, error) => {
      // Don't retry on not found
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
        return false;
      }
      return failureCount < 2;
    },
  });
};
