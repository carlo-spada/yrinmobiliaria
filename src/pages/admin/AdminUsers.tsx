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
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { UserPlus, Pencil, Shield, Mail, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [promoteUserId, setPromoteUserId] = useState('');

  // Form state for editing
  const [formData, setFormData] = useState({
    bio: '',
    job_title: '',
    languages: '',
    professional_email: '',
    email_preference: 'forward_to_personal'
  });

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['role-assignments'],
    queryFn: async () => {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          display_name,
          email,
          photo_url,
          agent_level,
          organization_id,
          updated_at,
          languages,
          professional_email,
          email_preference,
          bio,
          job_title,
          role_assignments (
            role,
            granted_at,
            created_at,
            organization_id
          ),
          organization:organizations (
            name,
            slug
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!profiles) return [];

      if (!profiles || profiles.length === 0) {
        console.log('No profiles found');
        return [];
      }

      // Type for display roles (includes 'agent' which is not a database role)
      type DisplayRole = 'admin' | 'superadmin' | 'user' | 'agent';

      return profiles.map((profile) => {
        const roles: Array<{ role: DisplayRole; granted_at: string }> =
          profile.role_assignments?.map((r) => ({
            role: r.role as DisplayRole,
            granted_at: r.granted_at || r.created_at,
          })) || [];

        const isAgent = !!profile.agent_level;
        const hasAdmin = roles.some((r) => r.role === 'admin' || r.role === 'superadmin');

        if (isAgent && !roles.some((r) => r.role === 'agent')) {
          roles.push({ role: 'agent' as DisplayRole, granted_at: profile.updated_at || new Date().toISOString() });
        }
        if (!hasAdmin && !isAgent && roles.length === 0) {
          roles.push({ role: 'user' as DisplayRole, granted_at: profile.updated_at || new Date().toISOString() });
        }

        const latest_granted_at = roles.reduce((latest, r) => {
          const d = new Date(r.granted_at || new Date());
          return d > latest ? d : latest;
        }, new Date(profile.updated_at || Date.now()));

        return {
          ...profile,
          roles,
          latest_granted_at,
        };
      }).sort((a, b) => b.latest_granted_at.getTime() - a.latest_granted_at.getTime());
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: data.bio,
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
      queryClient.invalidateQueries({ queryKey: ['role-assignments'] });
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Error al actualizar perfil: ' + error.message);
    }
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
      setIsPromoteDialogOpen(false);
      setPromoteUserId('');
    },
    onError: (error) => {
      toast.error('Error al promover usuario: ' + error.message);
    },
  });

  const handleEditClick = (user: any) => {
    setSelectedUser(user);
    setFormData({
      bio: user.bio || '',
      job_title: user.job_title || '',
      languages: user.languages?.join(', ') || '',
      professional_email: user.professional_email || '',
      email_preference: user.email_preference || 'forward_to_personal'
    });
    setIsEditDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Usuarios y Equipo</h2>
            <p className="text-muted-foreground">Gestiona los perfiles, roles y accesos de tu equipo</p>
          </div>

          <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
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
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="userId">ID de Usuario</Label>
                  <Input
                    id="userId"
                    placeholder="ej: 123e4567-e89b-12d3-a456-426614174000"
                    value={promoteUserId}
                    onChange={(e) => setPromoteUserId(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPromoteDialogOpen(false)}>Cancelar</Button>
                <Button
                  onClick={() => promoteUserMutation.mutate(promoteUserId)}
                  disabled={promoteUserMutation.isPending}
                >
                  {promoteUserMutation.isPending ? 'Promoviendo...' : 'Promover'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                  <Label>Biografía Profesional</Label>
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Breve descripción de la experiencia y especialidades..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div className="space-y-2">
                    <Label>Email Profesional (@yrinmobiliaria.com)</Label>
                    <Input
                      value={formData.professional_email}
                      onChange={(e) => setFormData({ ...formData, professional_email: e.target.value })}
                      placeholder="nombre@yrinmobiliaria.com"
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
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Organización</span>
                      <span className="text-sm text-muted-foreground">{selectedUser?.organization_name}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Roles Actuales</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedUser?.roles.map((r: any, idx: number) => (
                        <Badge key={idx} variant="secondary">{r.role}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
              <Button onClick={() => updateProfileMutation.mutate(formData)}>Guardar Cambios</Button>
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">Cargando equipo...</TableCell>
                </TableRow>
              ) : userRoles?.map((user) => (
                <TableRow key={user.user_id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleEditClick(user)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.photo_url ? (
                        <img src={user.photo_url} alt={user.display_name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.display_name || 'Sin nombre'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {user.roles.map((r: any, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">{r.role}</Badge>
                        ))}
                      </div>
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
                        {user.languages?.length > 0 ? user.languages.join(', ') : 'Sin idiomas'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.organization_id ? (
                      <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20 border-0">
                        Activo
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Sin Org</Badge>
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
    </AdminLayout>
  );
}
