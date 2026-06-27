/**
 * MetaTags (neutralizado para Next.js).
 *
 * En el SPA de Vite este componente inyectaba <title>/OG/canonical vía
 * react-helmet-async. En el App Router de Next, los metadatos los produce el
 * servidor mediante `generateMetadata` en cada `page.tsx`, así que aquí no se
 * renderiza nada. Se conserva la firma para que las páginas que aún lo invocan
 * sigan compilando sin cambios.
 */
interface MetaTagsProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
}

export function MetaTags(_props: MetaTagsProps) {
  return null;
}
