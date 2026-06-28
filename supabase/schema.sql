-- =============================================================================
-- YR Inmobiliaria — Esquema SINGLE-TENANT limpio (fuente de verdad)
-- =============================================================================
-- BASELINE VERIFICADO. Este archivo + policies.sql son la fuente de verdad
-- declarativa y reconstruyen por completo el esquema `public` del backend vivo
-- (ticsgpyathxawsupcghj). Reconciliado y verificado contra la BD viva el
-- 2026-06-28 (Phase 3): columnas/tipos/defaults, PK/FK/unique, índices, enums,
-- funciones, triggers, event triggers, RLS habilitado y bucket de Storage
-- coinciden 1:1. Las políticas RLS y los grants van en policies.sql.
--
-- Gobernanza: los parches aplicados a la BD viva viven, en orden, en
-- supabase/manual/NNNN_*.sql (registro inmutable). Este baseline ya los
-- incorpora a todos (manual/0001–0008). Ver supabase/README.md para el runbook
-- de cambios y el mapeo manual ↔ versión de migración viva.
--
-- Decisiones de diseño (plan aprobado), vs. la BD vieja de Lovable:
--   * Single-tenant: SE ELIMINA `organizations` y toda columna `organization_id`.
--   * Se descartan `entity_definitions` y `field_definitions` (experimento abandonado).
--   * Modelo de roles: `app_role` AÑADE 'agent'. La identidad de rol vive SOLO en
--     `role_assignments` (no en `profiles`, que el usuario puede editar → evita
--     escalada de privilegios). `profiles.agent_level` pasa a ser solo antigüedad
--     de display. Esto corrige el Bug 1 (agentes nuevos no reconocidos).
--   * RLS (políticas) y Storage NO van aquí — van en policies.sql.
-- =============================================================================

-- En Supabase, pgcrypto vive en el schema `extensions` (de ahí que el default de
-- agent_invitations.token use `extensions.gen_random_bytes`). gen_random_uuid()
-- es nativo de Postgres 13+ (no requiere extensión).
create extension if not exists "pgcrypto" with schema extensions;

-- ----------------------------------------------------------------------------
-- ENUMS
-- ----------------------------------------------------------------------------
create type public.app_role           as enum ('user', 'agent', 'admin', 'superadmin'); -- +agent
create type public.agent_level        as enum ('junior', 'associate', 'senior', 'partner');
create type public.property_operation as enum ('venta', 'renta');
create type public.property_status    as enum ('disponible', 'vendida', 'rentada', 'pendiente');
create type public.property_type      as enum ('casa', 'departamento', 'local', 'oficina', 'terrenos');

-- ----------------------------------------------------------------------------
-- updated_at helper
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- profiles  (sin organization_id, sin columna role)
-- ----------------------------------------------------------------------------
create table public.profiles (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references auth.users(id) on delete cascade,
  display_name           text not null,
  email                  text not null,
  phone                  text,
  whatsapp_number        text,
  photo_url              text,
  bio_es                 text,
  bio_en                 text,
  agent_level            public.agent_level,            -- solo display/antigüedad
  agent_license_number   text,
  agent_specialty        text[],
  agent_years_experience integer,
  languages              text[],
  service_zones          text[],
  linkedin_url           text,
  instagram_handle       text,
  facebook_url           text,
  professional_email     text,
  job_title              text,
  social_links           jsonb,
  email_preference       text,
  email_verified         boolean default false,
  email_verified_at      timestamptz,
  is_active              boolean default true,
  is_complete            boolean default false,
  is_featured            boolean default false,
  show_in_directory      boolean default true,
  completed_at           timestamptz,
  invited_by             uuid references auth.users(id) on delete set null,
  invited_at             timestamptz,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);
-- (profiles_directory_idx eliminado en Phase 2.2 — índice parcial no-selectivo
--  sin uso; ver supabase/manual/0006_drop_unused_index.sql)

-- ----------------------------------------------------------------------------
-- handle_new_user  (Phase 7.5 — crea el profile al alta en auth.users)
-- ----------------------------------------------------------------------------
-- Reemplaza el insert client-side de profiles tras signUp: server-side, atómico
-- con el alta y sin depender de la sesión/RLS (security definer, search_path
-- fijado). Mismas columnas que ponía el cliente. EXECUTE revocado (sólo lo
-- invoca el trigger; no es RPC-callable y no aparece en los lints 0028/0029, a
-- diferencia de los helpers de RLS). Ver manual/0008_handle_new_user_trigger.sql.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, display_name, is_complete)
  values (new.id, new.email, split_part(new.email, '@', 1), true)
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- role_assignments  (FUENTE DE VERDAD de roles; sin organization_id)
-- ----------------------------------------------------------------------------
create table public.role_assignments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.app_role not null,
  granted_at timestamptz default now(),
  unique (user_id, role)
);
create index role_assignments_user_idx on public.role_assignments (user_id);

