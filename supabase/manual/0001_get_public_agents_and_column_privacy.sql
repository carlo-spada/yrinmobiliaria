-- ============================================================================
-- APLICAR MANUALMENTE en el backend NUEVO (ticsgpyathxawsupcghj)
-- vía Supabase Dashboard → SQL Editor, o `supabase db execute`.
-- NO es una migración auto-aplicable (CLAUDE.md: el agente no aplica migraciones).
--
-- Parte de PR1b. Cierra dos gaps de PR1a en el backend nuevo:
--   1. Recrea el RPC seguro get_public_agents() que el frontend usa para el
--      directorio público de agentes (usePublicAgents / useAgentBySlug).
--      Single-tenant: sin organization_id. Devuelve SOLO columnas no sensibles.
--   2. Cierra la brecha de privacidad: la política profiles_select_public
--      expone filas completas de agentes a usuarios anónimos. RLS filtra FILAS
--      pero no COLUMNAS, así que restringimos a anon a columnas públicas vía
--      column-level grants. El join anónimo de useProperties
--      (agent:profiles -> id, display_name, photo_url, agent_level) sigue
--      funcionando; email/phone/whatsapp dejan de ser legibles por anon.
-- ============================================================================

-- 1) RPC seguro para el directorio público de agentes ------------------------
create or replace function public.get_public_agents()
returns table (
  id uuid,
  display_name text,
  photo_url text,
  bio_es text,
  bio_en text,
  agent_level public.agent_level,
  agent_years_experience integer,
  agent_license_number text,
  agent_specialty text[],
  languages text[],
  service_zones text[],
  is_featured boolean,
  instagram_handle text,
  linkedin_url text,
  facebook_url text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.display_name,
    p.photo_url,
    p.bio_es,
    p.bio_en,
    p.agent_level,
    p.agent_years_experience,
    p.agent_license_number,
    p.agent_specialty,
    p.languages,
    p.service_zones,
    coalesce(p.is_featured, false),
    p.instagram_handle,
    p.linkedin_url,
    p.facebook_url
  from public.profiles p
  where p.show_in_directory and p.is_active;
$$;

grant execute on function public.get_public_agents() to anon, authenticated;

-- 2) Privacidad a nivel de columna para clientes anónimos --------------------
revoke select on public.profiles from anon;

grant select (
  id,
  display_name,
  photo_url,
  bio_es,
  bio_en,
  agent_level,
  agent_years_experience,
  agent_license_number,
  agent_specialty,
  languages,
  service_zones,
  is_featured,
  show_in_directory,
  is_active,
  instagram_handle,
  linkedin_url,
  facebook_url,
  job_title
) on public.profiles to anon;

-- Nota: los usuarios `authenticated` conservan SELECT completo (necesario para
-- leer el propio perfil y para administración). El riesgo residual de que un
-- usuario autenticado lea columnas sensibles de otros agentes en directorio se
-- aborda en una iteración posterior (vista pública o split de políticas).
