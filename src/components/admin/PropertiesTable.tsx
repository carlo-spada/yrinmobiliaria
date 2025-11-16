import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PropertyFormDialog } from './PropertyFormDialog';
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
import { logAuditEvent } from '@/utils/auditLog';

export const PropertiesTable = () => {
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: properties, isLoading } = useQuery({
    queryKey: ['admin-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_images(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const propertyToDelete = properties?.find(p => p.id === id);
      
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Log audit event
      await logAuditEvent({
        action: 'DELETE_PROPERTY',
        table_name: 'properties',
        record_id: id,
        changes: {
          deleted_property: propertyToDelete?.title_es || 'Unknown'
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      toast.success('Propiedad eliminada correctamente');
      setDeletingPropertyId(null);
    },
    onError: (error: any) => {
      toast.error('Error al eliminar: ' + error.message);
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Cargando propiedades...</div>;
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Operación</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties?.map((property) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">{property.title_es}</TableCell>
                <TableCell className="capitalize">{property.type}</TableCell>
                <TableCell className="capitalize">{property.operation}</TableCell>
                <TableCell>${property.price.toLocaleString()}</TableCell>
                <TableCell className="capitalize">{property.status}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProperty(property)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingPropertyId(property.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!properties?.length && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No hay propiedades. Crea una nueva para comenzar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PropertyFormDialog
        open={!!editingProperty}
        onOpenChange={(open) => !open && setEditingProperty(null)}
        property={editingProperty}
      />

      <AlertDialog open={!!deletingPropertyId} onOpenChange={() => setDeletingPropertyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La propiedad será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingPropertyId && deleteMutation.mutate(deletingPropertyId)}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
