import { Outlet } from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';

export function AuthenticatedAppShell() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}
