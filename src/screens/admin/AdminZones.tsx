import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUploadZone } from '@/components/admin/ImageUploadZone';
import { RoleGuard } from '@/components/admin/RoleGuard';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAuditEvent } from '@/utils/auditLog';

type ServiceZone = Database['public']['Tables']['service_zones']['Row'];

interface ZoneFormData {
  name_es: string;
  name_en: string;
  description_es?: string;
  description_en?: string;
  active: boolean;
  display_order: number;
}

export default function AdminZones() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<ServiceZone | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [zoneImages, setZoneImages] = useState<Array<{ url: string; path?: string }>>([]);
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { register, handleSubmit, reset, setValue, control } = useForm<ZoneFormData>();
  const activeValue = useWatch({ control, name: 'active', defaultValue: true });

  const { data: zones, isLoading } = useQuery({
    queryKey: ['service-zones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_zones')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (formData: Omit<ServiceZone, 'id' | 'created_at' | 'updated_at'>) => {
      if (editingZone) {
        const { error } = await supabase
          .from('service_zones')
          .update(formData)
          .eq('id', editingZone.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('service_zones')
          .insert([formData]);
        if (error) throw error;
      }

      await logAuditEvent({
        action: editingZone ? 'UPDATE_ZONE' : 'CREATE_ZONE',
        table_name: 'service_zones',
        record_id: editingZone?.id,
        changes: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-zones'] });
      queryClient.invalidateQueries({ queryKey: ['service-zones-public'] });
      toast.success(editingZone ? t.admin.zonesPage.updated : t.admin.zonesPage.created);
      setIsDialogOpen(false);
      setEditingZone(null);
      setZoneImages([]);
      reset();
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : t.admin.zonesPage.saveError;
      toast.error('Error: ' + errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_zones')
        .delete()
        .eq('id', id);
      if (error) throw error;

      await logAuditEvent({
        action: 'DELETE_ZONE',
        table_name: 'service_zones',
        record_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-zones'] });
      toast.success(t.admin.zonesPage.deleted);
      setDeleteId(null);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : t.admin.zonesPage.deleteError;
      toast.error('Error: ' + errorMessage);
      setDeleteId(null);
    },
  });

  const handleEdit = (zone: ServiceZone) => {
    setEditingZone(zone);
    setValue('name_es', zone.name_es);
    setValue('name_en', zone.name_en);
    setValue('description_es', zone.description_es ?? undefined);
    setValue('description_en', zone.description_en ?? undefined);
    setValue('active', zone.active);
    setValue('display_order', zone.display_order);
    // Set zone image if it exists
    setZoneImages(zone.image_url ? [{ url: zone.image_url }] : []);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingZone(null);
    setZoneImages([]);
    reset({
      active: true,
      display_order: (zones?.length || 0) + 1,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: ZoneFormData) => {
    mutation.mutate({
      name_es: data.name_es,
      name_en: data.name_en,
      description_es: data.description_es ?? null,
      description_en: data.description_en ?? null,
      image_url: zoneImages.length > 0 ? zoneImages[0].url : null,
      active: data.active,
      display_order: parseInt(String(data.display_order)),
    });
  };

  return (
    <AdminLayout>
      <RoleGuard allowedRoles={['admin', 'superadmin']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t.admin.zonesPage.title}</h2>
            <p className="text-muted-foreground">{t.admin.zonesPage.subtitle}</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            {t.admin.zonesPage.newZone}
          </Button>
        </div>

        <div className="border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">{t.admin.zonesPage.loadingZones}</div>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.zonesPage.tableHeaders.nameEs}</TableHead>
                <TableHead>{t.admin.zonesPage.tableHeaders.nameEn}</TableHead>
                <TableHead>{t.admin.zonesPage.tableHeaders.order}</TableHead>
                <TableHead>{t.admin.zonesPage.tableHeaders.status}</TableHead>
                <TableHead className="text-right">{t.admin.zonesPage.tableHeaders.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones?.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name_es}</TableCell>
                  <TableCell>{zone.name_en}</TableCell>
                  <TableCell>{zone.display_order}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      zone.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {zone.active ? t.admin.common.active : t.admin.common.inactive}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(zone)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(zone.id)}
                        aria-label={t.admin.actions.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!zones || zones.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <MapPin className="h-8 w-8" />
                      <p className="font-medium">{t.admin.zonesPage.noZones}</p>
                      <p className="text-sm">
                        {t.admin.zonesPage.createFirstZone}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingZone ? t.admin.zonesPage.editZone : t.admin.zonesPage.newZone}</DialogTitle>
              <DialogDescription>{t.admin.zonesPage.subtitle}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_es">{t.admin.zonesPage.form.nameEs}*</Label>
                  <Input id="name_es" {...register('name_es')} required />
                </div>
                <div>
                  <Label htmlFor="name_en">{t.admin.zonesPage.form.nameEn}*</Label>
                  <Input id="name_en" {...register('name_en')} required />
                </div>
              </div>

              <div>
                <Label htmlFor="description_es">{t.admin.zonesPage.form.descriptionEs}</Label>
                <Textarea id="description_es" {...register('description_es')} />
              </div>

              <div>
                <Label htmlFor="description_en">{t.admin.zonesPage.form.descriptionEn}</Label>
                <Textarea id="description_en" {...register('description_en')} />
              </div>

              <div>
                <Label htmlFor="zone_image">{t.admin.zonesPage.form.zoneImage}</Label>
                <ImageUploadZone
                  images={zoneImages}
                  onImagesChange={setZoneImages}
                  maxImages={1}
                  propertyId={editingZone?.id}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {t.admin.zonesPage.form.zoneImageDesc}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_order">{t.admin.zonesPage.form.displayOrder}*</Label>
                  <Input
                    id="display_order"
                    type="number"
                    {...register('display_order')}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={activeValue}
                    onCheckedChange={(checked) => setValue('active', checked)}
                  />
                  <Label htmlFor="active">{t.admin.zonesPage.form.activeZone}</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t.admin.actions.cancel}
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? t.admin.common.loading : t.admin.actions.save}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.admin.zonesPage.deleteConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.admin.zonesPage.deleteConfirmDesc}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.admin.actions.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? t.admin.deleteConfirm.deleting : t.admin.actions.delete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      </RoleGuard>
    </AdminLayout>
  );
}
