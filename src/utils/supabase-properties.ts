import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/property';
import { Database } from '@/integrations/supabase/types';

type Json = Database['public']['Tables']['properties']['Insert']['location'];

/**
 * Seed the database with initial properties
 * This should only be run once to populate the database
 */
export const seedProperties = async (properties: Property[]) => {
  try {
    console.log('Starting database seeding...');

    // Get YR organization ID
    const { data: yrOrg } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', 'yr-inmobiliaria')
      .single();
    
    if (!yrOrg) {
      throw new Error('YR Inmobiliaria organization not found');
    }

    for (const property of properties) {
      // Insert property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert([{
          title_es: property.title.es,
          title_en: property.title.en,
          description_es: property.description.es,
          description_en: property.description.en,
          type: property.type,
          operation: property.operation,
          price: property.price,
          location: property.location as Json,
          features: property.features as Json,
          amenities: property.amenities,
          status: property.status,
          featured: property.featured,
          published_date: property.publishedDate,
          organization_id: yrOrg.id,
        }])
        .select()
        .single();

      if (propertyError) {
        console.error('Error inserting property:', propertyError);
        continue;
      }

      if (!propertyData) {
        console.error('No property data returned');
        continue;
      }

      // Insert images
      if (property.images && property.images.length > 0) {
        const images = property.images.map((imageUrl, index) => ({
          property_id: propertyData.id,
          image_url: imageUrl,
          display_order: index,
        }));

        const { error: imagesError } = await supabase
          .from('property_images')
          .insert(images);

        if (imagesError) {
          console.error('Error inserting images:', imagesError);
        }
      }

      console.log(`✓ Seeded property: ${property.title.es}`);
    }

    console.log('Database seeding completed!');
    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
};

/**
 * Clear all properties from the database
 * Use with caution!
 */
export const clearProperties = async () => {
  try {
    // Images will be deleted automatically due to CASCADE
    const { error } = await supabase
      .from('properties')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (error) {
      console.error('Error clearing properties:', error);
      return { success: false, error };
    }

    console.log('All properties cleared from database');
    return { success: true };
  } catch (error) {
    console.error('Error in clearProperties:', error);
    return { success: false, error };
  }
};
