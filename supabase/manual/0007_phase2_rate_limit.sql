-- =============================================================================
-- 0007 — Phase 2.6: rate-limit persistente para formularios públicos
-- =============================================================================
-- Reemplaza el rate-limit EN MEMORIA de las edge functions (se reinicia en cada
-- cold start y no comparte estado entre instancias) por uno persistente en DB.
-- Solo las edge functions (service_role, que SALTA RLS) leen/escriben aquí; RLS
-- habilitado SIN políticas = deny-all para anon/authenticated.
-- Aplicar vía Supabase MCP (apply_migration).
-- =============================================================================

create table if not exists public.rate_limit_events (
  id         bigint generated always as identity primary key,
  key        text not null,           -- p.ej. 'contact:<ip>' / 'visit:<ip>'
  created_at timestamptz not null default now()
);

-- Índice para contar eventos por clave dentro de la ventana de tiempo.
create index if not exists rate_limit_events_key_created_idx
  on public.rate_limit_events (key, created_at desc);

-- Deny-all: sin políticas, ningún rol cliente accede; service_role salta RLS.
alter table public.rate_limit_events enable row level security;
