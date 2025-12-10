import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";

import App from "./App.tsx";
import "./index.css";
import { initGA } from "./utils/analytics";
import { validateSupabaseEnv, SupabaseConfigError } from "./utils/supabaseValidation";

// Initialize Google Analytics if measurement ID is provided
initGA();

// Validate Supabase configuration before rendering the app
const validation = validateSupabaseEnv();

if (!validation.isValid) {
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <SupabaseConfigError error={validation.error!} />
    </HelmetProvider>
  );
} else {
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
}
