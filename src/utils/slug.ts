/**
 * Convierte un nombre visible (p. ej. "Yas Ruiz Vásquez") en un slug de URL
 * estable y seguro ("yas-ruiz-vasquez").
 *
 * ÚNICA fuente de verdad para los slugs de agente. TODOS los productores y
 * consumidores deben usar esta función:
 *   - generación de enlaces  -> `generateSlug` (AgentCard, PropertyCard, ...)
 *   - resolución del slug     -> `useAgentBySlug`
 *   - render de servidor      -> `seo-server` (`generateStaticParams`, metadata
 *                                canónica, JSON-LD)
 * Si divergen, un enlace válido cae en "agente no encontrado" o el canonical de
 * SEO apunta a otra URL (era el bug latente: el generador borraba acentos
 * — "Vásquez" -> "vsquez" — mientras la resolución hacía solo espacio->guión).
 *
 * - "deburra" acentos vía NFD ("Vásquez" -> "vasquez", "Ñ" -> "n") en vez de
 *   borrar la letra acentuada.
 * - colapsa cualquier secuencia de caracteres no alfanuméricos en un solo "-".
 * - recorta guiones sobrantes. Idempotente: `slugify(slugify(x)) === slugify(x)`.
 */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // quita marcas diacríticas combinantes (deburr)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // espacios y puntuación -> un solo guión
    .replace(/^-+|-+$/g, ''); // sin guiones al inicio/fin
}
