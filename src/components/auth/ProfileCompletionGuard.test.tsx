import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, vi } from "vitest";

import { ProfileCompletionGuard } from "./ProfileCompletionGuard";

const authState = vi.hoisted(() => ({
  user: { id: "agent-1" } as { id: string } | null,
  loading: false,
}));

const roleState = vi.hoisted(() => ({
  role: "agent",
  loading: false,
}));

const singleMock = vi.hoisted(() => vi.fn());
const eqMock = vi.hoisted(() => vi.fn(() => ({ single: singleMock })));
const selectMock = vi.hoisted(() => vi.fn(() => ({ eq: eqMock })));
const fromMock = vi.hoisted(() => vi.fn(() => ({ select: selectMock })));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/hooks/useUserRole", () => ({
  useUserRole: () => ({
    role: roleState.role,
    loading: roleState.loading,
    isStaff: roleState.role !== "user",
    isSuperadmin: roleState.role === "superadmin",
    isAdmin: roleState.role === "admin" || roleState.role === "superadmin",
    isAgent: roleState.role === "agent",
  }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: fromMock,
  },
}));

const renderGuard = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProfileCompletionGuard>
                <div>ProtectedContent</div>
              </ProfileCompletionGuard>
            }
          />
          <Route path="/auth" element={<div>AuthPage</div>} />
          <Route path="/onboarding/complete-profile" element={<div>OnboardingPage</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("ProfileCompletionGuard", () => {
  beforeEach(() => {
    authState.user = { id: "agent-1" };
    authState.loading = false;
    roleState.role = "agent";
    roleState.loading = false;
    singleMock.mockReset();
    fromMock.mockClear();
    selectMock.mockClear();
    eqMock.mockClear();
  });

  it("redirects anonymous users to auth", async () => {
    authState.user = null;

    renderGuard();

    expect(await screen.findByText("AuthPage")).toBeInTheDocument();
  });

  it("redirects incomplete agents to onboarding", async () => {
    singleMock.mockResolvedValue({ data: { is_complete: false }, error: null });

    renderGuard();

    expect(await screen.findByText("OnboardingPage")).toBeInTheDocument();
  });

  it("bypasses completion checks for admin users", async () => {
    roleState.role = "admin";

    renderGuard();

    expect(await screen.findByText("ProtectedContent")).toBeInTheDocument();
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("blocks access on profile lookup errors and retries cleanly", async () => {
    singleMock
      .mockResolvedValueOnce({ data: null, error: { message: "boom" } })
      .mockResolvedValueOnce({ data: { is_complete: true }, error: null });

    renderGuard();

    expect(await screen.findByText("No pudimos validar tu perfil")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => expect(screen.getByText("ProtectedContent")).toBeInTheDocument());
    expect(singleMock).toHaveBeenCalledTimes(2);
  });
});
