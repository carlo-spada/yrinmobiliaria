-- Add image_variants JSONB column for optimized image metadata
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS image_variants JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.properties.image_variants IS 'Optimized image variants (AVIF/WebP) metadata: [{id, variants:{avif:{w:url}, webp:{w:url}}, alt_es, alt_en, order}]';
