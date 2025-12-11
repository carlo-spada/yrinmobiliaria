import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { RoleGuard } from '@/components/admin/RoleGuard';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { useAdminOrg } from '@/components/admin/useAdminOrg';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAuditEvent } from '@/utils/auditLog';
import { formatDate, formatDateLong } from '@/utils/dateFormat';

type ScheduledVisit = Database['public']['Tables']['scheduled_visits']['Row'] & {
  properties?: { title_es: string } | null;
};

function VisitsContent() {
  const [selectedVisit, setSelectedVisit] = useState<ScheduledVisit | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { effectiveOrgId, isAllOrganizations } = useAdminOrg();
  const { isSuperadmin } = useUserRole();
  const scopedOrg = isSuperadmin && isAllOrganizations ? null : effectiveOrgId;
  const canQuery = isSuperadmin || !!scopedOrg;

  // All hooks must be called unconditionally at the top
  const { data: visits, isLoading } = useQuery({
    queryKey: ['scheduled-visits', scopedOrg],
    queryFn: async () => {
      let query = supabase
        .from('scheduled_visits')
        .select('*, properties(title_es)')
        .order('preferred_date', { ascending: false });

      if (scopedOrg) {
        query = query.eq('organization_id', scopedOrg);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: canQuery,
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
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Error al eliminar la visita');
      setDeleteId(null);
    },
  });

  // Conditional rendering AFTER all hooks
  if (!canQuery) {
    return (
      <RoleGuard allowedRoles={['agent', 'admin', 'superadmin']}>
        <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
          Asigna una organización a tu perfil para ver visitas.
        </div>
      </RoleGuard>
    );
  }

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['agent', 'admin', 'superadmin']}>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Visitas Agendadas</h2>
            <p className="text-muted-foreground">Gestiona todas las visitas programadas</p>
          </div>
          <TableSkeleton 
            columns={7} 
            rows={5}
            headers={['Fecha', 'Hora', 'Nombre', 'Email', 'Propiedad', 'Estado', 'Acciones']}
          />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['agent', 'admin', 'superadmin']}>
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
                    {formatDate(visit.preferred_date)}
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
                        onClick={() => setDeleteId(visit.id)}
                        aria-label="Eliminar visita"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!visits || visits.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Calendar className="h-8 w-8" />
                      <p className="font-medium">No hay visitas agendadas</p>
                      <p className="text-sm">
                        Las visitas programadas por los clientes aparecerán aquí
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
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
                    <p>{formatDateLong(selectedVisit.preferred_date)}</p>
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

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar visita?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará permanentemente esta visita agendada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </RoleGuard>
  );
}

export default function AdminVisits() {
  return (
    <AdminLayout>
      <VisitsContent />
    </AdminLayout>
  );
}
