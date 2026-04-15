import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

import { useProperties } from "./useProperties";

const orderMock = vi.hoisted(() => vi.fn());
const selectMock = vi.hoisted(() => vi.fn(() => ({ order: orderMock })));
const fromMock = vi.hoisted(() => vi.fn(() => ({ select: selectMock })));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: fromMock,
  },
}));

describe("useProperties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("preserves agent_id in transformed property records", async () => {
    orderMock.mockResolvedValue({
      data: [
        {
          id: "property-1",
          title_es: "Casa",
          title_en: "House",
          description_es: "Descripcion",
          description_en: "Description",
          type: "casa",
          operation: "venta",
          price: 1000000,
          location: { zone: "Centro", coordinates: { lat: 16.75, lng: -93.11 } },
          features: { bathrooms: 2, constructionArea: 120 },
          amenities: [],
          property_images: [],
          image_variants: [],
          status: "disponible",
          featured: false,
          published_date: "2026-04-15T00:00:00.000Z",
          agent_id: "agent-1",
          agent: {
            id: "agent-1",
            display_name: "Jane Doe",
            photo_url: null,
            agent_level: "senior",
          },
        },
      ],
      error: null,
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        {children}
      </QueryClientProvider>
    );

    const { result } = renderHook(() => useProperties(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.[0].agent_id).toBe("agent-1");
  });
});
