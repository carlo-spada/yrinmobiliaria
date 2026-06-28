'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

type SetArg =
  | URLSearchParams
  | Record<string, string | string[]>
  | ((prev: URLSearchParams) => URLSearchParams | Record<string, string | string[]>);

function toURLSearchParams(
  value: URLSearchParams | Record<string, string | string[]>
): URLSearchParams {
  if (value instanceof URLSearchParams) return value;
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(value)) {
    if (Array.isArray(val)) val.forEach((v) => params.append(key, v));
    else params.set(key, val);
  }
  return params;
}

/**
 * Equivalente a `useSearchParams` de react-router: devuelve `[params, setParams]`.
 *
 * Next sólo expone los search params en modo lectura (`useSearchParams`), así
 * que el setter empuja una nueva URL con el router. Reemplaza al setter que
 * aportaba el viejo shim `@/lib/router-compat` (retirado); los call-sites que
 * sólo leen pueden usar `useSearchParams` de `next/navigation` directamente.
 */
export function useSearchParamsState(): [
  URLSearchParams,
  (next: SetArg, options?: { replace?: boolean }) => void,
] {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const nextSearchParams = useSearchParams();
  const current = useMemo(
    () => new URLSearchParams(nextSearchParams?.toString() ?? ''),
    [nextSearchParams]
  );

  const setSearchParams = useCallback(
    (next: SetArg, options?: { replace?: boolean }) => {
      const resolved =
        typeof next === 'function' ? next(new URLSearchParams(current.toString())) : next;
      const params = toURLSearchParams(resolved);
      const query = params.toString();
      const url = query ? `${pathname}?${query}` : pathname;
      if (options?.replace) router.replace(url);
      else router.push(url);
    },
    [router, pathname, current]
  );

  return [current, setSearchParams];
}
