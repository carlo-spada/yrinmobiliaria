import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { RoleGuard } from '@/components/admin/RoleGuard';
import { TableSkeleton } from '@/components/admin/TableSkeleton';
import { useAdminOrg } from '@/components/admin/useAdminOrg';
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
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { logAuditEvent } from '@/utils/auditLog';

type ContactInquiry = Database['public']['Tables']['contact_inquiries']['Row'] & {
  properties?: { title_es: string } | null;
};

function InquiriesContent() {
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const queryClient = useQueryClient();
  const { effectiveOrgId, isAllOrganizations } = useAdminOrg();
  const { isSuperadmin } = useUserRole();
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
      toast.success('Estado actualizado');
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
      toast.success('Consulta eliminada');
    },
  });

  // Conditional rendering AFTER all hooks
  if (!canQuery) {
    return (
      <RoleGuard allowedRoles={['agent', 'admin', 'superadmin']}>
        <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
          Asigna una organización a tu perfil para ver consultas.
        </div>
      </RoleGuard>
    );
  }

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['agent', 'admin', 'superadmin']}>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Consultas de Contacto</h2>
            <p className="text-muted-foreground">Gestiona todas las consultas recibidas</p>
          </div>
          <TableSkeleton 
            columns={6} 
            rows={5}
            headers={['Fecha', 'Nombre', 'Email', 'Propiedad', 'Estado', 'Acciones']}
          />
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['agent', 'admin', 'superadmin']}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Consultas de Contacto</h2>
          <p className="text-muted-foreground">Gestiona todas las consultas recibidas</p>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Propiedad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries?.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell>
                    {format(new Date(inquiry.created_at), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell className="font-medium">{inquiry.name}</TableCell>
                  <TableCell>{inquiry.email}</TableCell>
                  <TableCell>
                    {inquiry.properties?.title_es || 'Consulta General'}
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
                        <SelectItem value="new">Nueva</SelectItem>
                        <SelectItem value="contacted">Contactada</SelectItem>
                        <SelectItem value="resolved">Resuelta</SelectItem>
                        <SelectItem value="archived">Archivada</SelectItem>
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
                        onClick={() => deleteMutation.mutate(inquiry.id)}
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

        <Dialog open={!!selectedInquiry} onOpenChange={() => setSelectedInquiry(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalle de Consulta</DialogTitle>
            </DialogHeader>
            {selectedInquiry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                    <p>{selectedInquiry.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p>{selectedInquiry.email}</p>
                  </div>
                  {selectedInquiry.phone && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                      <p>{selectedInquiry.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                    <p>{format(new Date(selectedInquiry.created_at), "dd 'de' MMMM, yyyy", { locale: es })}</p>
                  </div>
                </div>
                {selectedInquiry.properties && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Propiedad de Interés</p>
                    <p>{selectedInquiry.properties.title_es}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Mensaje</p>
                  <p className="text-sm whitespace-pre-wrap bg-muted p-4 rounded-md">
                    {selectedInquiry.message}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
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
