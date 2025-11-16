-- Create enums for property types, operations and status
CREATE TYPE property_type AS ENUM ('casa', 'departamento', 'local', 'oficina');
CREATE TYPE property_operation AS ENUM ('venta', 'renta');
CREATE TYPE property_status AS ENUM ('disponible', 'vendida', 'rentada');

-- Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  type property_type NOT NULL,
  operation property_operation NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  
  -- Location stored as JSONB for flexibility
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Features stored as JSONB
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Amenities as text array
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  status property_status NOT NULL DEFAULT 'disponible',
  featured BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_date DATE DEFAULT CURRENT_DATE
);

-- Create property images table (one-to-many relationship)
CREATE TABLE public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  alt_text_es TEXT,
  alt_text_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_properties_type ON public.properties(type);
CREATE INDEX idx_properties_operation ON public.properties(operation);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_featured ON public.properties(featured) WHERE featured = true;
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_created_at ON public.properties(created_at DESC);

-- Index on location for spatial queries (using GIN for JSONB)
CREATE INDEX idx_properties_location ON public.properties USING GIN(location);

-- Index for property images ordering
CREATE INDEX idx_property_images_property_id ON public.property_images(property_id, display_order);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for properties
-- Everyone can view available properties (public read access)
CREATE POLICY "Properties are viewable by everyone"
  ON public.properties
  FOR SELECT
  USING (true);

-- RLS Policies for property images
-- Everyone can view property images (public read access)
CREATE POLICY "Property images are viewable by everyone"
  ON public.property_images
  FOR SELECT
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE public.properties IS 'Main table for real estate properties';
COMMENT ON TABLE public.property_images IS 'Images associated with properties';
COMMENT ON COLUMN public.properties.location IS 'JSON structure: {zone: string, neighborhood: string, address: string, coordinates: {lat: number, lng: number}}';
COMMENT ON COLUMN public.properties.features IS 'JSON structure: {bedrooms: number, bathrooms: number, parking: number, constructionArea: number, landArea: number}';