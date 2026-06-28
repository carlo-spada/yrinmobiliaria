import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Shield, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { RoleGuard } from '@/components/admin/RoleGuard';
import { UserRowSkeleton } from '@/components/admin/TableSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'superadmin' | 'admin' | 'agent' | 'user';

type UserListItem = {
  user_id: string;
  profile_id: string;
  email: string;
  role: UserRole;
  display_name: string;
  photo_url: string | null;
  bio_es: string | null;
  bio_en: string | null;
  job_title: string | null;
  languages: string[] | null;
  professional_email: string | null;
  email_preference: string | null;
  is_active: boolean | null;
  roles: { role: string; granted_at: string | null }[];
};

type ProfileFormData = {
  bio_es: string;
  job_title: string;
  languages: string;
  professional_email: string;
  email_preference: string;
};

const roleRank = (role: string) =>
  role === 'superadmin' ? 3 : role === 'admin' ? 2 : role === 'agent' ? 1 : 0;

function UsersContent() {
  const queryClient = useQueryClient();
  const { isSuperadmin } = useUserRole();

  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState<ProfileFormData>({
    bio_es: '',
    job_title: '',
    languages: '',
    professional_email: '',
    email_preference: 'forward_to_personal'
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');

  const { data: userProfiles, isLoading } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      // Query profiles directly (single-tenant: no organization scoping)
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          email,
          display_name,
          photo_url,
          languages,
          professional_email,
          email_preference,
          bio_es,
          bio_en,
          job_title,
          is_active,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!profiles) return [];

      // Get roles from role_assignments
      const userIds = profiles.map(p => p.user_id);
      const { data: roleAssignments } = await supabase
        .from('role_assignments')
        .select('user_id, role, granted_at')
        .in('user_id', userIds);

      const roleMap = new Map<string, { role: string, granted_at: string }>();
      roleAssignments?.forEach(ra => {
        const existing = roleMap.get(ra.user_id);
        if (!existing || roleRank(ra.role) > roleRank(existing.role)) {
          roleMap.set(ra.user_id, { role: ra.role, granted_at: ra.granted_at ?? '' });
        }
      });

      return profiles.map((profile): UserListItem => {
        const roleInfo = roleMap.get(profile.user_id) || { role: 'user', granted_at: profile.created_at ?? '' };

        return {
          user_id: profile.user_id,
          profile_id: profile.id,
          email: profile.email,
          role: roleInfo.role as UserRole,
          display_name: profile.display_name || profile.email,
          photo_url: profile.photo_url,
          bio_es: profile.bio_es,
          bio_en: profile.bio_en,
          job_title: profile.job_title,
          languages: profile.languages,
          professional_email: profile.professional_email,
          email_preference: profile.email_preference,
          is_active: profile.is_active,
          roles: [{ role: roleInfo.role, granted_at: roleInfo.granted_at }]
        };
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      if (!selectedUser) {
        throw new Error('No hay usuario seleccionado');
      }
      const { error } = await supabase
        .from('profiles')
        .update({
          bio_es: data.bio_es,
          job_title: data.job_title,
          languages: data.languages.split(',').map((l: string) => l.trim()).filter(Boolean),
          professional_email: data.professional_email,
          email_preference: data.email_preference
        })
        .eq('user_id', selectedUser.user_id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Perfil actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Error al actualizar perfil: ' + error.message);
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: UserRole }) => {
      if (!isSuperadmin) {
        throw new Error('Solo los superadministradores pueden cambiar roles');
      }
      // Replace existing role assignments with the new single role
      const { error: deleteError } = await supabase
        .from('role_assignments')
        .delete()
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase
        .from('role_assignments')
        .insert({ user_id: userId, role: newRole });

      if (insertError) throw insertError;
    },
    onSuccess: () => {
      toast.success('Rol actualizado correctamente');
      queryClient.invalidateQueries({ queryKey: ['users-list'] });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Error al cambiar rol: ' + error.message);
    },
  });

  const handleEditClick = (user: UserListItem) => {
    setSelectedUser(user);
    setSelectedRole(user.role ?? 'user');
    setFormData({
      bio_es: user.bio_es ?? '',
      job_title: user.job_title ?? '',
      languages: user.languages?.join(', ') ?? '',
      professional_email: user.professional_email ?? '',
      email_preference: user.email_preference ?? 'forward_to_personal'
    });
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    // Reset state after animation
    setTimeout(() => {
      setSelectedUser(null);
    }, 150);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-red-500 text-white';
      case 'admin': return 'bg-purple-500 text-white';
      case 'agent': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin': return 'Superadministrador';
      case 'admin': return 'Administrador';
      case 'agent': return 'Agente';
      default: return 'Usuario';
    }
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['admin', 'superadmin']}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Usuarios y Equipo</h2>
              <p className="text-muted-foreground">Gestiona los perfiles, roles y accesos de tu equipo</p>
            </div>
          </div>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Rol & Cargo</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <UserRowSkeleton key={i} />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin', 'superadmin']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Usuarios y Equipo</h2>
            <p className="text-muted-foreground">Gestiona los perfiles, roles y accesos de tu equipo</p>
          </div>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={(open) => !open && handleCloseEditDialog()}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Perfil de Usuario</DialogTitle>
              <DialogDescription>
                Modifica la información profesional y permisos de {selectedUser?.display_name}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Perfil Profesional</TabsTrigger>
                <TabsTrigger value="account">Cuenta y Roles</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Título / Cargo</Label>
                    <Input
                      value={formData.job_title}
                      onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      placeholder="Ej: Agente Senior"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Idiomas (separados por coma)</Label>
                    <Input
                      value={formData.languages}
                      onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                      placeholder="Español, Inglés, Francés"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Biografía Profesional (Español)</Label>
                  <Textarea
                    value={formData.bio_es}
                    onChange={(e) => setFormData({ ...formData, bio_es: e.target.value })}
                    placeholder="Breve descripción de la experiencia y especialidades..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Email Profesional</Label>
                    <Input
                      value={formData.professional_email}
                      onChange={(e) => setFormData({ ...formData, professional_email: e.target.value })}
                      placeholder="nombre@empresa.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferencia de Email</Label>
                    <Select
                      value={formData.email_preference}
                      onValueChange={(val) => setFormData({ ...formData, email_preference: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forward_to_personal">Reenviar a Personal</SelectItem>
                        <SelectItem value="dedicated_inbox">Bandeja Dedicada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="account" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">ID de Usuario</span>
                      <span className="text-sm font-mono text-muted-foreground">{selectedUser?.user_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Email Personal</span>
                      <span className="text-sm text-muted-foreground">{selectedUser?.email}</span>
                    </div>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <Label className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Cambiar Rol del Usuario
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {(['superadmin', 'admin', 'agent', 'user'] as const).map((role) => (
                        <Button
                          key={role}
                          variant={selectedRole === role ? 'default' : 'outline'}
                          className={selectedRole === role ? getRoleBadgeVariant(role) : ''}
                          onClick={() => {
                            setSelectedRole(role);
                            if (selectedUser) {
                              changeRoleMutation.mutate({ userId: selectedUser.user_id, newRole: role });
                            }
                          }}
                          disabled={changeRoleMutation.isPending || !isSuperadmin}
                        >
                          {getRoleLabel(role)}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Rol actual: <Badge className={getRoleBadgeVariant(selectedUser?.role ?? 'user')}>{getRoleLabel(selectedUser?.role ?? 'user')}</Badge>
                    </p>
                    {!isSuperadmin && (
                      <p className="text-sm text-muted-foreground">
                        Solo los superadministradores pueden cambiar roles.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseEditDialog}>Cancelar</Button>
              <Button onClick={() => updateProfileMutation.mutate(formData)} disabled={updateProfileMutation.isPending}>
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol & Cargo</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userProfiles?.map((user) => (
                <TableRow key={user.user_id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEditClick(user)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Avatar (no next/image): photo_url puede ser una URL arbitraria
                          o quedar rota (p.ej. blobs heredados) — AvatarImage degrada al
                          fallback de inicial/ícono en vez de romper como haría next/image. */}
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photo_url || undefined} alt={user.display_name} className="object-cover" />
                        <AvatarFallback className="bg-primary/10">
                          <User className="h-5 w-5 text-primary" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.display_name || 'Sin nombre'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge className={`text-xs ${getRoleBadgeVariant(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </Badge>
                      {user.job_title && <p className="text-xs text-muted-foreground">{user.job_title}</p>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {user.professional_email && (
                        <div className="flex items-center gap-1 text-primary">
                          <Mail className="h-3 w-3" />
                          {user.professional_email}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground">
                        {user.languages && user.languages.length > 0 ? user.languages.join(', ') : 'Sin idiomas'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.is_active !== false ? (
                      <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactivo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditClick(user); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </RoleGuard>
  );
}

export default function AdminUsers() {
  return (
    <AdminLayout>
      <UsersContent />
    </AdminLayout>
  );
}
