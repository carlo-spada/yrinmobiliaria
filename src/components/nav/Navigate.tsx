'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Redirección declarativa para componentes cliente.
 *
 * Next no trae un equivalente nativo a `<Navigate>` de react-router, así que
 * este componente empuja (o reemplaza) la ruta tras montar. Reemplaza al
 * `Navigate` que aportaba el viejo shim `@/lib/router-compat` (retirado).
 */
export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}
