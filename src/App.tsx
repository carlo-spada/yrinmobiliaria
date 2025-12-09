import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, useLocation } from "react-router-dom";
import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { LanguageProvider } from "@/utils/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppRoutes } from "@/routes";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useEffect } from "react";

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <LanguageProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteProgressTracker />
            <ScrollToTop />
            <PageTransition>
              <AppRoutes />
            </PageTransition>
            <WhatsAppButton />
          </BrowserRouter>
        </LanguageProvider>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
