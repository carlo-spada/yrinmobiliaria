import { supabase } from '@/integrations/supabase/client';

const HEALTH_CHECK_CONFIG = {
  DB_RESPONSE_HEALTHY_MS: 1000,
} as const;

export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  responseTime?: number;
  details?: Record<string, unknown>;
}

export async function runAdminHealthChecks(client = supabase): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  const dbStart = Date.now();
  try {
    const { error: dbError, count } = await client
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
        status: dbTime < HEALTH_CHECK_CONFIG.DB_RESPONSE_HEALTHY_MS ? 'healthy' : 'degraded',
        message: `Connected successfully. ${count ?? 0} properties in database.`,
        responseTime: dbTime,
        details: { propertyCount: count ?? 0 },
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

  const authStart = Date.now();
  try {
    const { data: session } = await client.auth.getSession();
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

  const rlsStart = Date.now();
  try {
    const { error: rlsError } = await client
      .from('profiles')
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

  const storageStart = Date.now();
  try {
    const { data: bucketList, error: bucketError } = await client.storage
      .from('property-images')
      .list('', { limit: 1 });
    const storageTime = Date.now() - storageStart;

    if (bucketError) {
      checks.push({
        name: 'Storage Service',
        status: 'unhealthy',
        message: `property-images inaccesible: ${bucketError.message}`,
        responseTime: storageTime,
      });
    } else {
      checks.push({
        name: 'Storage Service',
        status: 'healthy',
        message: bucketList && bucketList.length > 0
          ? `Bucket accesible • ${bucketList.length} item(s) visibles`
          : 'Bucket accesible',
        responseTime: storageTime,
        details: { visibleItems: bucketList?.length ?? 0 },
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

  const storagePathStart = Date.now();
  try {
    const { data: prefixList, error: prefixError } = await client.storage
      .from('property-images')
      .list('agent-photos', { limit: 1 });
    const storagePathTime = Date.now() - storagePathStart;

    checks.push({
      name: 'Storage Path Access',
      status: prefixError ? 'degraded' : 'healthy',
      message: prefixError
        ? `Prefix listing restricted: ${prefixError.message}`
        : `Read-only prefix probe succeeded • ${prefixList?.length ?? 0} item(s) visibles`,
      responseTime: storagePathTime,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    checks.push({
      name: 'Storage Path Access',
      status: 'unhealthy',
      message: `Storage path check failed: ${errorMessage}`,
      responseTime: Date.now() - storagePathStart,
    });
  }

  const realtimeStart = Date.now();
  try {
    const channel = client.channel('health-check');
    const realtimeTime = Date.now() - realtimeStart;

    checks.push({
      name: 'Realtime Service',
      status: 'healthy',
      message: 'Realtime channels available',
      responseTime: realtimeTime,
    });

    await client.removeChannel(channel);
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
}
