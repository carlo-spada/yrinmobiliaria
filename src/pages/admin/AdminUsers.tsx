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
    queryKey: ['role-assignments'],
    queryFn: async () => {
      // Fetch role assignments with profiles using JOIN (now possible with foreign key)
      const { data: roleAssignments, error } = await supabase
        .from('role_assignments')
        .select(`
          *,
          profiles!fk_role_assignments_profiles (
            user_id,
            display_name,
            email,
            photo_url,
            agent_level,
            organization_id
          )
        `)
        .order('granted_at', { ascending: false });

      if (error) {
        console.error('Error fetching role assignments:', error);
        throw error;
      }

      if (!roleAssignments || roleAssignments.length === 0) {
        console.log('No role assignments found');
        return [];
      }

      // Group role assignments by user_id
      const userMap = new Map();
      roleAssignments.forEach((roleAssignment) => {
        const userId = roleAssignment.user_id;
        const profile = roleAssignment.profiles;

        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            display_name: profile?.display_name || 'Sin nombre',
            email: profile?.email || 'Sin email',
            photo_url: profile?.photo_url || null,
            agent_level: profile?.agent_level || null,
            organization_id: profile?.organization_id || null,
            roles: [],
            latest_granted_at: roleAssignment.granted_at || roleAssignment.created_at,
          });
        }

        const user = userMap.get(userId);
        user.roles.push({
          role: roleAssignment.role,
          granted_at: roleAssignment.granted_at || roleAssignment.created_at,
        });

        // Update latest_granted_at if this role is newer
        const roleDate = new Date(roleAssignment.granted_at || roleAssignment.created_at);
        const currentDate = new Date(user.latest_granted_at);
        if (roleDate > currentDate) {
          user.latest_granted_at = roleAssignment.granted_at || roleAssignment.created_at;
        }
      });

      const result = Array.from(userMap.values()).sort((a, b) =>
        new Date(b.latest_granted_at).getTime() - new Date(a.latest_granted_at).getTime()
      );

      console.log('Processed users:', result.length, result);
      return result;
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
      queryClient.invalidateQueries({ queryKey: ['role-assignments'] });
      setIsDialogOpen(false);
      setUserId('');
      setUserEmail(null);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Error al promover usuario';
      toast.error('Error al promover usuario: ' + errorMessage);
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
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Última Actualización</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Cargando usuarios...
                  </TableCell>
                </TableRow>
              ) : userRoles && userRoles.length > 0 ? (
                userRoles.map((user) => (
                  <TableRow key={user.user_id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.photo_url ? (
                          <img
                            src={user.photo_url}
                            alt={user.display_name}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {user.display_name?.charAt(0).toUpperCase() || '?'}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{user.display_name || 'Sin nombre'}</p>
                          <p className="text-xs text-muted-foreground font-mono">{user.user_id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((roleInfo, idx) => (
                          <Badge
                            key={idx}
                            variant={
                              roleInfo.role === 'superadmin'
                                ? 'default'
                                : roleInfo.role === 'admin'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {roleInfo.role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.agent_level ? (
                        <Badge variant="outline">Agente</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Usuario
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.latest_granted_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay usuarios registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {userRoles && userRoles.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Total: {userRoles.length} {userRoles.length === 1 ? 'usuario' : 'usuarios'}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
