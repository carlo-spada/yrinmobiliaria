import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      
      // Fetch emails for each user
      const rolesWithEmails = await Promise.all(
        data.map(async (role) => {
          const { data: emailData } = await supabase.rpc('get_user_email', {
            target_user_id: role.user_id,
          });
          return { ...role, email: emailData || 'N/A' };
        })
      );
      
      return rolesWithEmails;
    },
  });

  const promoteUserMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      const { error } = await supabase.rpc('promote_user_to_admin', {
        target_user_id: targetUserId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Usuario promovido a administrador exitosamente');
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      setIsDialogOpen(false);
      setUserId('');
      setUserEmail(null);
    },
    onError: (error: any) => {
      toast.error('Error al promover usuario: ' + error.message);
    },
  });

  const handlePromoteUser = () => {
    const trimmedId = userId.trim();
    
    if (!trimmedId) {
      toast.error('Por favor ingresa un ID de usuario válido');
      return;
    }
    
    // Validate UUID format
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(trimmedId)) {
      toast.error('El formato del ID no es válido. Debe ser un UUID (ej: 123e4567-e89b-12d3-a456-426614174000)');
      return;
    }
    
    promoteUserMutation.mutate(trimmedId);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Usuarios y Roles</h2>
            <p className="text-muted-foreground">Gestiona los roles de usuario del sistema</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Promover a Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Promover Usuario a Administrador</DialogTitle>
                <DialogDescription>
                  Ingresa el ID del usuario que deseas promover a administrador.
                  Puedes encontrar el ID en la tabla de abajo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">ID de Usuario</Label>
                  <Input
                    id="userId"
                    placeholder="ej: 123e4567-e89b-12d3-a456-426614174000"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setUserId('');
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handlePromoteUser}
                  disabled={promoteUserMutation.isPending}
                >
                  {promoteUserMutation.isPending ? 'Promoviendo...' : 'Promover'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>ID de Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de Asignación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userRoles?.map((userRole) => (
                <TableRow key={userRole.id}>
                  <TableCell>{userRole.email}</TableCell>
                  <TableCell className="font-mono text-xs">{userRole.user_id}</TableCell>
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
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No hay roles asignados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <p className="text-sm text-muted-foreground">
            <strong>Administración automática:</strong> Los usuarios con email 
            <code className="mx-1 px-1 bg-background rounded">ruizvasquezyazmin@gmail.com</code> y
            <code className="mx-1 px-1 bg-background rounded">carlo.spada22@gmail.com</code>
            recibirán automáticamente rol de administrador al registrarse.
          </p>
          <p className="text-sm text-muted-foreground">
            Para promover otros usuarios a administrador, usa el botón "Promover a Admin" arriba.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
