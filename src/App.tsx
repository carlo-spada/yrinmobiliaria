import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { LanguageProvider } from "@/utils/LanguageContext";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect, lazy, Suspense } from "react";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Contact from "./pages/Contact";
import ScheduleVisit from "./pages/ScheduleVisit";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ComponentShowcase from "./pages/ComponentShowcase";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AcceptInvitation from "./pages/auth/AcceptInvitation";
import CompleteProfile from "./pages/onboarding/CompleteProfile";
import AgentDashboard from "./pages/agent/AgentDashboard";
import EditProfile from "./pages/agent/EditProfile";

// Lazy load only truly heavy components (Map with Leaflet, Admin pages)
const MapView = lazy(() => import("./pages/MapView"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
const AdminAgents = lazy(() => import("./pages/admin/AdminAgents"));
const AdminZones = lazy(() => import("./pages/admin/AdminZones"));
const AdminInquiries = lazy(() => import("./pages/admin/AdminInquiries"));
const AdminVisits = lazy(() => import("./pages/admin/AdminVisits"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminHealth = lazy(() => import("./pages/admin/AdminHealth"));
const DatabaseSeed = lazy(() => import("./pages/admin/DatabaseSeed"));

const queryClient = new QueryClient();

// Configure NProgress
NProgress.configure({ showSpinner: false, trickleSpeed: 200 });

// Route progress tracker component
function RouteProgressTracker() {
  const location = useLocation();
  
  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => {
      NProgress.done();
    }, 200);
    
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [location.pathname]);
  
  return null;
}

// Loading fallback for lazy-loaded components
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RouteProgressTracker />
          <ScrollToTop />
          <PageTransition>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/propiedades" element={<Properties />} />
              <Route path="/propiedad/:id" element={<PropertyDetail />} />
              <Route path="/favoritos" element={<Favorites />} />
              <Route path="/mapa" element={
                <Suspense fallback={<PageLoader />}>
                  <MapView />
                </Suspense>
              } />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/agendar" element={<ScheduleVisit />} />
              <Route path="/nosotros" element={<About />} />
              <Route path="/privacidad" element={<PrivacyPolicy />} />
              <Route path="/terminos" element={<TermsOfService />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/accept-invitation" element={<AcceptInvitation />} />
              <Route path="/onboarding/complete-profile" element={<CompleteProfile />} />
              <Route path="/agent/dashboard" element={<AgentDashboard />} />
              <Route path="/agent/profile/edit" element={<EditProfile />} />
              <Route path="/admin" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminDashboard />
                </Suspense>
              } />
              <Route path="/admin/properties" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminProperties />
                </Suspense>
              } />
              <Route path="/admin/agents" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminAgents />
                </Suspense>
              } />
              <Route path="/admin/zones" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminZones />
                </Suspense>
              } />
              <Route path="/admin/inquiries" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminInquiries />
                </Suspense>
              } />
              <Route path="/admin/visits" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminVisits />
                </Suspense>
              } />
              <Route path="/admin/users" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminUsers />
                </Suspense>
              } />
              <Route path="/admin/audit-logs" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminAuditLogs />
                </Suspense>
              } />
              <Route path="/admin/settings" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminSettings />
                </Suspense>
              } />
              <Route path="/admin/health" element={
                <Suspense fallback={<PageLoader />}>
                  <AdminHealth />
                </Suspense>
              } />
              <Route path="/admin/seed" element={
                <Suspense fallback={<PageLoader />}>
                  <DatabaseSeed />
                </Suspense>
              } />
              <Route path="/componentes" element={<ComponentShowcase />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
          <WhatsAppButton />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
