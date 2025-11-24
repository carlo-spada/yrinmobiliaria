import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useLanguage } from '@/utils/LanguageContext';
import { Phone, Mail, MapPin, Clock, Building2, Facebook, Instagram, Loader2, RotateCcw, Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { SettingValue } from '@/hooks/useSiteSettings';
import { useUserRole } from '@/hooks/useUserRole';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { RoleGuard } from '@/components/admin/RoleGuard';
import { PermissionsMatrix } from '@/components/admin/PermissionsMatrix';

interface SettingEditorProps {
  settingKey: string;
  label: string;
  description: string;
  value: SettingValue;
  multiline?: boolean;
  icon?: React.ReactNode;
  onSave: (args: { key: string; value: SettingValue }) => void;
  isUpdating: boolean;
  defaultValue?: SettingValue;
}

const SettingEditor = ({ 
  settingKey, 
  label, 
  description, 
  value, 
  multiline, 
  icon, 
  onSave, 
  isUpdating,
  defaultValue 
}: SettingEditorProps) => {
  const [editValue, setEditValue] = useState<string>(String(value || ''));
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (newValue: string) => {
    setEditValue(newValue);
    setHasChanges(newValue !== String(value));
  };

  const handleSave = () => {
    // Validate based on setting type
    if (settingKey.includes('email') && !editValue.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor ingresa un correo electrónico válido',
        variant: 'destructive',
      });
      return;
    }

    if (settingKey.includes('url') && !editValue.match(/^https?:\/\/.+/)) {
      toast({
        title: 'URL inválida',
        description: 'La URL debe comenzar con http:// o https://',
        variant: 'destructive',
      });
      return;
    }

    if (settingKey === 'whatsapp_number' && !editValue.match(/^\d{10,15}$/)) {
      toast({
        title: 'Número inválido',
        description: 'Ingresa el número sin espacios ni símbolos (solo dígitos)',
        variant: 'destructive',
      });
      return;
    }

    onSave({ key: settingKey, value: editValue });
    setHasChanges(false);
  };

  const handleReset = () => {
    if (defaultValue !== undefined) {
      setEditValue(String(defaultValue));
      setHasChanges(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {icon}
          {label}
        </CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {multiline ? (
          <Textarea
            value={editValue}
            onChange={(e) => handleChange(e.target.value)}
            rows={4}
            className="resize-none"
          />
        ) : (
          <Input
            value={editValue}
            onChange={(e) => handleChange(e.target.value)}
          />
        )}
        <div className="flex gap-2">
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || isUpdating}
            size="sm"
          >
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar
          </Button>
          {defaultValue !== undefined && (
            <Button 
              onClick={handleReset} 
              variant="outline" 
              size="sm"
              disabled={isUpdating}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restablecer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const defaultSettings = {
  company_phone: '(951) 123-4567',
  company_email: 'contacto@yrinmobiliaria.com',
  whatsapp_number: '5219511234567',
  company_address: 'Calle Independencia 123, Centro Histórico, Oaxaca de Juárez, Oaxaca, México',
  business_hours: 'Lunes a Viernes: 9:00 AM - 6:00 PM\nSábados: 10:00 AM - 2:00 PM',
  company_name: 'YR Inmobiliaria',
  facebook_url: 'https://facebook.com',
  instagram_url: 'https://instagram.com',
};

export default function AdminSettings() {
  const { t } = useLanguage();
  const { isSuperadmin } = useUserRole();
  const { getSettingsByCategory, updateSetting, isUpdating, isLoading } = useSiteSettings();
  const queryClient = useQueryClient();

  const [isOrgDialogOpen, setIsOrgDialogOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);
  const [deletingOrgId, setDeletingOrgId] = useState<string | null>(null);
  const [orgFormData, setOrgFormData] = useState({
    name: '',
    slug: '',
    contact_email: '',
    phone: '',
    domain: '',
  });

  const contactSettings = getSettingsByCategory('contact');
  const businessSettings = getSettingsByCategory('business');
  const socialSettings = getSettingsByCategory('social');

  // Fetch organizations
  const { data: organizations = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['organizations-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: isSuperadmin,
  });

  // Create/Update organization mutation
  const saveOrgMutation = useMutation({
    mutationFn: async (orgData: typeof orgFormData) => {
      if (editingOrg) {
        const { error } = await supabase
          .from('organizations')
          .update(orgData)
          .eq('id', editingOrg.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('organizations')
          .insert(orgData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations-admin'] });
      toast({ title: editingOrg ? 'Organización actualizada' : 'Organización creada' });
      setIsOrgDialogOpen(false);
      setEditingOrg(null);
      setOrgFormData({ name: '', slug: '', contact_email: '', phone: '', domain: '' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete organization mutation
  const deleteOrgMutation = useMutation({
    mutationFn: async (orgId: string) => {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations-admin'] });
      toast({ title: 'Organización eliminada' });
      setDeletingOrgId(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error al eliminar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleOpenOrgDialog = (org?: any) => {
    if (org) {
      setEditingOrg(org);
      setOrgFormData({
        name: org.name,
        slug: org.slug,
        contact_email: org.contact_email,
        phone: org.phone || '',
        domain: org.domain || '',
      });
    } else {
      setEditingOrg(null);
      setOrgFormData({ name: '', slug: '', contact_email: '', phone: '', domain: '' });
    }
    setIsOrgDialogOpen(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <RoleGuard allowedRoles={['admin', 'superadmin']}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuración del Sitio</h2>
          <p className="text-muted-foreground">
            Administra la información de contacto, horarios y redes sociales
          </p>
        </div>

        <Tabs defaultValue="contact" className="space-y-4">
          <TabsList className={`grid w-full ${isSuperadmin ? 'grid-cols-5' : 'grid-cols-4'} lg:w-[600px]`}>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
            <TabsTrigger value="business">Negocio</TabsTrigger>
            <TabsTrigger value="social">Redes Sociales</TabsTrigger>
            {isSuperadmin && <TabsTrigger value="organizations">Organizaciones</TabsTrigger>}
            <TabsTrigger value="permissions">Permisos</TabsTrigger>
          </TabsList>

          <TabsContent value="contact" className="space-y-4">
            {contactSettings.map((setting) => (
              <SettingEditor
                key={setting.id}
                settingKey={setting.setting_key}
                label={
                  setting.setting_key === 'company_phone' ? 'Teléfono' :
                  setting.setting_key === 'company_email' ? 'Correo Electrónico' :
                  setting.setting_key === 'whatsapp_number' ? 'WhatsApp' :
                  setting.setting_key === 'company_address' ? 'Dirección' : 
                  setting.setting_key
                }
                description={setting.description}
                value={setting.setting_value}
                multiline={setting.setting_key === 'company_address'}
                icon={
                  setting.setting_key === 'company_phone' ? <Phone className="h-4 w-4" /> :
                  setting.setting_key === 'company_email' ? <Mail className="h-4 w-4" /> :
                  setting.setting_key === 'whatsapp_number' ? <Phone className="h-4 w-4" /> :
                  setting.setting_key === 'company_address' ? <MapPin className="h-4 w-4" /> :
                  null
                }
                onSave={updateSetting}
                isUpdating={isUpdating}
                defaultValue={defaultSettings[setting.setting_key as keyof typeof defaultSettings]}
              />
            ))}
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            {businessSettings.map((setting) => (
              <SettingEditor
                key={setting.id}
                settingKey={setting.setting_key}
                label={
                  setting.setting_key === 'company_name' ? 'Nombre de la Empresa' :
                  setting.setting_key === 'business_hours' ? 'Horario de Atención' :
                  setting.setting_key
                }
                description={setting.description}
                value={setting.setting_value}
                multiline={setting.setting_key === 'business_hours'}
                icon={
                  setting.setting_key === 'company_name' ? <Building2 className="h-4 w-4" /> :
                  setting.setting_key === 'business_hours' ? <Clock className="h-4 w-4" /> :
                  null
                }
                onSave={updateSetting}
                isUpdating={isUpdating}
                defaultValue={defaultSettings[setting.setting_key as keyof typeof defaultSettings]}
              />
            ))}
          </TabsContent>

          <TabsContent value="social" className="space-y-4">
            {socialSettings.map((setting) => (
              <SettingEditor
                key={setting.id}
                settingKey={setting.setting_key}
                label={
                  setting.setting_key === 'facebook_url' ? 'Facebook' :
                  setting.setting_key === 'instagram_url' ? 'Instagram' :
                  setting.setting_key
                }
                description={setting.description}
                value={setting.setting_value}
                icon={
                  setting.setting_key === 'facebook_url' ? <Facebook className="h-4 w-4" /> :
                  setting.setting_key === 'instagram_url' ? <Instagram className="h-4 w-4" /> :
                  null
                }
                onSave={updateSetting}
                isUpdating={isUpdating}
                defaultValue={defaultSettings[setting.setting_key as keyof typeof defaultSettings]}
              />
            ))}
          </TabsContent>

          {isSuperadmin && (
            <TabsContent value="organizations" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Gestión de Organizaciones</h3>
                  <p className="text-sm text-muted-foreground">Administra todas las organizaciones del sistema</p>
                </div>
                <Button onClick={() => handleOpenOrgDialog()} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Organización
                </Button>
              </div>

              {orgsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-4">
                  {organizations.map((org) => (
                    <Card key={org.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              {org.name}
                              {!org.is_active && (
                                <Badge variant="secondary">Inactivo</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="space-y-1">
                              <div><strong>Slug:</strong> {org.slug}</div>
                              <div><strong>Email:</strong> {org.contact_email}</div>
                              {org.phone && <div><strong>Teléfono:</strong> {org.phone}</div>}
                              {org.domain && <div><strong>Dominio:</strong> {org.domain}</div>}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenOrgDialog(org)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingOrgId(org.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  {organizations.length === 0 && (
                    <Card>
                      <CardContent className="py-8 text-center text-muted-foreground">
                        No hay organizaciones. Crea una nueva para comenzar.
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="permissions" className="space-y-4">
            <PermissionsMatrix />
          </TabsContent>
        </Tabs>

        {/* Organization Dialog */}
        <Dialog open={isOrgDialogOpen} onOpenChange={setIsOrgDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingOrg ? 'Editar Organización' : 'Nueva Organización'}</DialogTitle>
              <DialogDescription>
                {editingOrg ? 'Actualiza la información de la organización' : 'Crea una nueva organización en el sistema'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={orgFormData.name}
                  onChange={(e) => setOrgFormData({ ...orgFormData, name: e.target.value })}
                  placeholder="YR Inmobiliaria"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug * (identificador único)</Label>
                <Input
                  id="slug"
                  value={orgFormData.slug}
                  onChange={(e) => setOrgFormData({ ...orgFormData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                  placeholder="yr-inmobiliaria"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email de Contacto *</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={orgFormData.contact_email}
                  onChange={(e) => setOrgFormData({ ...orgFormData, contact_email: e.target.value })}
                  placeholder="contacto@empresa.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={orgFormData.phone}
                  onChange={(e) => setOrgFormData({ ...orgFormData, phone: e.target.value })}
                  placeholder="(951) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Dominio</Label>
                <Input
                  id="domain"
                  value={orgFormData.domain}
                  onChange={(e) => setOrgFormData({ ...orgFormData, domain: e.target.value })}
                  placeholder="empresa.com"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOrgDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => saveOrgMutation.mutate(orgFormData)}
                disabled={!orgFormData.name || !orgFormData.slug || !orgFormData.contact_email || saveOrgMutation.isPending}
              >
                {saveOrgMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingOrg ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deletingOrgId} onOpenChange={() => setDeletingOrgId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar organización?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Todos los usuarios, propiedades y datos asociados a esta organización podrían verse afectados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingOrgId && deleteOrgMutation.mutate(deletingOrgId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      </RoleGuard>
    </AdminLayout>
  );
}
