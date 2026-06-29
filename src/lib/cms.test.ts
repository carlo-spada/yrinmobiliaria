import { describe, it, expect } from 'vitest';

import { extractCmsText } from '@/lib/cms';

describe('extractCmsText', () => {
  it('devuelve el string directo', () => {
    expect(extractCmsText('# Hola\n\nmundo')).toBe('# Hola\n\nmundo');
  });

  it('lee objetos {markdown|html|body|text|content}', () => {
    expect(extractCmsText({ markdown: 'A' })).toBe('A');
    expect(extractCmsText({ html: '<p>B</p>' })).toBe('<p>B</p>');
    expect(extractCmsText({ body: 'C' })).toBe('C');
    expect(extractCmsText({ text: 'D' })).toBe('D');
    expect(extractCmsText({ content: 'E' })).toBe('E');
  });

  it('une arreglos de bloques con doble salto de línea', () => {
    expect(extractCmsText(['uno', 'dos'])).toBe('uno\n\ndos');
    expect(extractCmsText([{ text: 'uno' }, { text: 'dos' }])).toBe('uno\n\ndos');
  });

  it('soporta {blocks:[...]} y contenido anidado', () => {
    expect(extractCmsText({ blocks: [{ text: 'x' }, { text: 'y' }] })).toBe('x\n\ny');
    expect(extractCmsText({ content: [{ text: 'z' }] })).toBe('z');
  });

  it('degrada a "" para null/undefined/number/forma desconocida', () => {
    expect(extractCmsText(null)).toBe('');
    expect(extractCmsText(undefined)).toBe('');
    expect(extractCmsText(42)).toBe('');
    expect(extractCmsText({ foo: 'bar' })).toBe('');
  });
});
