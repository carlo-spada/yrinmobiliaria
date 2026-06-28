import type { ReactNode } from 'react';

import { RequireAuth } from '@/components/auth/NativeRouteGuards';

// `/cuenta` solo requiere sesión iniciada. `RequireAuth` es ADITIVO: la pantalla
// `UserDashboard` sigue siendo la dueña del redirect staff → `/admin` (no lo
// quites de la pantalla pensando que este layout lo reemplaza). No añadir
// `requireCompletedProfile` aquí: los usuarios 'user' no tienen perfil de agente
// que completar y se quedarían atascados.
export default function CuentaGroupLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
