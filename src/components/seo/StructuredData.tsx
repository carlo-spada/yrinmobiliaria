import { useEffect } from 'react';

export type SchemaType = 'Organization' | 'Product' | 'BreadcrumbList' | 'LocalBusiness';

interface StructuredDataProps {
  type: SchemaType;
  data: Record<string, any>;
}

export function StructuredData({ type, data }: StructuredDataProps) {
  useEffect(() => {
    const scriptId = `structured-data-${type.toLowerCase()}`;
    
    // Remove existing script if it exists
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create and inject new script
    const script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    });
    
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [type, data]);

  return null;
}

// Helper function to generate Organization schema
export const getOrganizationSchema = (language: 'es' | 'en') => ({
  name: 'YR Inmobiliaria',
  description: language === 'es' 
    ? 'Expertos en bienes raíces en Oaxaca, México. Encuentra tu hogar perfecto con más de 10 años de experiencia.'
    : 'Real estate experts in Oaxaca, Mexico. Find your perfect home with over 10 years of experience.',
  url: window.location.origin,
  logo: `${window.location.origin}/favicon.ico`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+52-951-123-4567',
    contactType: 'customer service',
    availableLanguage: ['Spanish', 'English'],
  },
  sameAs: [
    'https://facebook.com/yrinmobiliaria',
    'https://instagram.com/yrinmobiliaria',
  ],
});

// Helper function to generate LocalBusiness schema
export const getLocalBusinessSchema = (language: 'es' | 'en') => ({
  ...getOrganizationSchema(language),
  '@type': 'RealEstateAgent',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Centro Histórico',
    addressLocality: 'Oaxaca de Juárez',
    addressRegion: 'Oaxaca',
    addressCountry: 'MX',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 17.0732,
    longitude: -96.7266,
  },
  openingHours: 'Mo-Fr 09:00-18:00',
  priceRange: '$$',
});

// Helper function to generate Product schema for property
export const getProductSchema = (property: any, language: 'es' | 'en') => ({
  name: property.title[language],
  description: property.description[language]?.substring(0, 200) || '',
  image: property.images[0] || '',
  offers: {
    '@type': 'Offer',
    price: property.price,
    priceCurrency: 'MXN',
    availability: property.status === 'disponible' 
      ? 'https://schema.org/InStock' 
      : 'https://schema.org/OutOfStock',
    itemCondition: 'https://schema.org/UsedCondition',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: property.location.address,
    addressLocality: property.location.neighborhood,
    addressRegion: property.location.zone,
    addressCountry: 'MX',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: property.location.coordinates?.lat,
    longitude: property.location.coordinates?.lng,
  },
});

// Helper function to generate BreadcrumbList schema
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});