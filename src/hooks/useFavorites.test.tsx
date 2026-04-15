import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FAVORITES_STORAGE_KEY } from "@/utils/favoritesStorage";

import { useFavorites } from "./useFavorites";

const mockToast = vi.fn();
const supabaseMock = vi.hoisted(() => ({
  from: vi.fn(),
}));

const sessionState = {
  user: null as { id: string; email?: string | null } | null,
  loading: false,
};

const GUEST_PROPERTY_ID = "11111111-1111-4111-8111-111111111111";
const EXISTING_PROPERTY_ID = "22222222-2222-4222-8222-222222222222";
const NEW_PROPERTY_ID = "33333333-3333-4333-8333-333333333333";

vi.mock("@/hooks/usePublicSession", () => ({
  usePublicSession: () => sessionState,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: supabaseMock,
}));

const createWrapper = () => {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};

describe("useFavorites", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionState.user = null;
    sessionState.loading = false;
    supabaseMock.from.mockReset();
    window.localStorage.clear();
    (window as unknown as { gtag?: unknown }).gtag = vi.fn();
  });

  it("defaults to empty favorites when storage is empty", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.favorites).toEqual([]);
  });

  it("adds and removes favorites for guests and persists to localStorage", async () => {
    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.addFavorite(GUEST_PROPERTY_ID);
    });

    await waitFor(() => {
      expect(result.current.favorites).toContain(GUEST_PROPERTY_ID);
    });
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual([GUEST_PROPERTY_ID]);

    await act(async () => {
      await result.current.removeFavorite(GUEST_PROPERTY_ID);
    });

    await waitFor(() => {
      expect(result.current.favorites).toEqual([]);
    });
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual([]);
  });

  it("loads and mutates favorites for signed-in users", async () => {
    sessionState.user = { id: "user-1", email: "user@example.com" };

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ data: [{ property_id: EXISTING_PROPERTY_ID }], error: null }),
    });
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    });

    supabaseMock.from.mockImplementation((table: string) => {
      if (table === "user_favorites") {
        return {
          select: () => mockSelect(),
          insert: mockInsert,
          delete: mockDelete,
        };
      }

      return {};
    });

    const { result } = renderHook(() => useFavorites(), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.favorites).toContain(EXISTING_PROPERTY_ID);
    });

    await act(async () => {
      await result.current.addFavorite(NEW_PROPERTY_ID);
    });

    await waitFor(() => {
      expect(result.current.favorites).toContain(NEW_PROPERTY_ID);
    });
    expect(mockInsert).toHaveBeenCalled();

    await act(async () => {
      await result.current.removeFavorite(EXISTING_PROPERTY_ID);
    });

    await waitFor(() => {
      expect(result.current.favorites).not.toContain(EXISTING_PROPERTY_ID);
    });
    expect(mockDelete).toHaveBeenCalled();
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBeNull();
  });
});
