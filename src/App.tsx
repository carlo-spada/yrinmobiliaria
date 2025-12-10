import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NProgress from "nprogress";
import { useEffect } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";

import { PageTransition } from "@/components/animations/PageTransition";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppRoutes } from "@/routes";

import "nprogress/nprogress.css";

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
