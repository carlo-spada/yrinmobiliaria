export type PropertyType = "casa" | "departamento" | "local" | "oficina" | "terrenos";
export type PropertyOperation = "venta" | "renta";
export type PropertyStatus = "disponible" | "vendida" | "rentada" | "pendiente";

export interface PropertyLocation {
  zone: string;
  neighborhood: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface PropertyFeatures {
  bedrooms?: number;
  bathrooms: number;
  parking?: number;
  constructionArea: number;
  landArea?: number;
}

export interface Property {
  id: string;
  title: {
    es: string;
    en: string;
  };
  description: {
    es: string;
    en: string;
  };
  type: PropertyType;
  operation: PropertyOperation;
  price: number;
  location: PropertyLocation;
  features: PropertyFeatures;
  amenities: string[];
  images: string[];
  imagesAlt?: { es: string; en: string }[];
  imageVariants?: Array<{
    id: string;
    variants: {
      avif: Record<number, string>;
      webp: Record<number, string>;
    };
    alt_es?: string;
    alt_en?: string;
    order: number;
  }>;
  status: PropertyStatus;
  featured: boolean;
  publishedDate: string;
  agent_id?: string;
  agent?: {
    id: string;
    display_name: string;
    photo_url: string | null;
    agent_level: 'junior' | 'associate' | 'senior' | 'partner' | null;
    whatsapp_number?: string | null;
    phone?: string | null;
    email?: string;
    bio_es?: string | null;
    bio_en?: string | null;
  };
}

export interface PropertyFilters {
  type?: PropertyType;
  operation?: PropertyOperation;
  zone?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  featured?: boolean;
  bounds?: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
  };
}
