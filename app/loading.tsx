import { PageLoader } from '@/components/ui/page-loader';

// Fallback de Suspense a nivel de app: se muestra mientras Next resuelve un
// segmento de ruta. Reutiliza el mismo spinner de pantalla completa que usan
// los `view.tsx` para mantener un estado de carga consistente.
export default function Loading() {
  return <PageLoader />;
}
