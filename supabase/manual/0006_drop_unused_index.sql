-- =============================================================================
-- 0006 — Phase 2.2 (resto): elimina índice no usado
-- =============================================================================
-- Aplicado en vivo vía Supabase MCP (apply_migration `phase2_drop_unused_index`).
-- `profiles_directory_idx` era un índice parcial sobre un booleano
-- (`(show_in_directory) where show_in_directory`): no-selectivo y nunca usado
-- (advisor `unused_index`). En `profiles` (tabla pequeña) la consulta del
-- directorio hace seq scan.
-- Reversible:
--   create index profiles_directory_idx on public.profiles (show_in_directory)
--     where show_in_directory;
-- =============================================================================

drop index if exists public.profiles_directory_idx;
