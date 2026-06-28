import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';


import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRole, UserRole } from '@/hooks/useUserRole';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const { role } = useUserRole();
  const router = useRouter();

  if (allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-background p-4">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle>Acceso restringido</CardTitle>
          </div>
          <CardDescription>
            No cuentas con los permisos necesarios para ver esta sección.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Contacta a un administrador si consideras que esto es un error.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/admin')} variant="default">
              Ir al dashboard
            </Button>
            <Button onClick={() => router.push('/')} variant="outline">
              Ir al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
