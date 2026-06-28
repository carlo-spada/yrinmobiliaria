/**
 * Una `photo_url` "usable" es una URL **persistente y servible** — es decir, una
 * URL `https://` real (un objeto de Supabase Storage, o un avatar remoto válido).
 *
 * Rechaza explícitamente:
 *   - `blob:` — referencia de objeto EN MEMORIA (`URL.createObjectURL`) que solo
 *     existe en la pestaña que la creó; muere al cerrar la sesión y no sirve a
 *     nadie más. Persistir una de estas (en vez de subir el archivo a Storage)
 *     es justo el bug que dejó las fotos de perfil rotas.
 *   - `data:` — datos embebidos (no es una subida real).
 *   - `http:` / rutas relativas / vacío.
 *
 * Usado tanto por el guard de los formularios de perfil (no permitir guardar una
 * URL no-Storage) como por la resolución de foto del equipo en "Nosotros".
 */
export function isUsablePhotoUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return /^https:\/\/\S+$/i.test(url.trim());
}
