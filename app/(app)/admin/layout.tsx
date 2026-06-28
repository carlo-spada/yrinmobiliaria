import type { ReactNode } from 'react';

import { RequireStaff } from '@/components/auth/NativeRouteGuards';

// Enforce el rol a nivel de ruta: TODO `/admin/*` exige staff
// (agent/admin/superadmin) + perfil completo, sin depender de que cada screen
// monte su propio guard. Antes esta lógica vivía dentro de `AdminLayout`
// (componente de pantalla), por lo que un screen que olvidara envolverse en él
// quedaba expuesto. El guard corre por encima del `view.tsx` (dynamic
// ssr:false), así que el bundle del panel ni siquiera se descarga para
// usuarios sin permiso.
export default function AdminGroupLayout({ children }: { children: ReactNode }) {
  return <RequireStaff>{children}</RequireStaff>;
}
