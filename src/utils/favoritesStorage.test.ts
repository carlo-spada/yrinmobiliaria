import { describe, expect, it, beforeEach, vi } from "vitest";

import { FAVORITES_STORAGE_KEY, getLocalFavorites, persistLocalFavorites } from "./favoritesStorage";

// Valid UUIDs for testing
const VALID_UUID_1 = "123e4567-e89b-12d3-a456-426614174000";
const VALID_UUID_2 = "987fcdeb-51a2-34e8-9f01-234567890abc";

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

  it("returns an empty array when localStorage is empty or invalid JSON", () => {
    expect(getLocalFavorites()).toEqual([]);
    // simulate invalid JSON
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, "{not-json");
    expect(getLocalFavorites()).toEqual([]);
  });

  it("reads valid UUID favorites from localStorage", () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([VALID_UUID_1, VALID_UUID_2]));
    expect(getLocalFavorites()).toEqual([VALID_UUID_1, VALID_UUID_2]);
  });

  it("rejects non-array data and clears localStorage", () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify({ invalid: true }));
    expect(getLocalFavorites()).toEqual([]);
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBeNull();
  });

  it("rejects array with non-UUID strings and clears localStorage", () => {
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(["not-a-uuid", "also-invalid"]));
    expect(getLocalFavorites()).toEqual([]);
    expect(window.localStorage.getItem(FAVORITES_STORAGE_KEY)).toBeNull();
  });

  it("persists favorites and dispatches change event", () => {
    const dispatchSpy = vi.spyOn(window, "dispatchEvent");
    persistLocalFavorites([VALID_UUID_1, VALID_UUID_2]);
    expect(JSON.parse(window.localStorage.getItem(FAVORITES_STORAGE_KEY)!)).toEqual([VALID_UUID_1, VALID_UUID_2]);
    expect(dispatchSpy).toHaveBeenCalled();
  });
});
