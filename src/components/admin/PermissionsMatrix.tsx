import { Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type Permission = {
  resource: string;
  action: string;
  superadmin: boolean;
  admin: boolean;
  agent: boolean;
  user: boolean;
};

const permissions: Permission[] = [
  // Properties
  { resource: 'Propiedades', action: 'Ver todas', superadmin: true, admin: true, agent: true, user: true },
  { resource: 'Propiedades', action: 'Crear', superadmin: true, admin: true, agent: true, user: false },
  { resource: 'Propiedades', action: 'Editar propias', superadmin: true, admin: true, agent: true, user: false },
  { resource: 'Propiedades', action: 'Editar todas', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Propiedades', action: 'Eliminar', superadmin: true, admin: true, agent: false, user: false },
  
  // Users
  { resource: 'Usuarios', action: 'Ver lista', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Usuarios', action: 'Editar cualquiera', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Usuarios', action: 'Asignar organización', superadmin: true, admin: false, agent: false, user: false },
  { resource: 'Usuarios', action: 'Eliminar', superadmin: true, admin: true, agent: false, user: false },
  
  // Agents
  { resource: 'Agentes', action: 'Ver directorio', superadmin: true, admin: true, agent: true, user: true },
  { resource: 'Agentes', action: 'Invitar nuevos', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Agentes', action: 'Gestionar de la org', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Agentes', action: 'Promover a admin', superadmin: true, admin: true, agent: false, user: false },
  
  // Organizations
  { resource: 'Organizaciones', action: 'Ver todas', superadmin: true, admin: false, agent: false, user: false },
  { resource: 'Organizaciones', action: 'Crear', superadmin: true, admin: false, agent: false, user: false },
  { resource: 'Organizaciones', action: 'Editar', superadmin: true, admin: false, agent: false, user: false },
  { resource: 'Organizaciones', action: 'Eliminar', superadmin: true, admin: false, agent: false, user: false },
  
  // Inquiries
  { resource: 'Consultas', action: 'Ver de la org', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Consultas', action: 'Ver asignadas', superadmin: true, admin: true, agent: true, user: false },
  { resource: 'Consultas', action: 'Asignar a agentes', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Consultas', action: 'Cambiar estado', superadmin: true, admin: true, agent: false, user: false },
  
  // Scheduled Visits
  { resource: 'Visitas', action: 'Ver de la org', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Visitas', action: 'Ver asignadas', superadmin: true, admin: true, agent: true, user: false },
  { resource: 'Visitas', action: 'Asignar a agentes', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Visitas', action: 'Cambiar estado', superadmin: true, admin: true, agent: false, user: false },
  
  // Service Zones
  { resource: 'Zonas de Servicio', action: 'Ver', superadmin: true, admin: true, agent: true, user: true },
  { resource: 'Zonas de Servicio', action: 'Crear', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Zonas de Servicio', action: 'Editar', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Zonas de Servicio', action: 'Eliminar', superadmin: true, admin: true, agent: false, user: false },
  
  // CMS Pages
  { resource: 'Páginas CMS', action: 'Ver publicadas', superadmin: true, admin: true, agent: true, user: true },
  { resource: 'Páginas CMS', action: 'Crear', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Páginas CMS', action: 'Editar', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Páginas CMS', action: 'Publicar', superadmin: true, admin: true, agent: false, user: false },
  
  // Settings
  { resource: 'Configuración', action: 'Ver', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Configuración', action: 'Editar sitio', superadmin: true, admin: true, agent: false, user: false },
  { resource: 'Configuración', action: 'Ver auditoría', superadmin: true, admin: true, agent: false, user: false },
  
  // Profile
  { resource: 'Perfil', action: 'Ver propio', superadmin: true, admin: true, agent: true, user: true },
  { resource: 'Perfil', action: 'Editar propio', superadmin: true, admin: true, agent: true, user: true },
  
  // Favorites
  { resource: 'Favoritos', action: 'Gestionar propios', superadmin: true, admin: true, agent: true, user: true },
];

const PermissionIcon = ({ allowed }: { allowed: boolean }) => {
  if (allowed) {
    return <Check className="h-5 w-5 text-green-600 mx-auto" />;
  }
  return <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
};

export const PermissionsMatrix = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Permisos</CardTitle>
        <CardDescription>
          Vista completa de los permisos por rol en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="default">Superadmin</Badge>
            <Badge variant="secondary">Admin</Badge>
            <Badge variant="outline">Agent</Badge>
            <Badge variant="outline" className="bg-muted">User</Badge>
          </div>
          
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Recurso</TableHead>
                  <TableHead className="w-[250px]">Acción</TableHead>
                  <TableHead className="text-center w-[120px]">Superadmin</TableHead>
                  <TableHead className="text-center w-[120px]">Admin</TableHead>
                  <TableHead className="text-center w-[120px]">Agent</TableHead>
                  <TableHead className="text-center w-[120px]">User</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((permission, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{permission.resource}</TableCell>
                    <TableCell className="text-muted-foreground">{permission.action}</TableCell>
                    <TableCell>
                      <PermissionIcon allowed={permission.superadmin} />
                    </TableCell>
                    <TableCell>
                      <PermissionIcon allowed={permission.admin} />
                    </TableCell>
                    <TableCell>
                      <PermissionIcon allowed={permission.agent} />
                    </TableCell>
                    <TableCell>
                      <PermissionIcon allowed={permission.user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Nota:</strong> Los permisos se heredan jerárquicamente:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li><strong>Superadmin:</strong> Acceso completo al sistema, puede gestionar todas las organizaciones</li>
              <li><strong>Admin:</strong> Acceso completo a su organización, puede gestionar usuarios y agentes</li>
              <li><strong>Agent:</strong> Puede gestionar sus propias propiedades y ver consultas/visitas asignadas</li>
              <li><strong>User:</strong> Acceso público, puede ver propiedades y gestionar favoritos</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
