import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Database, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminSettings() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h2>
          <p className="text-muted-foreground">Ajustes generales y configuración de seguridad</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
              <CardDescription>
                Configuración de seguridad y autenticación
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Autenticación de Dos Factores</p>
                  <p className="text-sm text-muted-foreground">Protección adicional para cuentas admin</p>
                </div>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Política de Contraseñas</p>
                  <p className="text-sm text-muted-foreground">Requisitos de seguridad activos</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Activa</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Base de Datos
              </CardTitle>
              <CardDescription>
                Estado y configuración de la base de datos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">RLS Habilitado</p>
                  <p className="text-sm text-muted-foreground">Row Level Security activo en todas las tablas</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Sí</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Respaldos Automáticos</p>
                  <p className="text-sm text-muted-foreground">Gestión de copias de seguridad</p>
                </div>
                <Button variant="outline" size="sm">Ver Respaldos</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Registro de Auditoría
              </CardTitle>
              <CardDescription>
                Sistema de seguimiento de cambios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auditoría Activa</p>
                  <p className="text-sm text-muted-foreground">Todas las acciones admin son registradas</p>
                </div>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Activa</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Retención de Logs</p>
                  <p className="text-sm text-muted-foreground">Almacenamiento indefinido</p>
                </div>
                <Button variant="outline" size="sm">Configurar</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
            <CardDescription>Detalles técnicos y versión</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Framework</p>
                <p className="font-medium">React + Vite</p>
              </div>
              <div>
                <p className="text-muted-foreground">Backend</p>
                <p className="font-medium">Lovable Cloud (Supabase)</p>
              </div>
              <div>
                <p className="text-muted-foreground">Base de Datos</p>
                <p className="font-medium">PostgreSQL</p>
              </div>
              <div>
                <p className="text-muted-foreground">Autenticación</p>
                <p className="font-medium">Supabase Auth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
