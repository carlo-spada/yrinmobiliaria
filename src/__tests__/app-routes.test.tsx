import { render, screen } from "@testing-library/react";
import { beforeEach, vi } from "vitest";

const authState = vi.hoisted(() => ({
  user: null as { id: string } | null,
  loading: false,
  session: null,
  isAdmin: false,
  profile: null,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
}));

const roleState = vi.hoisted(() => ({
  role: "user",
  loading: false,
  isStaff: false,
  isSuperadmin: false,
  isAdmin: false,
  isAgent: false,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => authState,
}));

vi.mock("@/hooks/useUserRole", () => ({
  useUserRole: () => roleState,
}));

vi.mock("@/components/auth/ProfileCompletionGuard", () => ({
  ProfileCompletionGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/screens/MapView", () => ({ default: () => <div>MapViewMock</div> }));
vi.mock("@/screens/Favorites", () => ({ default: () => <div>FavoritesMock</div> }));
vi.mock("@/screens/Auth", () => ({ default: () => <div>AuthMock</div> }));
vi.mock("@/screens/Index", () => ({ default: () => <div>IndexMock</div> }));
vi.mock("@/screens/admin/AdminDashboard", () => ({ default: () => <div>AdminDashboardMock</div> }));
vi.mock("@/screens/onboarding/CompleteProfile", () => ({ default: () => <div>CompleteProfileMock</div> }));
vi.mock("@/screens/agent/AgentDashboard", () => ({ default: () => <div>AgentDashboardMock</div> }));
vi.mock("@/screens/agent/EditProfile", () => ({ default: () => <div>EditProfileMock</div> }));
vi.mock("@/components/WhatsAppButton", () => ({
  WhatsAppButton: () => <div aria-label="whatsapp-button" />,
}));

import App from "@/App";

const renderRoute = (path: string) => {
  window.history.pushState({}, "", path);
  render(<App />);
};

describe("App route protection", () => {
  beforeEach(() => {
    authState.user = null;
    authState.loading = false;
    authState.profile = null;

    roleState.role = "user";
    roleState.loading = false;
    roleState.isStaff = false;
    roleState.isSuperadmin = false;
    roleState.isAdmin = false;
    roleState.isAgent = false;
  });

  it("renders public routes", async () => {
    renderRoute("/mapa");
    expect(await screen.findByText("MapViewMock")).toBeInTheDocument();
  });

  it("redirects anonymous users away from the agent dashboard", async () => {
    renderRoute("/agent/dashboard");
    expect(await screen.findByText("AuthMock")).toBeInTheDocument();
  });

  it("redirects authenticated non-staff users away from agent routes", async () => {
    authState.user = { id: "user-1" };

    renderRoute("/agent/profile/edit");
    expect(await screen.findByText("IndexMock")).toBeInTheDocument();
  });

  it("renders agent-only routes for authorized staff", async () => {
    authState.user = { id: "agent-1" };
    roleState.role = "agent";
    roleState.isStaff = true;
    roleState.isAgent = true;

    renderRoute("/agent/dashboard");
    expect(await screen.findByText("AgentDashboardMock")).toBeInTheDocument();
  });

  it("redirects anonymous users away from onboarding", async () => {
    renderRoute("/onboarding/complete-profile");
    expect(await screen.findByText("AuthMock")).toBeInTheDocument();
  });

  it("renders onboarding for authenticated users", async () => {
    authState.user = { id: "agent-1" };

    renderRoute("/onboarding/complete-profile");
    expect(await screen.findByText("CompleteProfileMock")).toBeInTheDocument();
  });
});
