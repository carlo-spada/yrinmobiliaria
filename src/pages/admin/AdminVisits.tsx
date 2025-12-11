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
import { useLanguage } from '@/contexts/LanguageContext';
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
  const { t } = useLanguage();
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
      toast.success(t.admin.visitsPage.statusUpdated);
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
      toast.success(t.admin.visitsPage.deleted);
      setDeleteId(null);
    },
    onError: () => {
      toast.error(t.admin.visitsPage.deleteError);
      setDeleteId(null);
    },
  });

  // Conditional rendering AFTER all hooks
  if (!canQuery) {
    return (
      <RoleGuard allowedRoles={['agent', 'admin', 'superadmin']}>
        <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
          {t.admin.common.assignOrg}
        </div>
      </RoleGuard>
    );
  }

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['agent', 'admin', 'superadmin']}>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t.admin.visitsPage.title}</h2>
            <p className="text-muted-foreground">{t.admin.visitsPage.subtitle}</p>
          </div>
          <TableSkeleton
            columns={7}
            rows={5}
            headers={[t.admin.visitsPage.tableHeaders.date, t.admin.visitsPage.tableHeaders.time, t.admin.visitsPage.tableHeaders.name, t.admin.visitsPage.tableHeaders.email, t.admin.visitsPage.tableHeaders.property, t.admin.visitsPage.tableHeaders.status, t.admin.visitsPage.tableHeaders.actions]}
          />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['agent', 'admin', 'superadmin']}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.admin.visitsPage.title}</h2>
          <p className="text-muted-foreground">{t.admin.visitsPage.subtitle}</p>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.visitsPage.tableHeaders.date}</TableHead>
                <TableHead>{t.admin.visitsPage.tableHeaders.time}</TableHead>
                <TableHead>{t.admin.visitsPage.tableHeaders.name}</TableHead>
                <TableHead>{t.admin.visitsPage.tableHeaders.email}</TableHead>
                <TableHead>{t.admin.visitsPage.tableHeaders.property}</TableHead>
                <TableHead>{t.admin.visitsPage.tableHeaders.status}</TableHead>
                <TableHead className="text-right">{t.admin.visitsPage.tableHeaders.actions}</TableHead>
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
                        <SelectItem value="pending">{t.admin.visitsPage.statuses.pending}</SelectItem>
                        <SelectItem value="confirmed">{t.admin.visitsPage.statuses.confirmed}</SelectItem>
                        <SelectItem value="completed">{t.admin.visitsPage.statuses.completed}</SelectItem>
                        <SelectItem value="cancelled">{t.admin.visitsPage.statuses.cancelled}</SelectItem>
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
                        aria-label={t.admin.actions.delete}
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
                      <p className="font-medium">{t.admin.visitsPage.noVisits}</p>
                      <p className="text-sm">
                        {t.admin.visitsPage.visitsAppearHere}
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
              <DialogTitle>{t.admin.visitsPage.detailTitle}</DialogTitle>
            </DialogHeader>
            {selectedVisit && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.admin.common.name}</p>
                    <p>{selectedVisit.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.admin.common.email}</p>
                    <p>{selectedVisit.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.admin.common.phone}</p>
                    <p>{selectedVisit.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.admin.visitsPage.preferredDate}</p>
                    <p>{formatDateLong(selectedVisit.preferred_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.admin.visitsPage.preferredTime}</p>
                    <p>{selectedVisit.preferred_time}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.admin.common.status}</p>
                    <p className="capitalize">{selectedVisit.status}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t.admin.common.property}</p>
                  <p>{selectedVisit.properties?.title_es}</p>
                </div>
                {selectedVisit.message && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">{t.admin.visitsPage.additionalMessage}</p>
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
              <AlertDialogTitle>{t.admin.visitsPage.deleteConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.admin.visitsPage.deleteConfirmDesc}
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
  );
}

export default function AdminVisits() {
  return (
    <AdminLayout>
      <VisitsContent />
    </AdminLayout>
  );
}
