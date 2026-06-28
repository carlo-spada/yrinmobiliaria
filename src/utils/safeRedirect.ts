/**
 * Devuelve una ruta interna segura para redirigir tras el login, o `null` si el
 * valor no es de confianza.
 *
 * Previene open-redirect: el `?redirect=` puede venir de una URL fabricada por
 * un atacante. Sólo se aceptan rutas del MISMO origen (mismo host); se rechazan
 * URLs absolutas (`https://evil.com`), protocol-relative (`//evil.com`) y las
 * variantes con backslash (`/\evil.com`, que los navegadores normalizan a
 * `//evil.com`). El llamador debe usar un destino por defecto cuando esto
 * devuelve `null`.
 */
export function sanitizeRedirect(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;

  // Debe ser una ruta relativa a la raíz. Descarta de entrada los esquemas y
  // las formas protocol-relative / con backslash antes incluso de parsear.
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) {
    return null;
  }

  try {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    // Resuelto contra el origen actual; el navegador normaliza `\`→`/` para
    // http(s), así que cualquier truco de host cambia `url.origin`.
    const url = new URL(raw, origin);
    if (url.origin !== origin) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
