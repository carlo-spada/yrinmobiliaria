-- Add 'terrenos' to property_type enum
ALTER TYPE property_type ADD VALUE IF NOT EXISTS 'terrenos';

-- Add 'pendiente' to property_status enum
ALTER TYPE property_status ADD VALUE IF NOT EXISTS 'pendiente';