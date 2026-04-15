import { describe, expect, it } from 'vitest';

import { propertyFormSchema } from './PropertyFormDialog';

const baseData = {
  title_es: 'Casa',
  title_en: 'House',
  description_es: '',
  description_en: '',
  type: 'casa',
  operation: 'venta',
  price: '1000000',
  status: 'disponible',
  featured: false,
  zone: 'Centro',
  neighborhood: 'Colonia',
  address: 'Calle 1',
  lat: '16.5',
  lng: '-96.7',
  bedrooms: '3',
  bathrooms: '2',
  parking: '1',
  constructionArea: '120',
  landArea: '200',
};

describe('propertyFormSchema', () => {
  it('accepts a valid Oaxaca-bounded property', () => {
    expect(() => propertyFormSchema.parse(baseData)).not.toThrow();
  });

  it('rejects out-of-bounds coordinates', () => {
    expect(() => propertyFormSchema.parse({ ...baseData, lat: '19' })).toThrow();
    expect(() => propertyFormSchema.parse({ ...baseData, lng: '-100' })).toThrow();
  });

  it('requires bilingual titles', () => {
    expect(() => propertyFormSchema.parse({ ...baseData, title_en: '' })).toThrow();
    expect(() => propertyFormSchema.parse({ ...baseData, title_es: '' })).toThrow();
  });
});
