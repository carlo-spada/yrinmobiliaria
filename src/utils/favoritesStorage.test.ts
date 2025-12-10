import { describe, expect, it, beforeEach, vi } from "vitest";

import { FAVORITES_STORAGE_KEY, getLocalFavorites, persistLocalFavorites } from "./favoritesStorage";

describe("favoritesStorage", () => {
  beforeEach(() => {
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => delete store[key],
      clear: () => Object.keys(store).forEach((k) => delete store[k]),
      key: () => null,
      length: 0,
    });
    vi.stubGlobal("window", {
      dispatchEvent: vi.fn(),
      localStorage: globalThis.localStorage,
    } as unknown as Window);
  });

  it("returns an empty array when localStorage is empty or invalid", () => {
    expect(getLocalFavorites()).toEqual([]);
    // simulate invalid JSON
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, "{not-json");
    expect(getLocalFavorites()).toEqual([]);
  });

  it("reads favorites from localStorage when present", () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(["a", "b"]));
    expect(getLocalFavorites()).toEqual(["a", "b"]);
  });

  it("persists favorites and dispatches change event", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    persistLocalFavorites(["x", "y"]);
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual(["x", "y"]);
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
