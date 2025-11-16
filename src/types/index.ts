export type Language = 'es' | 'en';

export interface Translation {
  nav: {
    home: string;
    properties: string;
    map: string;
    about: string;
    contact: string;
  };
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    searchPlaceholder: string;
    propertyType: string;
    zone: string;
    priceRange: string;
    search: string;
    allTypes: string;
    allZones: string;
  };
  featured: {
    title: string;
    subtitle: string;
    viewAll: string;
  };
  zones: {
    title: string;
    subtitle: string;
    properties: string;
  };
  whyUs: {
    title: string;
    subtitle: string;
    local: {
      title: string;
      description: string;
    };
    personalized: {
      title: string;
      description: string;
    };
    transparent: {
      title: string;
      description: string;
    };
  };
  stats: {
    title: string;
    propertiesSold: string;
    happyClients: string;
    yearsExperience: string;
  };
  finalCta: {
    title: string;
    subtitle: string;
    button: string;
  };
  properties: {
    title: string;
    results: string;
    filters: string;
    clearFilters: string;
    applyFilters: string;
    propertyType: string;
    operation: string;
    zone: string;
    priceRange: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
    any: string;
    noResults: string;
    sort: {
      relevance: string;
      priceAsc: string;
      priceDesc: string;
      newest: string;
    };
    previous: string;
    next: string;
  };
  footer: {
    contact: string;
    address: string;
    phone: string;
    email: string;
    followUs: string;
    rights: string;
  };
}

export interface Translations {
  es: Translation;
  en: Translation;
}
