import type { Language } from '@/types';

/**
 * i18n por URL: el español vive en la raíz (URLs canónicas, sin prefijo) y el
 * inglés en un espejo bajo `/en`. Estas son funciones PURAS (sin React/Next) para
 * poder testearlas y reusarlas tanto en servidor (metadata/sitemap) como en
 * cliente (links/selector). La derivación del locale es por URL, nunca por cookie.
 */

export const LOCALES = ['es', 'en'] as const;
export const DEFAULT_LOCALE: Language = 'es';
export const EN_PREFIX = '/en';

/**
 * Segmentos públicos de primer nivel que tienen espejo `/en`. Un href cuyo primer
 * segmento no esté aquí (admin, agent, cuenta, auth, onboarding, …) NUNCA recibe
 * prefijo de idioma — así un `<LocaleLink>` puede vivir en componentes
 * compartidos sin romper las rutas privadas.
 */
const PUBLIC_FIRST_SEGMENTS = new Set([
  '', // home '/'
  'propiedades',
  'propiedad',
  'agentes',
  'mapa',
  'nosotros',
  'contacto',
  'agendar',
  'privacidad',
  'terminos',
  'derechos-arco',
  'favoritos',
  'blog',
]);

/** Primer segmento de una ruta: '/propiedad/123?x=1#h' → 'propiedad'. */
function firstSegment(path: string): string {
  const clean = path.split('?')[0].split('#')[0];
  return clean.replace(/^\/+/, '').split('/')[0] ?? '';
}

/** ¿La ruta canónica (sin prefijo de idioma) es pública con espejo `/en`? */
export function isPublicPath(path: string): boolean {
  return PUBLIC_FIRST_SEGMENTS.has(firstSegment(path));
}

/** Locale derivado del pathname: 'en' si está bajo `/en`, si no 'es'. */
export function localeFromPathname(pathname: string): Language {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? 'en' : 'es';
}

/** Quita el prefijo `/en` → ruta canónica ES. `/en` → `/`. Conserva query/hash. */
export function stripLocale(pathname: string): string {
  if (pathname === EN_PREFIX) return '/';
  if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length) || '/';
  return pathname;
}

/**
 * Aplica un locale a una ruta canónica ES (sin prefijo): 'es' la deja igual, 'en'
 * antepone `/en`. Conserva query/hash. `withLocale('/', 'en')` → `/en`.
 */
export function withLocale(canonicalPath: string, locale: Language): string {
  const path = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
  if (locale === 'es') return path;
  if (path === '/') return EN_PREFIX;
  return `${EN_PREFIX}${path}`;
}

/**
 * Localiza un `href` para `<LocaleLink>`: en inglés antepone `/en` SOLO a rutas
 * internas públicas. Deja intactos: externos/esquemas (`http:`, `mailto:`, `//`),
 * anclas/queries puros (`#`, `?`), rutas ya prefijadas con `/en`, rutas privadas
 * (admin/agent/…), y cualquier cosa en español (canónico = sin prefijo).
 */
export function localizedHref(href: string, language: Language): string {
  if (typeof href !== 'string' || href === '') return href;
  // Externos, esquemas, protocol-relative, anclas o queries puros: no tocar.
  if (/^([a-z][a-z0-9+.-]*:|\/\/|#|\?)/i.test(href)) return href;
  if (!href.startsWith('/')) return href; // relativo: no tocar
  if (language !== 'en') return href; // ES = canónico (sin prefijo)
  if (localeFromPathname(href) === 'en') return href; // ya prefijado
  if (!isPublicPath(href)) return href; // ruta privada: sin prefijo
  return withLocale(href, 'en');
}
