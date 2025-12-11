import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, Trash2, MessageSquare } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

type ContactInquiry = Database['public']['Tables']['contact_inquiries']['Row'] & {
  properties?: { title_es: string } | null;
};

function InquiriesContent() {
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { effectiveOrgId, isAllOrganizations } = useAdminOrg();
  const { isSuperadmin } = useUserRole();
  const { t } = useLanguage();
  const scopedOrg = isSuperadmin && isAllOrganizations ? null : effectiveOrgId;
  const canQuery = isSuperadmin || !!scopedOrg;

  // All hooks must be called unconditionally at the top
  const { data: inquiries, isLoading } = useQuery({
    queryKey: ['contact-inquiries', scopedOrg],
    queryFn: async () => {
      let query = supabase
        .from('contact_inquiries')
        .select('*, properties(title_es)')
        .order('created_at', { ascending: false });

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
        .from('contact_inquiries')
        .update({ status })
        .eq('id', id);
      if (error) throw error;

      await logAuditEvent({
        action: 'UPDATE_INQUIRY_STATUS',
        table_name: 'contact_inquiries',
        record_id: id,
        changes: { status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-inquiries'] });
      toast.success(t.admin.inquiriesPage.statusUpdated);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_inquiries')
        .delete()
        .eq('id', id);
      if (error) throw error;

      await logAuditEvent({
        action: 'DELETE_INQUIRY',
        table_name: 'contact_inquiries',
        record_id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-inquiries'] });
      toast.success(t.admin.inquiriesPage.deleted);
      setDeleteId(null);
    },
    onError: () => {
      toast.error(t.admin.inquiriesPage.deleteError);
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
            <h2 className="text-3xl font-bold tracking-tight">{t.admin.inquiriesPage.title}</h2>
            <p className="text-muted-foreground">{t.admin.inquiriesPage.subtitle}</p>
          </div>
          <TableSkeleton
            columns={6}
            rows={5}
            headers={[t.admin.inquiriesPage.tableHeaders.date, t.admin.inquiriesPage.tableHeaders.name, t.admin.inquiriesPage.tableHeaders.email, t.admin.inquiriesPage.tableHeaders.property, t.admin.inquiriesPage.tableHeaders.status, t.admin.inquiriesPage.tableHeaders.actions]}
          />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['agent', 'admin', 'superadmin']}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.admin.inquiriesPage.title}</h2>
          <p className="text-muted-foreground">{t.admin.inquiriesPage.subtitle}</p>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.inquiriesPage.tableHeaders.date}</TableHead>
                <TableHead>{t.admin.inquiriesPage.tableHeaders.name}</TableHead>
                <TableHead>{t.admin.inquiriesPage.tableHeaders.email}</TableHead>
                <TableHead>{t.admin.inquiriesPage.tableHeaders.property}</TableHead>
                <TableHead>{t.admin.inquiriesPage.tableHeaders.status}</TableHead>
                <TableHead className="text-right">{t.admin.inquiriesPage.tableHeaders.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries?.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    {formatDate(inquiry.created_at)}
                  </TableCell>
                  <TableCell className="font-medium">{inquiry.name}</TableCell>
                  <TableCell>{inquiry.email}</TableCell>
                  <TableCell>
                    {inquiry.properties?.title_es || t.admin.inquiriesPage.generalInquiry}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={inquiry.status}
                      onValueChange={(value) =>
                        updateStatusMutation.mutate({ id: inquiry.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">{t.admin.inquiriesPage.statuses.new}</SelectItem>
                        <SelectItem value="contacted">{t.admin.inquiriesPage.statuses.contacted}</SelectItem>
                        <SelectItem value="resolved">{t.admin.inquiriesPage.statuses.resolved}</SelectItem>
                        <SelectItem value="archived">{t.admin.inquiriesPage.statuses.archived}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInquiry(inquiry)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(inquiry.id)}
                        aria-label={t.admin.actions.delete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!inquiries || inquiries.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-8 w-8" />
                      <p className="font-medium">{t.admin.inquiriesPage.noInquiries}</p>
                      <p className="text-sm">
                        {t.admin.inquiriesPage.inquiriesAppearHere}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t.admin.inquiriesPage.detailTitle}</DialogTitle>
            </DialogHeader>
            {selectedInquiry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.admin.common.name}</p>
                    <p>{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.admin.common.email}</p>
                    <p>{selectedInquiry.email}</p>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t.admin.common.phone}</p>
                      <p>{selectedInquiry.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.admin.common.date}</p>
                    <p>{formatDateLong(selectedInquiry.created_at)}</p>
                  </div>
                </div>
                {selectedInquiry.properties && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t.admin.inquiriesPage.propertyOfInterest}</p>
                    <p>{selectedInquiry.properties.title_es}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">{t.admin.inquiriesPage.message}</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.admin.inquiriesPage.deleteConfirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.admin.inquiriesPage.deleteConfirmDesc}
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

export default function AdminInquiries() {
  return (
    <AdminLayout>
      <InquiriesContent />
    </AdminLayout>
  );
}
