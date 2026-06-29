import type { Language } from '@/types';

/** Forma mínima de una zona necesaria para resolver su nombre localizado. */
export interface ZoneNameSource {
  id: string;
  name_es: string;
  name_en: string;
}

/** Una zona resuelta: su id (para `key`) y su nombre ya localizado. */
export interface ResolvedZone {
  id: string;
  name: string;
}

/**
 * `profiles.service_zones` almacena IDs de zona (uuid). Para mostrarlos hay que
 * resolverlos a su nombre localizado vía la tabla `service_zones`.
 *
 * Los IDs desconocidos o de zonas inactivas (sin match en `zones`) se **OMITEN**:
 * nunca se debe renderizar un uuid en crudo al usuario. Devuelve un arreglo
 * estable `{ id, name }` listo para mapear a badges (`key={id}`).
 */
export function resolveAgentZones(
  zones: ZoneNameSource[],
  ids: string[] | null | undefined,
  language: Language
): ResolvedZone[] {
  const nameById = new Map(
    zones.map((z) => [z.id, language === 'es' ? z.name_es : z.name_en] as const)
  );
  return (ids ?? [])
    .map((id) => ({ id, name: nameById.get(id) }))
    .filter((z): z is ResolvedZone => Boolean(z.name));
}
