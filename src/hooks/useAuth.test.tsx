import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, beforeEach, vi } from "vitest";
import type { Session, User } from "@supabase/supabase-js";

const supabaseMock = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
  },
  from: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: supabaseMock,
}));

import { useAuth } from "./useAuth";

const createSession = (user: Partial<User>): Session =>
  ({
    access_token: "token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "refresh",
    user: user as User,
  } as Session);

const setupAuthMock = ({
  session,
  roles = [],
  profile = null,
}: {
  session: Session | null;
  roles?: { role: string; organization_id?: string | null; granted_at?: string }[];
  profile?: Record<string, unknown> | null;
}) => {
  const subscription = { unsubscribe: vi.fn() };

  supabaseMock.auth.getSession.mockResolvedValue({ data: { session } });
  supabaseMock.auth.onAuthStateChange.mockImplementation((callback) => {
    callback(session ? "SIGNED_IN" : "SIGNED_OUT", session);
    return { data: { subscription } };
  });

  supabaseMock.from.mockImplementation((table: string) => {
    if (table === "role_assignments") {
      return {
        select: () => ({
          eq: () => ({
            in: () => ({
              limit: () => Promise.resolve({ data: roles, error: null }),
            }),
          }),
        }),
      };
    }

    if (table === "profiles") {
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: profile, error: null }),
          }),
        }),
      };
    }

    return {
      select: () => Promise.resolve({ data: null, error: null }),
    };
  });
};

describe("useAuth", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
  );

  it("sets isAdmin for admin roles", async () => {
    const session = createSession({ id: "user-1", email: "admin@example.com" });
    setupAuthMock({
      session,
      roles: [{ role: "admin" }],
      profile: { id: "profile-1", user_id: "user-1" },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user?.id).toBe("user-1");
    expect(result.current.isAdmin).toBe(true);
  });

  it("flags non-admin when no admin roles", async () => {
    const session = createSession({ id: "user-2", email: "user@example.com" });
    setupAuthMock({
      session,
      roles: [], // no admin/superadmin roles
      profile: { id: "profile-2", user_id: "user-2" },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user?.id).toBe("user-2");
    expect(result.current.isAdmin).toBe(false);
  });
});
