import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, MessageSquare, Calendar, FileText } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminOrg } from '@/components/admin/AdminOrgContext';
import { useUserRole } from '@/hooks/useUserRole';

export default function AdminDashboard() {
  const { effectiveOrgId, isAllOrganizations } = useAdminOrg();
  const { isSuperadmin } = useUserRole();
  const scopedOrg = isSuperadmin && isAllOrganizations ? null : effectiveOrgId;

  if (!isSuperadmin && !scopedOrg) {
    return (
      <AdminLayout>
        <div className="min-h-[200px] flex items-center justify-center text-muted-foreground">
          Asigna una organización a tu perfil para ver el dashboard.
        </div>
      </AdminLayout>
    );
  }

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const propertyQuery = supabase.from('properties').select('id', { count: 'exact', head: true });
      const inquiriesQuery = supabase.from('contact_inquiries').select('id', { count: 'exact', head: true });
      const visitsQuery = supabase.from('scheduled_visits').select('id', { count: 'exact', head: true });

      if (scopedOrg) {
        propertyQuery.eq('organization_id', scopedOrg);
        inquiriesQuery.eq('organization_id', scopedOrg);
        visitsQuery.eq('organization_id', scopedOrg);
      }

      const [properties, inquiries, visits, logs] = await Promise.all([
        propertyQuery,
        inquiriesQuery,
        visitsQuery,
        supabase.from('audit_logs').select('id', { count: 'exact', head: true }),
      ]);

      return {
        properties: properties.count || 0,
        inquiries: inquiries.count || 0,
        visits: visits.count || 0,
        logs: logs.count || 0,
      };
    },
  });

  const { data: recentInquiries } = useQuery({
    queryKey: ['recent-inquiries', scopedOrg],
    queryFn: async () => {
      let query = supabase
        .from('contact_inquiries')
        .select('*, properties(title_es)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (scopedOrg) {
        query = query.eq('organization_id', scopedOrg);
      }

      const { data } = await query;
      return data || [];
    },
    enabled: isSuperadmin || !!scopedOrg,
  });

  const { data: upcomingVisits } = useQuery({
    queryKey: ['upcoming-visits', scopedOrg],
    queryFn: async () => {
      let query = supabase
        .from('scheduled_visits')
        .select('*, properties(title_es)')
        .gte('preferred_date', new Date().toISOString().split('T')[0])
        .order('preferred_date', { ascending: true })
        .limit(5);

      if (scopedOrg) {
        query = query.eq('organization_id', scopedOrg);
      }

      const { data } = await query;
      return data || [];
    },
    enabled: isSuperadmin || !!scopedOrg,
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Resumen general de la plataforma</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Propiedades</CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.properties || 0}</div>
              <p className="text-xs text-muted-foreground">Total en el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.inquiries || 0}</div>
              <p className="text-xs text-muted-foreground">Total recibidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visitas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.visits || 0}</div>
              <p className="text-xs text-muted-foreground">Total agendadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actividad</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.logs || 0}</div>
              <p className="text-xs text-muted-foreground">Registros de actividad</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Consultas Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentInquiries && recentInquiries.length > 0 ? (
                <div className="space-y-3">
                  {recentInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="flex flex-col space-y-1 border-b pb-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{inquiry.name}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          inquiry.status === 'new' ? 'bg-blue-100 text-blue-700' :
                          inquiry.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {inquiry.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                      {inquiry.properties && (
                        <p className="text-xs text-muted-foreground">
                          Propiedad: {inquiry.properties.title_es}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay consultas recientes</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Próximas Visitas</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingVisits && upcomingVisits.length > 0 ? (
                <div className="space-y-3">
                  {upcomingVisits.map((visit) => (
                    <div key={visit.id} className="flex flex-col space-y-1 border-b pb-3 last:border-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{visit.name}</p>
                        <span className={`text-xs px-2 py-1 rounded ${
                          visit.status === 'pending' ? 'bg-blue-100 text-blue-700' :
                          visit.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {visit.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(visit.preferred_date).toLocaleDateString('es-MX')} - {visit.preferred_time}
                      </p>
                      {visit.properties && (
                        <p className="text-xs text-muted-foreground">
                          Propiedad: {visit.properties.title_es}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay visitas próximas</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
