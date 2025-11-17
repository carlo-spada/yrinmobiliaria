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
import Contact from "./pages/Contact";
import About from "./pages/About";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import ComponentShowcase from "./pages/ComponentShowcase";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

// Lazy load heavy components for code splitting
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const MapView = lazy(() => import("./pages/MapView"));
const Favorites = lazy(() => import("./pages/Favorites"));
const ScheduleVisit = lazy(() => import("./pages/ScheduleVisit"));

// Lazy load all admin pages (reduces initial bundle by ~70KB)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProperties = lazy(() => import("./pages/admin/AdminProperties"));
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
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/propiedades" element={<Properties />} />
                <Route path="/propiedad/:id" element={<PropertyDetail />} />
                <Route path="/favoritos" element={<Favorites />} />
                <Route path="/mapa" element={<MapView />} />
                <Route path="/contacto" element={<Contact />} />
                <Route path="/agendar" element={<ScheduleVisit />} />
                <Route path="/nosotros" element={<About />} />
                <Route path="/privacidad" element={<PrivacyPolicy />} />
                <Route path="/terminos" element={<TermsOfService />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/properties" element={<AdminProperties />} />
                <Route path="/admin/zones" element={<AdminZones />} />
                <Route path="/admin/inquiries" element={<AdminInquiries />} />
                <Route path="/admin/visits" element={<AdminVisits />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
                <Route path="/admin/health" element={<AdminHealth />} />
                <Route path="/admin/seed" element={<DatabaseSeed />} />
                <Route path="/componentes" element={<ComponentShowcase />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </PageTransition>
          <WhatsAppButton />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
