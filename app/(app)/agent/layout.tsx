import type { ReactNode } from 'react';

import { RequireRole } from '@/components/auth/NativeRouteGuards';

// `/agent/*` exige rol agent/admin/superadmin + perfil completo, aplicado a
// nivel de ruta. Antes el mismo `RequireRole` se repetía en cada `view.tsx`.
export default function AgentGroupLayout({ children }: { children: ReactNode }) {
  return (
    <RequireRole allowedRoles={['agent', 'admin', 'superadmin']} requireCompletedProfile>
      {children}
    </RequireRole>
  );
}
