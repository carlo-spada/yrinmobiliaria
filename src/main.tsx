import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { validateSupabaseEnv, SupabaseConfigError } from "./utils/supabaseValidation";
import { initGA } from "./utils/analytics";

// Initialize Google Analytics if measurement ID is provided
initGA();

// Validate Supabase configuration before rendering the app
const validation = validateSupabaseEnv();

if (!validation.isValid) {
  createRoot(document.getElementById("root")!).render(
    <SupabaseConfigError error={validation.error!} />
  );
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
