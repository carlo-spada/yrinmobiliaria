import { act, renderHook } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useFavorites } from "./useFavorites";
import { FAVORITES_STORAGE_KEY } from "@/utils/favoritesStorage";

const mockToast = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: null }),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: { onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })), getSession: vi.fn() },
  },
}));

describe("useFavorites (guest/local mode)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "localStorage", {
      value: (() => {
        const store: Record<string, string> = {};
        return {
          getItem: (key: string) => store[key] ?? null,
          setItem: (key: string, value: string) => {
            store[key] = value;
          },
          removeItem: (key: string) => delete store[key],
          clear: () => Object.keys(store).forEach((k) => delete store[k]),
        };
      })(),
      writable: true,
    });
    (window as unknown as { gtag?: unknown }).gtag = vi.fn();
  });

  it("defaults to empty favorites when storage is empty", async () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("adds and removes favorites for guests and persists to localStorage", async () => {
    const { result } = renderHook(() => useFavorites());

    await act(async () => {
      await result.current.addFavorite("prop-1");
    });
    expect(result.current.favorites).toContain("prop-1");
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual(["prop-1"]);

    await act(async () => {
      await result.current.removeFavorite("prop-1");
    });
    expect(result.current.favorites).toEqual([]);
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual([]);
  });
});
