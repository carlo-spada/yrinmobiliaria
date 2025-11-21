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
import { useEffect, lazy, Suspense, type ReactElement } from "react";

// Lazy load heavy components and all auth/admin/agent pages to avoid import cycles
const Index = lazy(() => import("./pages/Index"));
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetail = lazy(() => import("./pages/PropertyDetail"));
const Contact = lazy(() => import("./pages/Contact"));
const ScheduleVisit = lazy(() => import("./pages/ScheduleVisit"));
const Favorites = lazy(() => import("./pages/Favorites"));
const About = lazy(() => import("./pages/About"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const ComponentShowcase = lazy(() => import("./pages/ComponentShowcase"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const MapView = lazy(() => import("./pages/MapView"));
const AcceptInvitation = lazy(() => import("./pages/auth/AcceptInvitation"));
const CompleteProfile = lazy(() => import("./pages/onboarding/CompleteProfile"));
const AgentDashboard = lazy(() => import("./pages/agent/AgentDashboard"));
const EditProfile = lazy(() => import("./pages/agent/EditProfile"));
const UserDashboard = lazy(() => import("./pages/user/UserDashboard"));
const AgentDirectory = lazy(() => import("./pages/AgentDirectory"));
const AgentProfile = lazy(() => import("./pages/AgentProfile"));
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
              <Route path="/" element={<Suspense fallback={<PageLoader />}><Index /></Suspense>} />
              <Route path="/propiedades" element={<Suspense fallback={<PageLoader />}><Properties /></Suspense>} />
              <Route path="/propiedad/:id" element={<Suspense fallback={<PageLoader />}><PropertyDetail /></Suspense>} />
              <Route path="/favoritos" element={<Suspense fallback={<PageLoader />}><Favorites /></Suspense>} />
              <Route path="/mapa" element={<Suspense fallback={<PageLoader />}><MapView /></Suspense>} />
              <Route path="/contacto" element={<Suspense fallback={<PageLoader />}><Contact /></Suspense>} />
              <Route path="/agendar" element={<Suspense fallback={<PageLoader />}><ScheduleVisit /></Suspense>} />
              <Route path="/nosotros" element={<Suspense fallback={<PageLoader />}><About /></Suspense>} />
              <Route path="/privacidad" element={<Suspense fallback={<PageLoader />}><PrivacyPolicy /></Suspense>} />
              <Route path="/terminos" element={<Suspense fallback={<PageLoader />}><TermsOfService /></Suspense>} />
              <Route path="/auth" element={<Suspense fallback={<PageLoader />}><Auth /></Suspense>} />
              <Route path="/cuenta" element={<Suspense fallback={<PageLoader />}><UserDashboard /></Suspense>} />
              <Route path="/agentes" element={<Suspense fallback={<PageLoader />}><AgentDirectory /></Suspense>} />
              <Route path="/agentes/:slug" element={<Suspense fallback={<PageLoader />}><AgentProfile /></Suspense>} />
              <Route path="/auth/accept-invitation" element={<Suspense fallback={<PageLoader />}><AcceptInvitation /></Suspense>} />
              <Route path="/onboarding/complete-profile" element={<Suspense fallback={<PageLoader />}><CompleteProfile /></Suspense>} />
              <Route path="/agent/dashboard" element={<Suspense fallback={<PageLoader />}><AgentDashboard /></Suspense>} />
              <Route path="/agent/profile/edit" element={<Suspense fallback={<PageLoader />}><EditProfile /></Suspense>} />
              <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
              <Route path="/admin/properties" element={<Suspense fallback={<PageLoader />}><AdminProperties /></Suspense>} />
              <Route path="/admin/agents" element={<Suspense fallback={<PageLoader />}><AdminAgents /></Suspense>} />
              <Route path="/admin/zones" element={<Suspense fallback={<PageLoader />}><AdminZones /></Suspense>} />
              <Route path="/admin/inquiries" element={<Suspense fallback={<PageLoader />}><AdminInquiries /></Suspense>} />
              <Route path="/admin/visits" element={<Suspense fallback={<PageLoader />}><AdminVisits /></Suspense>} />
              <Route path="/admin/users" element={<Suspense fallback={<PageLoader />}><AdminUsers /></Suspense>} />
              <Route path="/admin/audit-logs" element={<Suspense fallback={<PageLoader />}><AdminAuditLogs /></Suspense>} />
              <Route path="/admin/settings" element={<Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />
              <Route path="/admin/health" element={<Suspense fallback={<PageLoader />}><AdminHealth /></Suspense>} />
              <Route path="/admin/seed" element={<Suspense fallback={<PageLoader />}><DatabaseSeed /></Suspense>} />
              <Route path="/componentes" element={<Suspense fallback={<PageLoader />}><ComponentShowcase /></Suspense>} />
              <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
            </Routes>
          </PageTransition>
          <WhatsAppButton />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
