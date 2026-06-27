/**
 * Renderiza JSON-LD (schema.org) en el servidor dentro del HTML de la página,
 * que es lo que reciben los crawlers. Reemplaza la inyección client-side en
 * document.head del antiguo componente StructuredData.
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON serializado de fuentes controladas; se escapa "<" para evitar romper el <script>.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
