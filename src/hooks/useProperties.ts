import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyFilters } from '@/types/property';
import { properties as mockProperties } from '@/data/properties';

// Transform database row to Property type
const transformProperty = (row: any): Property => {
  return {
    id: row.id,
    title: {
      es: row.title_es,
      en: row.title_en,
    },
    description: {
      es: row.description_es || '',
      en: row.description_en || '',
    },
    type: row.type,
    operation: row.operation,
    price: Number(row.price),
    location: row.location || {},
    features: row.features || {},
    amenities: row.amenities || [],
    images: row.property_images?.map((img: any) => img.image_url) || [],
    status: row.status,
    featured: row.featured,
    publishedDate: row.published_date,
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
          console.error('Error fetching properties:', error);
          // Return mock data as fallback
          return mockProperties;
        }

        // If no data from database, return mock data
        if (!data || data.length === 0) {
          console.log('No properties in database, using mock data');
          return mockProperties;
        }

        // Transform and return properties
        return data.map(transformProperty);
      } catch (error) {
        console.error('Error in useProperties:', error);
        // Return mock data as fallback
        return mockProperties;
      }
    },
    // Use mock data initially while fetching
    placeholderData: mockProperties,
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
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching property:', error);
          // Fallback to mock data
          const mockProperty = mockProperties.find(p => p.id === id);
          return mockProperty || null;
        }

        if (!data) {
          // Fallback to mock data
          const mockProperty = mockProperties.find(p => p.id === id);
          return mockProperty || null;
        }

        return transformProperty(data);
      } catch (error) {
        console.error('Error in useProperty:', error);
        // Fallback to mock data
        const mockProperty = mockProperties.find(p => p.id === id);
        return mockProperty || null;
      }
    },
    enabled: !!id,
  });
};
