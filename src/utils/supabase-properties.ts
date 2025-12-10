import { supabase } from '@/integrations/supabase/client';

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

    return { success: true };
  } catch (error) {
    console.error('Error in clearProperties:', error);
    return { success: false, error };
  }
};
