import { supabase } from "@/integrations/supabase/client";
import { logger } from "./logger";

export interface AuditLogEntry {
  action: string;
  table_name?: string;
  record_id?: string;
  changes?: Record<string, any>;
}

// NOTE: The user_id is enforced by RLS policy on the audit_logs table.
// The policy (auth.uid() = user_id) ensures that users can only create audit logs
// with their own user_id, preventing manipulation even if client code is modified.
export const logAuditEvent = async (entry: AuditLogEntry) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      logger.error('Cannot log audit event: No authenticated user');
      return;
    }

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: entry.action,
        table_name: entry.table_name,
        record_id: entry.record_id,
        changes: entry.changes,
      });

    if (error) {
      logger.error('Failed to log audit event', error);
    }
  } catch (error) {
    logger.error('Error logging audit event', error);
  }
};
