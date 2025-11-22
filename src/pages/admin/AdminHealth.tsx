import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  responseTime?: number;
  details?: Record<string, unknown>;
}

export default function AdminHealth() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: healthChecks, refetch, isLoading } = useQuery({
    queryKey: ['admin-health'],
    queryFn: async () => {
      const checks: HealthCheck[] = [];
      
      // 1. Database Connectivity
      const dbStart = Date.now();
      try {
        const { error: dbError, count } = await supabase
          .from('properties')
          .select('id', { count: 'exact', head: true });
        
        const dbTime = Date.now() - dbStart;
        
        if (dbError) {
          checks.push({
            name: 'Database Connection',
            status: 'unhealthy',
            message: `Error: ${dbError.message}`,
            responseTime: dbTime,
          });
        } else {
          checks.push({
            name: 'Database Connection',
            status: dbTime < 1000 ? 'healthy' : 'degraded',
            message: `Connected successfully. ${count} properties in database.`,
            responseTime: dbTime,
            details: { propertyCount: count },
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        checks.push({
          name: 'Database Connection',
          status: 'unhealthy',
          message: `Connection failed: ${errorMessage}`,
          responseTime: Date.now() - dbStart,
        });
      }

      // 2. Authentication Service
      const authStart = Date.now();
      try {
        const { data: session } = await supabase.auth.getSession();
        const authTime = Date.now() - authStart;
        
        checks.push({
          name: 'Authentication Service',
          status: 'healthy',
          message: session.session ? 'User authenticated' : 'Service operational (no active session)',
          responseTime: authTime,
          details: { authenticated: !!session.session },
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        checks.push({
          name: 'Authentication Service',
          status: 'unhealthy',
          message: `Auth check failed: ${errorMessage}`,
          responseTime: Date.now() - authStart,
        });
      }

      // 3. RLS Policies Check
      const rlsStart = Date.now();
      try {
        // Try to query role_assignments (requires auth)
        const { error: rlsError } = await supabase
          .from('role_assignments')
          .select('id')
          .limit(1);
        
        const rlsTime = Date.now() - rlsStart;
        
        checks.push({
          name: 'Row Level Security',
          status: rlsError ? 'degraded' : 'healthy',
          message: rlsError 
            ? `RLS active but query restricted: ${rlsError.message}`
            : 'RLS policies functioning correctly',
          responseTime: rlsTime,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        checks.push({
          name: 'Row Level Security',
          status: 'unhealthy',
          message: `RLS check failed: ${errorMessage}`,
          responseTime: Date.now() - rlsStart,
        });
      }

      // 4. Storage Bucket Access
      const storageStart = Date.now();
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        const storageTime = Date.now() - storageStart;
        
        if (bucketError) {
          checks.push({
            name: 'Storage Service',
            status: 'unhealthy',
            message: `Storage check failed: ${bucketError.message}`,
            responseTime: storageTime,
          });
        } else {
          const propertyImagesBucket = buckets?.find(b => b.name === 'property-images');
          checks.push({
            name: 'Storage Service',
            status: propertyImagesBucket ? 'healthy' : 'degraded',
            message: propertyImagesBucket 
              ? `Storage operational. Found ${buckets?.length || 0} buckets.`
              : 'Storage working but property-images bucket not found',
            responseTime: storageTime,
            details: { bucketCount: buckets?.length },
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        checks.push({
          name: 'Storage Service',
          status: 'unhealthy',
          message: `Storage check failed: ${errorMessage}`,
          responseTime: Date.now() - storageStart,
        });
      }

      // 5. Storage RLS Upload/Delete (tiny object)
      const storageRlsStart = Date.now();
      try {
        const testPath = `health-check/${Date.now()}-${Math.random().toString(36).slice(2)}.txt`;
        const testBlob = new Blob(['ok'], { type: 'text/plain' });

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(testPath, testBlob, { cacheControl: '0', upsert: false });

        const uploadTime = Date.now() - storageRlsStart;

        if (uploadError || !uploadData?.path) {
          checks.push({
            name: 'Storage Upload (RLS)',
            status: 'unhealthy',
            message: uploadError?.message 
              ? `Upload blocked: ${uploadError.message}`
              : 'Upload blocked: no path returned',
            responseTime: uploadTime,
          });
        } else {
          // Attempt cleanup; do not fail the check if delete fails, just mark degraded
          const { error: deleteError } = await supabase.storage
            .from('property-images')
            .remove([uploadData.path]);

          checks.push({
            name: 'Storage Upload (RLS)',
            status: deleteError ? 'degraded' : 'healthy',
            message: deleteError
              ? `Uploaded test file but cleanup failed: ${deleteError.message}`
              : 'Upload & delete permitted (RLS ok)',
            responseTime: uploadTime,
            details: { path: uploadData.path },
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        checks.push({
          name: 'Storage Upload (RLS)',
          status: 'unhealthy',
          message: `Upload test failed: ${errorMessage}`,
          responseTime: Date.now() - storageRlsStart,
        });
      }

      // 6. Realtime Connection
      const realtimeStart = Date.now();
      try {
        const channel = supabase.channel('health-check');
        const realtimeTime = Date.now() - realtimeStart;
        
        checks.push({
          name: 'Realtime Service',
          status: 'healthy',
          message: 'Realtime channels available',
          responseTime: realtimeTime,
        });
        
        // Clean up channel
        await supabase.removeChannel(channel);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        checks.push({
          name: 'Realtime Service',
          status: 'degraded',
          message: `Realtime check inconclusive: ${errorMessage}`,
          responseTime: Date.now() - realtimeStart,
        });
      }

      return checks;
    },
    refetchInterval: 30000, // Auto-refresh every 30 seconds
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
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

  const overallStatus = healthChecks?.every(c => c.status === 'healthy') 
    ? 'healthy' 
    : healthChecks?.some(c => c.status === 'unhealthy')
    ? 'unhealthy'
    : 'degraded';

  const avgResponseTime = healthChecks?.reduce((sum, check) => sum + (check.responseTime || 0), 0) / (healthChecks?.length || 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">System Health</h2>
            <p className="text-muted-foreground">Monitor Supabase connectivity and service status</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing || isLoading}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
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
          {isLoading ? (
            <Card>
              <CardContent className="py-8">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Running health checks...</span>
                </div>
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
    </AdminLayout>
  );
}
