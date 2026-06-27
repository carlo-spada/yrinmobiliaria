-- ============================================================================
-- APLICAR MANUALMENTE en el backend NUEVO (ticsgpyathxawsupcghj)
-- vía Supabase Dashboard → SQL Editor, o `supabase db execute`.
-- NO es una migración auto-aplicable (CLAUDE.md: el agente no aplica migraciones).
--
-- Origen: auditoría de código post-migración (Lote C). Silencia los WARN
-- 0028/0029 del advisor de seguridad SIN romper nada, endureciendo qué roles
-- pueden invocar los helpers SECURITY DEFINER vía PostgREST (/rest/v1/rpc/...).
--
-- Contexto verificado (no a ciegas):
--   - Los helpers is_admin/is_staff/is_superadmin/has_role/current_profile_ids
--     SOLO se usan DENTRO de políticas RLS (contexto SECURITY DEFINER). El
--     cliente NO los llama vía .rpc() (grep: las únicas llamadas .rpc del
--     frontend son a get_public_agents). Revocar EXECUTE a anon/authenticated
--     NO afecta la evaluación de RLS → el advisor deja de marcarlos.
--   - get_public_agents() SÍ es RPC público por diseño (directorio de agentes:
--     usePublicAgents / useAgentBySlug / seo-server). SE DEJA accesible a anon.
--     Sus 2 WARN restantes son intencionales y esperados.
--   - rls_auto_enable() es un EVENT TRIGGER que auto-activa RLS en tablas nuevas
--     de public (hardening inyectado por Supabase/Lovable). Una función
--     `returns event_trigger` NO es invocable directamente por un cliente
--     (Postgres lo prohíbe fuera del contexto del trigger), así que el WARN es
--     ruido; aun así revocamos EXECUTE para dejar el advisor limpio.
-- ============================================================================

-- 1) Quitar EXECUTE a anon/authenticated de los helpers internos de RLS -------
revoke execute on function public.is_admin(uuid)              from anon, authenticated;
revoke execute on function public.is_staff(uuid)              from anon, authenticated;
revoke execute on function public.is_superadmin(uuid)         from anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated;
revoke execute on function public.current_profile_ids()       from anon, authenticated;
revoke execute on function public.rls_auto_enable()           from anon, authenticated;

-- get_public_agents() se DEJA accesible (RPC público del directorio). No tocar.

-- 2) Leaked Password Protection (HaveIBeenPwned) -----------------------------
-- NO es SQL: actívalo en el Dashboard →
--   Authentication → Policies/Settings → "Leaked password protection" = ON.
-- Cierra el WARN auth_leaked_password_protection.

-- ============================================================================
-- NOTA — PERFORMANCE (NO incluido aquí; plan separado, pre-existente de PR1a):
--   - 28× auth_rls_initplan: envolver auth.uid() en (select auth.uid()) dentro
--     de las políticas para que se evalúe una vez por query, no por fila.
--   - 40× multiple_permissive_policies: consolidar políticas permisivas
--     solapadas (p. ej. select_public + select_staff en la misma tabla/rol).
--   - 10× unindexed_foreign_keys / 4× unused_index: INFO, opcional.
-- Estos cambios deben reflejarse en supabase/policies.sql (fuente canónica) y
-- aplicarse luego al backend. Es una reescritura amplia de políticas → se hace
-- como tarea enfocada aparte, no en este parche.
-- ============================================================================
