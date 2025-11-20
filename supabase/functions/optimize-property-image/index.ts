import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageVariant {
  avif: Record<number, string>;
  webp: Record<number, string>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { propertyId, imageId, imagePath } = await req.json();

    if (!propertyId || !imageId || !imagePath) {
      throw new Error('Missing required parameters');
    }

    console.log(`Optimizing image for property ${propertyId}, image ${imageId}`);

    // Get the original image URL
    const { data: { publicUrl } } = supabase.storage
      .from('property-images')
      .getPublicUrl(imagePath);

    // Generate variants using Supabase Image Transformation API
    const widths = [480, 768, 1280, 1920];
    const variants: ImageVariant = {
      avif: {},
      webp: {}
    };

    // For each width, create AVIF and WebP URLs using Supabase transformations
    for (const width of widths) {
      const height = Math.round(width / (4 / 3)); // 4:3 aspect ratio for cards

      // AVIF variant
      const avifUrl = new URL(publicUrl);
      avifUrl.searchParams.set('width', width.toString());
      avifUrl.searchParams.set('height', height.toString());
      avifUrl.searchParams.set('format', 'avif');
      avifUrl.searchParams.set('quality', '75');
      avifUrl.searchParams.set('resize', 'cover');
      variants.avif[width] = avifUrl.toString();

      // WebP variant
      const webpUrl = new URL(publicUrl);
      webpUrl.searchParams.set('width', width.toString());
      webpUrl.searchParams.set('height', height.toString());
      webpUrl.searchParams.set('format', 'webp');
      webpUrl.searchParams.set('quality', '80');
      webpUrl.searchParams.set('resize', 'cover');
      variants.webp[width] = webpUrl.toString();

      console.log(`Generated ${width}px variants for image ${imageId}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        variants,
        imageId,
        propertyId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error optimizing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Failed to optimize property image'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});