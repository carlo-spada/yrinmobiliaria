import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  Server,
  Shield,
  Zap
} from 'lucide-react';
import { useRef, useState } from 'react';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { RoleGuard } from '@/components/admin/RoleGuard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserRole } from '@/hooks/useUserRole';

import { HealthCheck, runAdminHealthChecks } from './adminHealthChecks';

const REFRESH_COOLDOWN_MS = 500;

export default function AdminHealth() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { isSuperadmin } = useUserRole();
  const lastRefreshRef = useRef<number>(0);

  const { data: healthChecks, refetch, isFetching } = useQuery({
    queryKey: ['admin-health'],
    queryFn: () => runAdminHealthChecks(),
    enabled: false,
  });

  const handleRefresh = async () => {
    if (!isSuperadmin) return;

    // Rate limiting: prevent rapid refreshes
    const now = Date.now();
    if (now - lastRefreshRef.current < REFRESH_COOLDOWN_MS) {
      return;
    }
    lastRefreshRef.current = now;

    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), REFRESH_COOLDOWN_MS);
  };

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: HealthCheck['status']) => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      unhealthy: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status]}>
        {status === 'healthy' ? 'Healthy' : status === 'degraded' ? 'Degraded' : 'Unhealthy'}
      </Badge>
    );
  };

  const getServiceIcon = (name: string) => {
    if (name.includes('Database')) return Database;
    if (name.includes('Auth')) return Shield;
    if (name.includes('Storage')) return Server;
    if (name.includes('Realtime')) return Zap;
    if (name.includes('RLS')) return Shield;
    return Activity;
  };

  const overallStatus = healthChecks
    ? healthChecks.every(c => c.status === 'healthy')
      ? 'healthy'
      : healthChecks.some(c => c.status === 'unhealthy')
        ? 'unhealthy'
        : 'degraded'
    : 'degraded';

  const avgResponseTime = healthChecks && healthChecks.length > 0
    ? healthChecks.reduce((sum, check) => sum + (check.responseTime || 0), 0) / healthChecks.length
    : 0;

  return (
    <AdminLayout>
      <RoleGuard allowedRoles={['superadmin']}>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
            <p className="text-muted-foreground">Monitor Supabase connectivity and service status</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing || isFetching}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing || isFetching ? 'animate-spin' : ''}`} />
            Ejecutar chequeo
          </Button>
        </div>

        {/* Overall Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(overallStatus)}
                <div>
                  <CardTitle>Overall System Status</CardTitle>
                  <CardDescription>
                    All services monitored • Updated every 30 seconds
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge(overallStatus)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Services Checked</p>
                <p className="text-2xl font-bold">{healthChecks?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Response Time</p>
                <p className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Service Checks */}
        <div className="grid gap-4">
          {isFetching ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Running health checks...</span>
                </div>
              </CardContent>
            </Card>
          ) : !healthChecks ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Ejecuta el chequeo para ver el estado actual.
              </CardContent>
            </Card>
          ) : (
            healthChecks?.map((check, index) => {
              const ServiceIcon = getServiceIcon(check.name);
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <ServiceIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">{check.name}</CardTitle>
                            {getStatusIcon(check.status)}
                          </div>
                          <CardDescription>{check.message}</CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(check.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm">
                      {check.responseTime !== undefined && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Response: <span className="font-mono font-semibold text-foreground">{check.responseTime}ms</span>
                          </span>
                        </div>
                      )}
                      {check.details && Object.keys(check.details).length > 0 && (
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            {Object.entries(check.details).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: <span className="font-semibold text-foreground">{String(value)}</span>
                              </span>
                            ))}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Help Alert */}
        {overallStatus === 'unhealthy' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>System Issues Detected</AlertTitle>
            <AlertDescription>
              One or more services are unhealthy. Check the individual service details above for specific error messages.
              If issues persist, verify your Supabase project status or contact support.
            </AlertDescription>
          </Alert>
        )}
        </div>
      </RoleGuard>
    </AdminLayout>
  );
}
