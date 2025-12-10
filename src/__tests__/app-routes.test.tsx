import { render, screen } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";

vi.mock("@/pages/MapView", () => ({ default: () => <div>MapViewMock</div> }));
vi.mock("@/pages/Favorites", () => ({ default: () => <div>FavoritesMock</div> }));
vi.mock("@/pages/Auth", () => ({ default: () => <div>AuthMock</div> }));
vi.mock("@/pages/admin/AdminDashboard", () => ({ default: () => <div>AdminDashboardMock</div> }));
vi.mock("@/components/WhatsAppButton", () => ({
  WhatsAppButton: () => <div aria-label="whatsapp-button" />,
}));

import App from "@/App";

const renderRoute = (path: string) => {
  window.history.pushState({}, "", path);
  render(<App />);
};

describe("App routing smoke tests", () => {
  it("renders the map route", async () => {
    renderRoute("/mapa");
    expect(await screen.findByText("MapViewMock")).toBeInTheDocument();
  });

  it("renders the favorites route", async () => {
    renderRoute("/favoritos");
    expect(await screen.findByText("FavoritesMock")).toBeInTheDocument();
  });

  it("renders the auth route", async () => {
    renderRoute("/auth");
    expect(await screen.findByText("AuthMock")).toBeInTheDocument();
  });

  it("renders the admin dashboard route", async () => {
    renderRoute("/admin");
    expect(await screen.findByText("AdminDashboardMock")).toBeInTheDocument();
  });
});
