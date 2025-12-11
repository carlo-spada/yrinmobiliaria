import { Json } from '@/integrations/supabase/types';

/**
 * Property location structure stored in the JSON column
 */
export interface PropertyLocation {
  zone?: string;
  neighborhood?: string;
  address?: string;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

/**
 * Property features structure stored in the JSON column
 */
export interface PropertyFeatures {
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  constructionArea?: number;
  landArea?: number;
  [key: string]: unknown; // Allow additional flexible fields
}

/**
 * Type guard to check if a JSON value is a valid PropertyLocation
 */
export function isPropertyLocation(obj: Json): obj is PropertyLocation & Record<string, unknown> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }
  // Check for expected location fields
  const loc = obj as Record<string, unknown>;
  return 'zone' in loc || 'coordinates' in loc || 'address' in loc || 'neighborhood' in loc;
}

/**
 * Type guard to check if a JSON value is a valid PropertyFeatures object
 */
export function isPropertyFeatures(obj: Json): obj is PropertyFeatures & Record<string, unknown> {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return false;
  }
  // Features are flexible, just need to be an object
  return true;
}

/**
 * Safely parse coordinates from a location JSON, with fallback to defaults
 */
export function parseCoordinates(location: Json): { lat: number; lng: number } {
  if (!isPropertyLocation(location)) {
    return { lat: 0, lng: 0 };
  }

  const coords = location.coordinates;
  return {
    lat: Number(coords?.lat) || 0,
    lng: Number(coords?.lng) || 0,
  };
}

/**
 * Safely parse a PropertyLocation from JSON
 */
export function parsePropertyLocation(json: Json): PropertyLocation {
  if (!isPropertyLocation(json)) {
    return {
      zone: '',
      neighborhood: '',
      address: '',
      coordinates: { lat: 0, lng: 0 },
    };
  }

  return {
    zone: String(json.zone ?? ''),
    neighborhood: String(json.neighborhood ?? ''),
    address: String(json.address ?? ''),
    coordinates: parseCoordinates(json),
  };
}

/**
 * Safely parse PropertyFeatures from JSON
 */
export function parsePropertyFeatures(json: Json): PropertyFeatures {
  if (!isPropertyFeatures(json)) {
    return {
      bathrooms: 0,
      constructionArea: 0,
    };
  }

  return {
    bedrooms: json.bedrooms !== undefined ? Number(json.bedrooms) : undefined,
    bathrooms: Number(json.bathrooms) || 0,
    parking: json.parking !== undefined ? Number(json.parking) : undefined,
    constructionArea: Number(json.constructionArea) || 0,
    landArea: json.landArea !== undefined ? Number(json.landArea) : undefined,
  };
}

/**
 * Type guard to check if a value is a non-null object
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard for non-empty strings
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard for positive numbers
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0 && Number.isFinite(value);
}
