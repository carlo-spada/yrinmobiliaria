-- Add check constraint to ensure property coordinates are within Oaxaca state bounds
-- Latitude: 15.6 to 18.7, Longitude: -98.6 to -93.8
ALTER TABLE properties ADD CONSTRAINT valid_oaxaca_coordinates CHECK (
  (location->'coordinates'->>'lat')::decimal BETWEEN 15.6 AND 18.7 AND
  (location->'coordinates'->>'lng')::decimal BETWEEN -98.6 AND -93.8
);