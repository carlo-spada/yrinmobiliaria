import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { logAuditEvent } from '@/utils/auditLog';

export default function AdminVisits() {
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: visits, isLoading } = useQuery({
    queryKey: ['scheduled-visits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('scheduled_visits')
        .select('*, properties(title_es)')
        .order('preferred_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('scheduled_visits')
        .update({ status })
        .eq('id', id);
      if (error) throw error;

      await logAuditEvent({
        action: 'UPDATE_VISIT_STATUS',
        table_name: 'scheduled_visits',
        record_id: id,
        changes: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-visits'] });
      toast.success('Estado actualizado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('scheduled_visits')
        .delete()
        .eq('id', id);
      if (error) throw error;

      await logAuditEvent({
        action: 'DELETE_VISIT',
        table_name: 'scheduled_visits',
        record_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-visits'] });
      toast.success('Visita eliminada');
    },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Visitas Agendadas</h2>
          <p className="text-muted-foreground">Gestiona todas las visitas programadas</p>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visits?.map((visit) => (
                <TableRow key={visit.id}>
                  <TableCell>
                    {format(new Date(visit.preferred_date), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>{visit.preferred_time}</TableCell>
                  <TableCell className="font-medium">{visit.name}</TableCell>
                  <TableCell>{visit.email}</TableCell>
                  <TableCell>{visit.properties?.title_es}</TableCell>
                  <TableCell>
                    <Select
                      value={visit.status}
                      onValueChange={(value) => 
                        updateStatusMutation.mutate({ id: visit.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="completed">Completada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVisit(visit)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteMutation.mutate(visit.id)}
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

        <Dialog open={!!selectedVisit} onOpenChange={() => setSelectedVisit(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de Visita</DialogTitle>
            </DialogHeader>
            {selectedVisit && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                    <p>{selectedVisit.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{selectedVisit.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p>{selectedVisit.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha Preferida</p>
                    <p>{format(new Date(selectedVisit.preferred_date), "dd 'de' MMMM, yyyy", { locale: es })}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hora Preferida</p>
                    <p>{selectedVisit.preferred_time}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <p className="capitalize">{selectedVisit.status}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Propiedad</p>
                  <p>{selectedVisit.properties?.title_es}</p>
                </div>
                {selectedVisit.message && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Mensaje Adicional</p>
                    <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md">
                      {selectedVisit.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
