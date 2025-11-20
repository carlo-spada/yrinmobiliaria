-- Add image_variants column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS image_variants JSONB DEFAULT '[]'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.properties.image_variants IS 
'Array of image variant objects: [{id, variants: {avif: {480: url, 768: url, 1280: url, 1920: url}, webp: {...}}, alt_es, alt_en, order}]';

-- Create index for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_properties_image_variants ON public.properties USING GIN (image_variants);