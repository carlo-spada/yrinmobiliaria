import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

import { NavLink as RouterNavLink } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href"> {
  to: string;
  end?: boolean;
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  children?: ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, end, children, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        end={end}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      >
        {children}
      </RouterNavLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
