/**
 * Validates that required Supabase environment variables are present
 * @returns Object with isValid boolean and error message if invalid
 */
export function validateSupabaseEnv(): { isValid: boolean; error?: string } {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || supabaseUrl === 'undefined') {
    return {
      isValid: false,
      error: 'VITE_SUPABASE_URL is missing or invalid',
    };
  }

  if (!supabaseKey || supabaseKey === 'undefined') {
    return {
      isValid: false,
      error: 'VITE_SUPABASE_PUBLISHABLE_KEY is missing or invalid',
    };
  }

  return { isValid: true };
}
