import { AdminLayout } from "@/components/admin/AdminLayout";
import { RoleGuard } from "@/components/admin/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const SchemaBuilder = () => {
  return (
    <AdminLayout>
      <RoleGuard allowedRoles={['superadmin']}>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">Constructor de Esquema</h1>
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Campos Dinámicos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Aquí podrás agregar nuevos campos a Propiedades y Usuarios.
                (Próximamente)
              </p>
            </CardContent>
          </Card>
        </div>
      </RoleGuard>
    </AdminLayout>
  );
};

export default SchemaBuilder;
