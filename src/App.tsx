import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { LanguageProvider } from "@/utils/LanguageContext";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import MapView from "./pages/MapView";
import Contact from "./pages/Contact";
import ScheduleVisit from "./pages/ScheduleVisit";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import DatabaseSeed from "./pages/admin/DatabaseSeed";
import ComponentShowcase from "./pages/ComponentShowcase";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProperties from "./pages/admin/AdminProperties";
import AdminZones from "./pages/admin/AdminZones";
import AdminInquiries from "./pages/admin/AdminInquiries";
import AdminVisits from "./pages/admin/AdminVisits";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <PageTransition>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/propiedades" element={<Properties />} />
              <Route path="/propiedad/:id" element={<PropertyDetail />} />
              <Route path="/favoritos" element={<Favorites />} />
              <Route path="/mapa" element={<MapView />} />
              <Route path="/contacto" element={<Contact />} />
              <Route path="/agendar" element={<ScheduleVisit />} />
              <Route path="/nosotros" element={<About />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/properties" element={<AdminProperties />} />
              <Route path="/admin/zones" element={<AdminZones />} />
              <Route path="/admin/inquiries" element={<AdminInquiries />} />
              <Route path="/admin/visits" element={<AdminVisits />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/seed" element={<DatabaseSeed />} />
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
