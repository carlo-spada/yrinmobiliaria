import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminUsers() {
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Usuarios y Roles</h2>
          <p className="text-muted-foreground">Gestiona los roles de usuario del sistema</p>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID de Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de Asignación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRoles?.map((userRole) => (
                <TableRow key={userRole.id}>
                  <TableCell className="font-mono text-sm">{userRole.user_id}</TableCell>
                  <TableCell>
                    <Badge variant={userRole.role === 'admin' ? 'default' : 'secondary'}>
                      {userRole.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(userRole.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                  </TableCell>
                </TableRow>
              ))}
              {(!userRoles || userRoles.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    No hay roles asignados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> La gestión de usuarios y asignación de roles debe hacerse 
            directamente en la base de datos por razones de seguridad. Para asignar un rol de 
            administrador a un usuario, ejecuta el siguiente SQL en tu base de datos:
          </p>
          <pre className="mt-2 p-3 bg-background rounded text-xs overflow-x-auto">
            {`INSERT INTO user_roles (user_id, role)\nVALUES ('user-uuid-aqui', 'admin');`}
          </pre>
        </div>
      </div>
    </AdminLayout>
  );
}