-- ----------------------------------------------------------------------------
-- properties  (sin organization_id)
-- ----------------------------------------------------------------------------
create table public.properties (
  id                 uuid primary key default gen_random_uuid(),
  agent_id           uuid references public.profiles(id) on delete set null,
  title_es           text not null,
  title_en           text not null,
  description_es     text,
  description_en     text,
  type               public.property_type not null,
  operation          public.property_operation not null,
  status             public.property_status not null default 'disponible',
  price              numeric not null,
  location           jsonb not null default '{}'::jsonb,
  features           jsonb not null default '{}'::jsonb,
  amenities          text[],
  image_variants     jsonb,
  featured           boolean default false,
  language           text default 'es',
  is_translation_of  uuid references public.properties(id) on delete set null,
  published_date     timestamptz,
  created_by         uuid references auth.users(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index properties_status_idx   on public.properties (status);
create index properties_agent_idx    on public.properties (agent_id);
create index properties_featured_idx on public.properties (featured) where featured;
create trigger properties_set_updated_at before update on public.properties
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- property_images
-- ----------------------------------------------------------------------------
create table public.property_images (
  id            uuid primary key default gen_random_uuid(),
  property_id   uuid not null references public.properties(id) on delete cascade,
  image_url     text not null,
  display_order integer not null default 0,
  alt_text_es   text,
  alt_text_en   text,
  created_at    timestamptz not null default now()
);
create index property_images_property_idx on public.property_images (property_id);

-- ----------------------------------------------------------------------------
-- service_zones
-- ----------------------------------------------------------------------------
create table public.service_zones (
  id             uuid primary key default gen_random_uuid(),
  name_es        text not null,
  name_en        text not null,
  description_es text,
  description_en text,
  image_url      text,
  active         boolean not null default true,
  display_order  integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger service_zones_set_updated_at before update on public.service_zones
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- site_settings  (también fuente del email del negocio para las edge functions,
-- en reemplazo de la lectura de `organizations`)
-- ----------------------------------------------------------------------------
create table public.site_settings (
  id            uuid primary key default gen_random_uuid(),
  setting_key   text not null unique,
  setting_value jsonb not null,
  category      text not null,
  description   text not null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- cms_pages  (sin organization_id)
-- ----------------------------------------------------------------------------
create table public.cms_pages (
  id                     uuid primary key default gen_random_uuid(),
  slug                   text not null unique,
  title                  text not null,
  content                jsonb,
  is_published           boolean default false,
  last_agent_interaction timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create trigger cms_pages_set_updated_at before update on public.cms_pages
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- contact_inquiries  (sin organization_id)
-- ----------------------------------------------------------------------------
create table public.contact_inquiries (
  id                uuid primary key default gen_random_uuid(),
  property_id       uuid references public.properties(id) on delete set null,
  name              text not null,
  email             text not null,
  phone             text,
  message           text not null,
  status            text not null default 'new',
  assigned_to_agent uuid references public.profiles(id) on delete set null,
  assigned_by       uuid references auth.users(id) on delete set null,
  assigned_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index contact_inquiries_property_idx on public.contact_inquiries (property_id);
create trigger contact_inquiries_set_updated_at before update on public.contact_inquiries
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- scheduled_visits  (sin organization_id)
-- ----------------------------------------------------------------------------
create table public.scheduled_visits (
  id             uuid primary key default gen_random_uuid(),
  property_id    uuid not null references public.properties(id) on delete cascade,
  agent_id       uuid references public.profiles(id) on delete set null,
  name           text not null,
  email          text not null,
  phone          text not null,
  preferred_date date not null,
  preferred_time text not null,
  message        text,
  status         text not null default 'pending',
  assigned_by    uuid references auth.users(id) on delete set null,
  assigned_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index scheduled_visits_property_idx on public.scheduled_visits (property_id);
create trigger scheduled_visits_set_updated_at before update on public.scheduled_visits
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- agent_invitations  (sin organization_id)
-- ----------------------------------------------------------------------------
create table public.agent_invitations (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  token         text not null unique default encode(extensions.gen_random_bytes(24), 'hex'),
  display_name  text,
  phone         text,
  service_zones text[],
  expires_at    timestamptz not null default (now() + interval '7 days'),
  invited_by    uuid not null references auth.users(id) on delete cascade,
  invited_at    timestamptz default now(),
  accepted_by   uuid references auth.users(id) on delete set null,
  accepted_at   timestamptz
);
create index agent_invitations_email_idx on public.agent_invitations (email);

-- ----------------------------------------------------------------------------
-- user_favorites
-- ----------------------------------------------------------------------------
create table public.user_favorites (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, property_id)
);
create index user_favorites_user_idx on public.user_favorites (user_id);

-- ----------------------------------------------------------------------------
-- audit_logs
-- ----------------------------------------------------------------------------
create table public.audit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null,
  action     text not null,
  table_name text,
  record_id  uuid,
  changes    jsonb,
  created_at timestamptz not null default now()
);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- ----------------------------------------------------------------------------
-- rate_limit_events  (Phase 2.6 — rate-limit persistente para formularios
-- públicos; reemplaza el límite en memoria de las edge functions). Solo las edge
-- functions (service_role, que SALTA RLS) leen/escriben; RLS habilitado SIN
-- políticas = deny-all para anon/authenticated. Ver manual/0007_phase2_rate_limit.sql.
-- ----------------------------------------------------------------------------
create table public.rate_limit_events (
  id         bigint generated always as identity primary key,
  key        text not null,            -- p.ej. 'contact:<ip>' / 'visit:<ip>'
  created_at timestamptz not null default now()
);
create index rate_limit_events_key_created_idx
  on public.rate_limit_events (key, created_at desc);

-- ----------------------------------------------------------------------------
-- Índices de claves foráneas (Phase 2.2 — advisor `unindexed_foreign_keys`).
-- Aplicados vía supabase/manual/0003_phase2_fk_indexes.sql.
-- ----------------------------------------------------------------------------
create index if not exists agent_invitations_accepted_by_idx      on public.agent_invitations (accepted_by);
create index if not exists agent_invitations_invited_by_idx       on public.agent_invitations (invited_by);
create index if not exists contact_inquiries_assigned_by_idx      on public.contact_inquiries (assigned_by);
create index if not exists contact_inquiries_assigned_to_agent_idx on public.contact_inquiries (assigned_to_agent);
create index if not exists profiles_invited_by_idx                on public.profiles (invited_by);
create index if not exists properties_created_by_idx              on public.properties (created_by);
create index if not exists properties_is_translation_of_idx       on public.properties (is_translation_of);
create index if not exists scheduled_visits_agent_id_idx          on public.scheduled_visits (agent_id);
create index if not exists scheduled_visits_assigned_by_idx       on public.scheduled_visits (assigned_by);
create index if not exists user_favorites_property_id_idx         on public.user_favorites (property_id);

-- ----------------------------------------------------------------------------
-- FUNCIONES DE ROL (single-tenant; SECURITY DEFINER para usarse dentro de RLS).
-- Reemplazan a has_role(org), is_org_admin, get_user_org_id, can_manage_org.
-- ----------------------------------------------------------------------------
create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.role_assignments
    where user_id = _user_id and role = _role
  );
$$;

create or replace function public.is_superadmin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id, 'superadmin');
$$;

create or replace function public.is_admin(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id, 'admin') or public.has_role(_user_id, 'superadmin');
$$;

-- "staff" = puede gestionar listados / subir imágenes (agente, admin o superadmin).
-- Reemplaza el chequeo roto basado en agent_level.
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select public.has_role(_user_id, 'agent')
      or public.has_role(_user_id, 'admin')
      or public.has_role(_user_id, 'superadmin');
$$;

-- ----------------------------------------------------------------------------
-- RLS: habilitar en TODAS las tablas (deny-by-default). Las políticas de acceso
-- van en policies.sql. Sin políticas, solo el service_role accede.
-- ----------------------------------------------------------------------------
alter table public.profiles          enable row level security;
alter table public.role_assignments  enable row level security;
alter table public.properties        enable row level security;
alter table public.property_images   enable row level security;
alter table public.service_zones     enable row level security;
alter table public.site_settings     enable row level security;
alter table public.cms_pages         enable row level security;
alter table public.contact_inquiries enable row level security;
alter table public.scheduled_visits  enable row level security;
alter table public.agent_invitations enable row level security;
alter table public.user_favorites    enable row level security;
alter table public.audit_logs        enable row level security;
alter table public.rate_limit_events enable row level security;

-- ----------------------------------------------------------------------------
-- rls_auto_enable  (red de seguridad: activa RLS automáticamente en cualquier
-- tabla nueva de `public`). Event trigger en ddl_command_end. NO se invoca desde
-- ninguna policy y, al devolver event_trigger, NO es RPC-callable vía PostgREST;
-- por eso se le revoca EXECUTE (limpia los lints 0028/0029). Forma parte del
-- baseline limpio; el revoke se registró en manual/0002_advisor_security_hardening.sql.
-- ----------------------------------------------------------------------------
create or replace function public.rls_auto_enable()
returns event_trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  cmd record;
begin
  for cmd in
    select *
    from pg_event_trigger_ddl_commands()
    where command_tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      and object_type in ('table', 'partitioned table')
  loop
    if cmd.schema_name is not null and cmd.schema_name in ('public')
       and cmd.schema_name not in ('pg_catalog', 'information_schema')
       and cmd.schema_name not like 'pg_toast%' and cmd.schema_name not like 'pg_temp%' then
      begin
        execute format('alter table if exists %s enable row level security', cmd.object_identity);
        raise log 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      exception
        when others then
          raise log 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      end;
    else
      raise log 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
    end if;
  end loop;
end;
$$;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

drop event trigger if exists ensure_rls;
create event trigger ensure_rls on ddl_command_end
  when tag in ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  execute function public.rls_auto_enable();

-- =============================================================================
-- El resto del modelo de acceso vive en supabase/policies.sql:
--   * Políticas RLS por tabla + políticas de Storage.
--   * Bucket `property-images` (público-lectura, staff-escritura).
--   * RPC pública get_public_agents() + privacidad a nivel de columna en profiles.
-- Nota: el trigger handle_new_user en auth.users está ARRIBA (Phase 7.5) — crea
-- el profile server-side al alta y reemplaza el insert client-side de signUp.
-- =============================================================================
