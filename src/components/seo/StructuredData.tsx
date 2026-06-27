/**
 * StructuredData (neutralizado para Next.js).
 *
 * En el SPA de Vite inyectaba JSON-LD en document.head desde el cliente. En el
 * App Router, el JSON-LD se renderiza en el servidor dentro de cada `page.tsx`
 * (etiqueta <script type="application/ld+json">), que es lo que los crawlers
 * reciben en la respuesta HTML. Se conserva la firma por compatibilidad.
 */
export type SchemaType = 'Organization' | 'Product' | 'BreadcrumbList' | 'LocalBusiness' | 'Person';

interface StructuredDataProps {
  type: SchemaType;
  data: Record<string, unknown>;
}

export function StructuredData(_props: StructuredDataProps) {
  return null;
}
