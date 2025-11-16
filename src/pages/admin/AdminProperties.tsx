import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PropertiesTable } from '@/components/admin/PropertiesTable';
import { PropertyFormDialog } from '@/components/admin/PropertyFormDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AdminProperties() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Propiedades</h2>
            <p className="text-muted-foreground">Gestiona todas las propiedades del sitio</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Propiedad
          </Button>
        </div>

        <PropertiesTable />

        <PropertyFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>
    </AdminLayout>
  );
}
