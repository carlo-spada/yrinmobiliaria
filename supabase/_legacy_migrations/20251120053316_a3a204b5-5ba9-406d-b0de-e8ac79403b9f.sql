-- Add coordinate validation constraint for Oaxaca state bounds
-- This ensures all properties have valid coordinates within Oaxaca, Mexico
-- Latitude: 15.6 to 18.7, Longitude: -98.6 to -93.8

-- Create a validation function for coordinates
CREATE OR REPLACE FUNCTION public.validate_oaxaca_coordinates()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lat NUMERIC;
  lng NUMERIC;
BEGIN
  -- Extract coordinates from location JSONB
  lat := (NEW.location->>'coordinates')::jsonb->>'lat';
  lng := (NEW.location->>'coordinates')::jsonb->>'lng';
  
  -- Validate coordinates are within Oaxaca state bounds
  IF lat IS NOT NULL AND lng IS NOT NULL THEN
    IF lat < 15.6 OR lat > 18.7 THEN
      RAISE EXCEPTION 'Latitude must be between 15.6 and 18.7 (Oaxaca state bounds). Got: %', lat
        USING HINT = 'Las coordenadas deben estar dentro del estado de Oaxaca';
    END IF;
    
    IF lng < -98.6 OR lng > -93.8 THEN
      RAISE EXCEPTION 'Longitude must be between -98.6 and -93.8 (Oaxaca state bounds). Got: %', lng
        USING HINT = 'Las coordenadas deben estar dentro del estado de Oaxaca';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS validate_coordinates_trigger ON public.properties;

-- Create trigger to validate coordinates on insert and update
CREATE TRIGGER validate_coordinates_trigger
  BEFORE INSERT OR UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_oaxaca_coordinates();

-- Add comment for documentation
COMMENT ON FUNCTION public.validate_oaxaca_coordinates() IS 
  'Validates that property coordinates are within Oaxaca state bounds (lat: 15.6-18.7, lng: -98.6 to -93.8)';
