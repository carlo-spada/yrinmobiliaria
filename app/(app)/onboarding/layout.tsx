import type { ReactNode } from 'react';

import { RequireAuth } from '@/components/auth/NativeRouteGuards';

// `/onboarding` solo requiere sesión iniciada.
// IMPORTANTE: NO enforces aquí "perfil completo" (ni `requireCompletedProfile`
// ni `RequireCompleteProfile`). Provocaría un bucle de redirección infinito:
// `RequireCompleteProfile` envía a un agente con perfil incompleto justamente a
// `/onboarding/complete-profile`, así que si este layout también exigiera el
// perfil completo, rebotaría /onboarding → /onboarding sin fin.
export default function OnboardingGroupLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}
