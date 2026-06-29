import type { Language } from '@/types';

/** Fecha legible para el locale (degrada a '' si la fecha es inválida). */
export function formatPostDate(iso: string, locale: Language): string {
  try {
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

/** Parte el contenido en párrafos por líneas en blanco (render mínimo y seguro). */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Extracto de 160 chars para meta description / og. */
export function excerpt(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, 160);
}
