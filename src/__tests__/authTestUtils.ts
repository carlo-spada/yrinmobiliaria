import type { Session, User } from "@supabase/supabase-js";
import { vi } from "vitest";

type RoleRow = { role: string; organization_id?: string | null; granted_at?: string };

type ProfileRow = Record<string, unknown> | null;

export const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
  },
  from: vi.fn(),
};

export const setupAuthMock = ({
  session,
  roles = [],
  profile = null,
}: {
  session: Session | null;
  roles?: RoleRow[];
  profile?: ProfileRow;
}) => {
  const subscription = { unsubscribe: vi.fn() };

  mockSupabase.auth.getSession.mockResolvedValue({ data: { session } });
  mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
    callback(session ? "SIGNED_IN" : "SIGNED_OUT", session);
    return { data: { subscription } };
  });

  mockSupabase.from.mockImplementation((table: string) => {
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

  return {
    subscription,
    reset: () => {
      vi.restoreAllMocks();
    },
  };
};

export const createSession = (user: Partial<User>): Session => {
  return {
    access_token: "token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: "refresh",
    user: user as User,
  };
};
