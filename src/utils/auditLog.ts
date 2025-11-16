import { supabase } from "@/integrations/supabase/client";

export interface AuditLogEntry {
  action: string;
  table_name?: string;
  record_id?: string;
  changes?: Record<string, any>;
}

export const logAuditEvent = async (entry: AuditLogEntry) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('Cannot log audit event: No authenticated user');
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
      console.error('Failed to log audit event:', error);
    }
  } catch (error) {
    console.error('Error logging audit event:', error);
  }
};
