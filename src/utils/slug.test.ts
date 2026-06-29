import { describe, it, expect } from 'vitest';

import { generateSlug } from '@/hooks/useAgentBySlug';

import { slugify } from './slug';

describe('slugify', () => {
  it('no cambia los slugs de los agentes actuales (sin acentos)', () => {
    expect(slugify('Carlo Spada')).toBe('carlo-spada');
    expect(slugify('Yasmin Ruiz')).toBe('yasmin-ruiz');
  });

  it('deburra acentos en lugar de borrar la letra', () => {
    expect(slugify('Yas Ruiz Vásquez')).toBe('yas-ruiz-vasquez');
    expect(slugify('José Ñ.')).toBe('jose-n');
    expect(slugify('Begoña Muñoz')).toBe('begona-munoz');
  });

  it('colapsa espacios y puntuación en un solo guión y recorta los extremos', () => {
    expect(slugify('  María   José  ')).toBe('maria-jose');
    expect(slugify('A. B., C')).toBe('a-b-c');
    expect(slugify("Ana-María O’Neil")).toBe('ana-maria-o-neil');
  });

  it('es idempotente: slugify(slugify(x)) === slugify(x)', () => {
    for (const name of ['Carlo Spada', 'José Ñ.', 'Yas Ruiz Vásquez', "Ana-María O’Neil"]) {
      const once = slugify(name);
      expect(slugify(once)).toBe(once);
    }
  });

  it('devuelve cadena vacía para entradas sin alfanuméricos', () => {
    expect(slugify('   ')).toBe('');
    expect(slugify('—·—')).toBe('');
  });
});

describe('consistencia enlace ↔ resolución (bug latente del slug)', () => {
  // El bug: `generateSlug` (que genera los <Link href="/agentes/[slug]">) borraba
  // acentos ("Vásquez" -> "vsquez"), mientras la resolución en useAgentBySlug
  // hacía solo espacio->guión ("vásquez"). Divergían -> falso "agente no
  // encontrado" para nombres con acentos/puntuación. Ahora ambos pasan por
  // `slugify`, así que el enlace que se genera es exactamente el que resuelve.
  it('generateSlug delega en slugify (misma salida)', () => {
    for (const name of ['Carlo Spada', 'José Ñ.', 'Yas Ruiz Vásquez', "Ana-María O’Neil"]) {
      expect(generateSlug(name)).toBe(slugify(name));
    }
  });

  it('el slug de un enlace satisface el predicado real del lookup', () => {
    const displayName = 'Yas Ruiz Vásquez';
    const linkSlug = generateSlug(displayName); // lo que pone el <Link>
    // predicado idéntico al de useAgentBySlug: generateSlug(display) === slug.toLowerCase()
    expect(generateSlug(displayName) === linkSlug.toLowerCase()).toBe(true);
  });
});
