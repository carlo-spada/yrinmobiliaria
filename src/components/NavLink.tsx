'use client';

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface NavLinkCompatProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href"> {
  to: string;
  end?: boolean;
  className?: string;
  activeClassName?: string;
  /** Aceptado por compatibilidad; Next no tiene estado "pending" de navegación. */
  pendingClassName?: string;
  children?: ReactNode;
}

/**
 * Enlace de navegación con estado activo, nativo de Next (next/link + usePathname).
 * Reemplaza al `NavLink` del viejo shim `@/lib/router-compat` (retirado); misma
 * API de props para no tocar los call-sites (p.ej. AdminSidebar).
 */
const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  (
    { className, activeClassName, pendingClassName: _pendingClassName, to, end, children, ...props },
    ref
  ) => {
    const pathname = usePathname() ?? "";
    const targetPath = to.split("?")[0].split("#")[0];
    const isActive = end
      ? pathname === targetPath
      : pathname === targetPath || pathname.startsWith(`${targetPath}/`);

    return (
      <NextLink
        ref={ref}
        href={to}
        aria-current={isActive ? "page" : undefined}
        className={cn(className, isActive && activeClassName)}
        {...props}
      >
        {children}
      </NextLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
