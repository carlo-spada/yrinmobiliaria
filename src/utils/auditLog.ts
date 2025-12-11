import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

import { logger } from "./logger";

type Json = Database['public']['Tables']['audit_logs']['Row']['changes'];

export interface AuditLogEntry {
  action: string;
  table_name?: string;
  record_id?: string;
  changes?: Record<string, unknown>;
}

export interface AuditLogResult {
  success: boolean;
  error?: string;
}

/**
 * Log an audit event to the database.
 *
 * NOTE: The user_id is enforced by RLS policy on the audit_logs table.
 * The policy (auth.uid() = user_id) ensures that users can only create audit logs
 * with their own user_id, preventing manipulation even if client code is modified.
 *
 * @returns AuditLogResult indicating success/failure and optional error message
 */
export const logAuditEvent = async (entry: AuditLogEntry): Promise<AuditLogResult> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const errorMsg = 'Cannot log audit event: No authenticated user';
      logger.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action: entry.action,
        table_name: entry.table_name,
        record_id: entry.record_id,
        changes: entry.changes ? (entry.changes as Json) : null,
      }]);

    if (error) {
      logger.error('Failed to log audit event', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error logging audit event', error);
    return { success: false, error: errorMsg };
  }
};
