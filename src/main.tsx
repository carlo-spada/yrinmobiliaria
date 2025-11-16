import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./i18n";
import { validateSupabaseEnv, SupabaseConfigError } from "./utils/supabaseValidation";

// Validate Supabase configuration before rendering the app
const validation = validateSupabaseEnv();

if (!validation.isValid) {
  createRoot(document.getElementById("root")!).render(
    <SupabaseConfigError error={validation.error!} />
  );
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
