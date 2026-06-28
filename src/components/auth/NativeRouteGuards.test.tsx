import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

vi.mock("@/hooks/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("@/hooks/useUserRole", () => ({ useUserRole: vi.fn() }));
vi.mock("@/components/nav/Navigate", () => ({
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
}));
vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/users",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

import { RequireStaff } from "./NativeRouteGuards";

const mockUseAuth = vi.mocked(useAuth);
const mockUseUserRole = vi.mocked(useUserRole);

// Defaults overridden per test; only the fields the guards read matter.
const setAuth = (over: Partial<ReturnType<typeof useAuth>>) =>
  mockUseAuth.mockReturnValue({ user: null, loading: false, ...over } as ReturnType<typeof useAuth>);
const setRole = (over: Partial<ReturnType<typeof useUserRole>>) =>
  mockUseUserRole.mockReturnValue({
    role: "user",
    isStaff: false,
    isAdmin: false,
    isAgent: false,
    isSuperadmin: false,
    loading: false,
    ...over,
  } as ReturnType<typeof useUserRole>);

const renderGuard = (node: ReactNode) =>
  render(<QueryClientProvider client={new QueryClient()}>{node}</QueryClientProvider>);

describe("RequireStaff", () => {
  afterEach(() => vi.clearAllMocks());

  it("shows the permissions loader while auth/role resolve", () => {
    setAuth({ user: null, loading: true });
    setRole({ loading: true });

    renderGuard(<RequireStaff><div>panel</div></RequireStaff>);

    expect(screen.getByText("Verificando permisos...")).toBeInTheDocument();
    expect(screen.queryByText("panel")).not.toBeInTheDocument();
  });

  it("redirects unauthenticated users to /auth preserving the path", () => {
    setAuth({ user: null, loading: false });
    setRole({ loading: false });

    renderGuard(<RequireStaff><div>panel</div></RequireStaff>);

    const nav = screen.getByTestId("navigate");
    expect(nav.getAttribute("data-to")).toContain("/auth?redirect=");
    expect(nav.getAttribute("data-to")).toContain(encodeURIComponent("/admin/users"));
  });

  it("denies an authenticated non-staff 'user' with the Acceso Denegado card (not a silent redirect)", () => {
    setAuth({ user: { email: "u@example.com" }, loading: false });
    setRole({ role: "user", isStaff: false });

    renderGuard(<RequireStaff><div>panel</div></RequireStaff>);

    expect(screen.getByText("Acceso Denegado")).toBeInTheDocument();
    expect(screen.getByText("Usuario: u@example.com")).toBeInTheDocument();
    expect(screen.queryByTestId("navigate")).not.toBeInTheDocument();
    expect(screen.queryByText("panel")).not.toBeInTheDocument();
  });

  it("renders children for a staff user with a non-agent role (no profile gate)", () => {
    setAuth({ user: { email: "a@example.com" }, loading: false });
    setRole({ role: "admin", isStaff: true, isAdmin: true, isAgent: true });

    renderGuard(<RequireStaff><div>panel</div></RequireStaff>);

    expect(screen.getByText("panel")).toBeInTheDocument();
  });
});
