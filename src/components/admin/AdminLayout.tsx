import { ReactNode, useState } from 'react';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SidebarProvider } from '@/components/ui/sidebar';

import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-open';

interface AdminLayoutProps {
  children: ReactNode;
}

// Locked-viewport dashboard shell. The whole screen is partitioned into strict,
// non-overlapping regions:
//   ┌────────────┬──────────────────────┐
//   │            │  header (top)        │
//   │  sidebar   ├──────────────────────┤
//   │  (in-flow) │  main (scrolls)      │
//   └────────────┴──────────────────────┘
// The sidebar is an in-flow flex column (never `fixed`/`absolute`), so it
// physically reserves its own width and nothing can slide on top of it.
const AdminLayoutContent = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen w-full overflow-hidden">
      <AdminSidebar />
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

// El guard de acceso (auth → isStaff → perfil completo, con su tarjeta "Acceso
// Denegado") ahora vive en `app/(app)/admin/layout.tsx` (RequireStaff). Este
// componente es solo el shell (sidebar + header) que reutiliza cada screen del
// panel; ya no decide permisos.
export const AdminLayout = ({ children }: AdminLayoutProps) => {
  // Persist sidebar open state - use useState with initializer
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      return stored !== null ? stored === 'true' : true; // Default to open
    } catch {
      return true;
    }
  });

  const handleSidebarChange = (open: boolean) => {
    setSidebarOpen(open);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
    } catch {
      // localStorage not available
    }
  };

  return (
    <ErrorBoundary>
      <SidebarProvider open={sidebarOpen} onOpenChange={handleSidebarChange}>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </SidebarProvider>
    </ErrorBoundary>
  );
};
