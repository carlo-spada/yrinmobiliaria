-- 0008_handle_new_user_trigger.sql
-- Phase 7.5 — Crea el perfil del usuario mediante un trigger de DB
-- (server-side y atómico) en lugar del insert client-side tras `signUp`.
--
-- Motivación: el insert client-side (`AuthContext.signUp` → `from('profiles')
-- .insert(...)`) podía dejar un usuario de `auth.users` SIN fila en `profiles`
-- si el cliente fallaba a mitad, y fallaba por RLS cuando hay confirmación de
-- email activada (no hay sesión todavía, así que el insert no pasa las
-- políticas). El trigger corre como `security definer` (dueño de la tabla),
-- así que no depende de la sesión ni de RLS, y es atómico con el alta.
--
-- Comportamiento preservado: mismas columnas que ponía el cliente
-- (user_id, email, display_name = prefijo del email, is_complete = true).
-- `on conflict (user_id) do nothing` hace inocua la ventana de despliegue en la
-- que el cliente viejo (que aún inserta) coexista con este trigger.
-- Sin manejador de excepciones: si el perfil no se puede crear, el alta se
-- revierte (mejor que crear un usuario huérfano).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, email, display_name, is_complete)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 1),
    true
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- El trigger es la única vía de invocación legítima; no debe ser RPC-callable.
-- (A diferencia de los helpers de RLS de la Fase 2.7, esta función NO la invoca
-- ninguna política, así que revocar EXECUTE es seguro y no rompe RLS.)
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ROLLBACK:
-- drop trigger if exists on_auth_user_created on auth.users;
-- drop function if exists public.handle_new_user();
