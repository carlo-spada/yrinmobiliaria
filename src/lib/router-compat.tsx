'use client';

/**
 * Capa de compatibilidad react-router-dom → Next.js (App Router).
 *
 * Las páginas públicas y los componentes compartidos se renderizan como
 * componentes Next nativos, pero su código sigue usando la API de react-router
 * (`Link to=`, `useNavigate`, `useLocation`, `useParams`, `useSearchParams`,
 * `NavLink`, `Navigate`). Este módulo reexporta equivalentes respaldados por
 * `next/link` y `next/navigation` con esa misma forma, de modo que basta con
 * cambiar la línea de `import` (de 'react-router-dom' a '@/lib/router-compat')
 * sin tocar los cientos de call-sites.
 *
 * La isla legacy (rutas privadas) conserva react-router-dom real bajo un
 * BrowserRouter, así que NO usa este shim.
 */
import NextLink from 'next/link';
import {
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
  useParams as useNextParams,
} from 'next/navigation';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from 'react';

type To = string | { pathname?: string; search?: string; hash?: string };

function resolveTo(to: To): string {
  if (typeof to === 'string') return to;
  const { pathname = '', search = '', hash = '' } = to;
  const normalizedSearch = search && !search.startsWith('?') ? `?${search}` : search;
  const normalizedHash = hash && !hash.startsWith('#') ? `#${hash}` : hash;
  return `${pathname}${normalizedSearch}${normalizedHash}`;
}

// ---------------------------------------------------------------------------
// Link
// ---------------------------------------------------------------------------
type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: To;
  replace?: boolean;
  state?: unknown;
  reloadDocument?: boolean;
  prefetch?: boolean;
};

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { to, replace, state: _state, reloadDocument, prefetch, ...rest },
  ref
) {
  const href = resolveTo(to);
  if (reloadDocument) {
    return <a ref={ref} href={href} {...rest} />;
  }
  return <NextLink ref={ref} href={href} replace={replace} prefetch={prefetch} {...rest} />;
});

// ---------------------------------------------------------------------------
// NavLink
// ---------------------------------------------------------------------------
type NavLinkRenderProps = { isActive: boolean; isPending: boolean };
type NavLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'style' | 'children'> & {
  to: To;
  end?: boolean;
  replace?: boolean;
  prefetch?: boolean;
  className?: string | ((props: NavLinkRenderProps) => string);
  style?: CSSProperties | ((props: NavLinkRenderProps) => CSSProperties);
  children?: ReactNode | ((props: NavLinkRenderProps) => ReactNode);
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { to, end, replace, prefetch, className, style, children, ...rest },
  ref
) {
  const pathname = usePathname() ?? '';
  const href = resolveTo(to);
  const targetPath = href.split('?')[0].split('#')[0];
  const isActive = end
    ? pathname === targetPath
    : pathname === targetPath || pathname.startsWith(`${targetPath}/`);
  const renderProps: NavLinkRenderProps = { isActive, isPending: false };

  const resolvedClassName = typeof className === 'function' ? className(renderProps) : className;
  const resolvedStyle = typeof style === 'function' ? style(renderProps) : style;
  const resolvedChildren = typeof children === 'function' ? children(renderProps) : children;

  return (
    <NextLink
      ref={ref}
      href={href}
      replace={replace}
      prefetch={prefetch}
      className={resolvedClassName}
      style={resolvedStyle}
      aria-current={isActive ? 'page' : undefined}
      {...rest}
    >
      {resolvedChildren}
    </NextLink>
  );
});

// ---------------------------------------------------------------------------
// useNavigate
// ---------------------------------------------------------------------------
type NavigateOptions = { replace?: boolean; state?: unknown };
type NavigateFunction = {
  (to: To, options?: NavigateOptions): void;
  (delta: number): void;
};

export function useNavigate(): NavigateFunction {
  const router = useRouter();
  return useCallback(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        if (to < 0) router.back();
        else if (to > 0) router.forward();
        return;
      }
      const href = resolveTo(to);
      if (options?.replace) router.replace(href);
      else router.push(href);
    },
    [router]
  ) as NavigateFunction;
}

// ---------------------------------------------------------------------------
// useLocation
// ---------------------------------------------------------------------------
type Location = {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  key: string;
};

export function useLocation(): Location {
  const pathname = usePathname() ?? '';
  const searchParams = useNextSearchParams();
  const search = searchParams?.toString() ? `?${searchParams.toString()}` : '';
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  // `state` no se soporta: Next no preserva estado de navegación como react-router.
  // Si se necesita pasar datos entre rutas, usar query params o sessionStorage.
  return useMemo(
    () => ({ pathname, search, hash, state: null, key: 'default' }),
    [pathname, search, hash]
  );
}

// ---------------------------------------------------------------------------
// useParams
// ---------------------------------------------------------------------------
export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  return (useNextParams() ?? {}) as T;
}

// ---------------------------------------------------------------------------
// useSearchParams (tupla, como react-router)
// ---------------------------------------------------------------------------
type SetSearchParamsArg =
  | URLSearchParams
  | Record<string, string | string[]>
  | ((prev: URLSearchParams) => URLSearchParams | Record<string, string | string[]>);

function toURLSearchParams(value: URLSearchParams | Record<string, string | string[]>): URLSearchParams {
  if (value instanceof URLSearchParams) return value;
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(value)) {
    if (Array.isArray(val)) val.forEach((v) => params.append(key, v));
    else params.set(key, val);
  }
  return params;
}

export function useSearchParams(): [URLSearchParams, (next: SetSearchParamsArg, options?: NavigateOptions) => void] {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  const nextSearchParams = useNextSearchParams();
  const current = useMemo(
    () => new URLSearchParams(nextSearchParams?.toString() ?? ''),
    [nextSearchParams]
  );

  const setSearchParams = useCallback(
    (next: SetSearchParamsArg, options?: NavigateOptions) => {
      const resolved =
        typeof next === 'function'
          ? next(new URLSearchParams(current.toString()))
          : next;
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

// ---------------------------------------------------------------------------
// Navigate (componente de redirección)
// ---------------------------------------------------------------------------
export function Navigate({ to, replace }: { to: To; replace?: boolean; state?: unknown }) {
  const router = useRouter();
  useEffect(() => {
    const href = resolveTo(to);
    if (replace) router.replace(href);
    else router.push(href);
  }, [router, to, replace]);
  return null;
}
