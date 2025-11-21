import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Provide a basic matchMedia mock for components that expect it (e.g., Sonner)
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
