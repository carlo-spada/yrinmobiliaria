import { describe, it, expect } from 'vitest';

import { resolveAgentZones } from './serviceZones';

const ZONES = [
  { id: 'id-centro', name_es: 'Centro Histórico', name_en: 'Historic Center' },
  { id: 'id-reforma', name_es: 'Reforma', name_en: 'Reforma' },
  { id: 'id-xochi', name_es: 'Santa Cruz Xoxocotlán', name_en: 'Santa Cruz Xoxocotlán' },
];

describe('resolveAgentZones', () => {
  it('resuelve IDs a su nombre en español', () => {
    expect(resolveAgentZones(ZONES, ['id-centro', 'id-reforma'], 'es')).toEqual([
      { id: 'id-centro', name: 'Centro Histórico' },
      { id: 'id-reforma', name: 'Reforma' },
    ]);
  });

  it('resuelve IDs a su nombre en inglés', () => {
    expect(resolveAgentZones(ZONES, ['id-centro'], 'en')).toEqual([
      { id: 'id-centro', name: 'Historic Center' },
    ]);
  });

  it('omite IDs desconocidos/inactivos en vez de mostrar un uuid en crudo', () => {
    const uuid = '9b2c8329-08b6-40e2-967d-65973b9f6157';
    const result = resolveAgentZones(ZONES, [uuid, 'id-reforma'], 'es');
    expect(result).toEqual([{ id: 'id-reforma', name: 'Reforma' }]);
    // garantía clave: ningún uuid en crudo llega al render
    expect(result.some((z) => z.name.includes(uuid))).toBe(false);
  });

  it('preserva el orden de los IDs del agente', () => {
    const result = resolveAgentZones(ZONES, ['id-reforma', 'id-centro'], 'es');
    expect(result.map((z) => z.id)).toEqual(['id-reforma', 'id-centro']);
  });

  it('devuelve [] para null/undefined/vacío', () => {
    expect(resolveAgentZones(ZONES, null, 'es')).toEqual([]);
    expect(resolveAgentZones(ZONES, undefined, 'es')).toEqual([]);
    expect(resolveAgentZones(ZONES, [], 'es')).toEqual([]);
  });

  it('devuelve [] cuando aún no hay catálogo de zonas (caché vacía)', () => {
    expect(resolveAgentZones([], ['id-centro'], 'es')).toEqual([]);
  });
});
