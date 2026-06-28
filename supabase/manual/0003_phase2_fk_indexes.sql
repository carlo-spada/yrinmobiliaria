-- =============================================================================
-- 0003 — Phase 2.2: covering indexes for unindexed foreign keys
-- =============================================================================
-- Aplicado en vivo vía Supabase MCP (apply_migration `phase2_fk_covering_indexes`).
-- Origen: advisor de performance — 10 lints `unindexed_foreign_keys`.
-- Cada FK sin índice puede degradar JOINs y los borrados en cascada / set null.
-- Aditivo y reversible (drop index ...). No cambia datos ni RLS.
-- =============================================================================

create index if not exists agent_invitations_accepted_by_idx
  on public.agent_invitations (accepted_by);
create index if not exists agent_invitations_invited_by_idx
  on public.agent_invitations (invited_by);
create index if not exists contact_inquiries_assigned_by_idx
  on public.contact_inquiries (assigned_by);
create index if not exists contact_inquiries_assigned_to_agent_idx
  on public.contact_inquiries (assigned_to_agent);
create index if not exists profiles_invited_by_idx
  on public.profiles (invited_by);
create index if not exists properties_created_by_idx
  on public.properties (created_by);
create index if not exists properties_is_translation_of_idx
  on public.properties (is_translation_of);
create index if not exists scheduled_visits_agent_id_idx
  on public.scheduled_visits (agent_id);
create index if not exists scheduled_visits_assigned_by_idx
  on public.scheduled_visits (assigned_by);
create index if not exists user_favorites_property_id_idx
  on public.user_favorites (property_id);

-- -----------------------------------------------------------------------------
-- El índice no usado `profiles_directory_idx` se elimina en
-- supabase/manual/0006_drop_unused_index.sql.
-- -----------------------------------------------------------------------------
