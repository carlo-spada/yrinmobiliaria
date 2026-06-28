import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { logger } from "@/utils/logger";

import { ErrorBoundary } from "./ErrorBoundary";

// vitest eleva las llamadas a vi.mock por encima de los imports.
vi.mock("@/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

// Componente que lanza en render para disparar el boundary.
function Boom(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  // React imprime el error capturado en consola; lo silenciamos para no
  // ensuciar la salida de los tests que disparan el boundary a propósito.
  vi.spyOn(console, "error").mockImplementation(() => {});

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <p>contenido ok</p>
      </ErrorBoundary>
    );

    expect(screen.getByText("contenido ok")).toBeInTheDocument();
  });

  it("renders the Spanish fallback by default and logs the error", () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
    expect(logger.error).toHaveBeenCalledOnce();
  });

  it("renders the English fallback when language='en'", () => {
    render(
      <ErrorBoundary language="en">
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders a custom fallback when provided", () => {
    render(
      <ErrorBoundary fallback={<div>fallback propio</div>}>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByText("fallback propio")).toBeInTheDocument();
    expect(screen.queryByText("Algo salió mal")).not.toBeInTheDocument();
  });
});
