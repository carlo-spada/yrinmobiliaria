import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import MapView from "./pages/MapView";
import Contact from "./pages/Contact";
import ScheduleVisit from "./pages/ScheduleVisit";
import About from "./pages/About";
import ComponentShowcase from "./pages/ComponentShowcase";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <PageTransition>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/propiedades" element={<Properties />} />
            <Route path="/propiedad/:id" element={<PropertyDetail />} />
            <Route path="/mapa" element={<MapView />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/agendar" element={<ScheduleVisit />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/componentes" element={<ComponentShowcase />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PageTransition>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
