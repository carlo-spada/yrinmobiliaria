import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { logAuditEvent } from '@/utils/auditLog';

export default function AdminZones() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<any>(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm();

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
    mutationFn: async (formData: any) => {
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
      toast.success(editingZone ? 'Zona actualizada' : 'Zona creada correctamente');
      setIsDialogOpen(false);
      setEditingZone(null);
      reset();
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message);
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
      toast.success('Zona eliminada correctamente');
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message);
    },
  });

  const handleEdit = (zone: any) => {
    setEditingZone(zone);
    setValue('name_es', zone.name_es);
    setValue('name_en', zone.name_en);
    setValue('description_es', zone.description_es);
    setValue('description_en', zone.description_en);
    setValue('active', zone.active);
    setValue('display_order', zone.display_order);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingZone(null);
    reset({
      active: true,
      display_order: (zones?.length || 0) + 1,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: any) => {
    mutation.mutate({
      name_es: data.name_es,
      name_en: data.name_en,
      description_es: data.description_es,
      description_en: data.description_en,
      active: data.active,
      display_order: parseInt(data.display_order),
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Zonas de Servicio</h2>
            <p className="text-muted-foreground">Gestiona las zonas donde se ofrecen servicios</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Zona
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre (ES)</TableHead>
                <TableHead>Nombre (EN)</TableHead>
                <TableHead>Orden</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
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
                      {zone.active ? 'Activa' : 'Inactiva'}
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
                        onClick={() => deleteMutation.mutate(zone.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingZone ? 'Editar Zona' : 'Nueva Zona'}</DialogTitle>
              <DialogDescription>Completa la información de la zona de servicio</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name_es">Nombre (Español)*</Label>
                  <Input id="name_es" {...register('name_es')} required />
                </div>
                <div>
                  <Label htmlFor="name_en">Nombre (Inglés)*</Label>
                  <Input id="name_en" {...register('name_en')} required />
                </div>
              </div>

              <div>
                <Label htmlFor="description_es">Descripción (Español)</Label>
                <Textarea id="description_es" {...register('description_es')} />
              </div>

              <div>
                <Label htmlFor="description_en">Descripción (Inglés)</Label>
                <Textarea id="description_en" {...register('description_en')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display_order">Orden de Visualización*</Label>
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
                    checked={watch('active')}
                    onCheckedChange={(checked) => setValue('active', checked)}
                  />
                  <Label htmlFor="active">Zona Activa</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
