import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { RoleGuard } from '@/components/admin/RoleGuard';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { formatDateTimeFull } from '@/utils/dateFormat';

// Configuration constants
const AUDIT_LOG_CONFIG = {
  DEFAULT_LIMIT: 100,
  USER_ID_DISPLAY_LENGTH: 8,
} as const;

// Sensitive fields that should be redacted in audit logs
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'api_key',
  'apiKey',
  'credential',
  'auth',
  'session',
  'cookie',
  'private_key',
  'privateKey',
] as const;

/**
 * Sanitize audit log changes by redacting sensitive fields
 * Prevents XSS by escaping HTML and handles potential security issues
 */
const sanitizeChanges = (changes: Json): string => {
  if (!changes || typeof changes !== 'object') return '-';
  if (Array.isArray(changes)) return JSON.stringify(changes);

  const sanitized = { ...changes as Record<string, unknown> };

  // Redact sensitive fields (case-insensitive check)
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  // Escape HTML entities to prevent XSS when rendering
  const escaped = JSON.stringify(sanitized, null, 2)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  return escaped;
};

export default function AdminAuditLogs() {
  const { t } = useLanguage();
  const { data: logs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(AUDIT_LOG_CONFIG.DEFAULT_LIMIT);
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 2,
  });

  const getActionColor = (action: string) => {
    if (action.includes('DELETE')) return 'destructive';
    if (action.includes('CREATE')) return 'default';
    if (action.includes('UPDATE')) return 'secondary';
    return 'outline';
  };

  return (
    <AdminLayout>
      <RoleGuard allowedRoles={['admin', 'superadmin']}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.admin.auditLogsPage.title}</h2>
          <p className="text-muted-foreground">{t.admin.auditLogsPage.subtitle}</p>
        </div>

        <div className="border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">{t.admin.auditLogsPage.loadingLogs}</div>
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.admin.auditLogsPage.tableHeaders.dateTime}</TableHead>
                <TableHead>{t.admin.auditLogsPage.tableHeaders.action}</TableHead>
                <TableHead>{t.admin.auditLogsPage.tableHeaders.table}</TableHead>
                <TableHead>{t.admin.auditLogsPage.tableHeaders.userId}</TableHead>
                <TableHead>{t.admin.auditLogsPage.tableHeaders.details}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {formatDateTimeFull(log.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionColor(log.action)}>
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.table_name ?? '-'}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.user_id
                      ? `${log.user_id.slice(0, AUDIT_LOG_CONFIG.USER_ID_DISPLAY_LENGTH)}...`
                      : t.admin.auditLogsPage.system}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <pre
                      className="whitespace-pre-wrap text-xs font-mono bg-muted p-2 rounded max-h-24 overflow-auto"
                      dangerouslySetInnerHTML={{ __html: sanitizeChanges(log.changes) }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {(!logs || logs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p className="font-medium">{t.admin.auditLogsPage.noLogs}</p>
                      <p className="text-sm">
                        {t.admin.auditLogsPage.logsAppearHere}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {t.admin.auditLogsPage.showingLast} {AUDIT_LOG_CONFIG.DEFAULT_LIMIT} {t.admin.auditLogsPage.title.toLowerCase()}
        </p>
      </div>
      </RoleGuard>
    </AdminLayout>
  );
}
