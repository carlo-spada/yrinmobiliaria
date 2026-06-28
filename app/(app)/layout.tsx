import type { ReactNode } from 'react';

import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Layout del grupo privado (Next nativo). Aporta el AuthProvider a todas las
 * rutas autenticadas (auth, onboarding, cuenta, agent/*, admin/*), reemplazando
 * el rol del antiguo AuthenticatedAppShell de la isla legacy. El guard fino por
 * sesión lo hace `proxy.ts` (server-side) y el guard por rol los componentes
 * de @/components/auth/NativeRouteGuards (cliente).
 */
export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
