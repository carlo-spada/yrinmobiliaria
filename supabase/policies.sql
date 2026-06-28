-- =============================================================================
-- YR Inmobiliaria — RLS, Storage y hardening (single-tenant, basado en ROLES)
-- Aplica DESPUÉS de schema.sql.
-- =============================================================================
-- Modelo: roles en `role_assignments` (user/agent/admin/superadmin). Helpers
-- is_staff/is_admin/is_superadmin (definidos en schema.sql). Los formularios
-- públicos (contacto, agendar) entran por edge functions con service_role, que
-- saltan RLS — por eso no llevan política de INSERT para anon.
--
-- Phase 2.1 (perf + correctness):
--   * Cada llamada a auth.*()/is_*() va envuelta en `(select …)` para que se
--     evalúe UNA vez por consulta (InitPlan) y no por fila — cierra el lint
--     `auth_rls_initplan`. Es semánticamente idéntico.
--   * Una sola política permisiva por (tabla, acción): las políticas permisivas
--     se combinan con OR, así que fusionar varias en una con OR es idéntico en
--     acceso y cierra `multiple_permissive_policies`. Las políticas de admin que
--     eran `FOR ALL` (y solapaban SELECT) se separan en INSERT/UPDATE/DELETE y su
--     acceso de lectura se pliega en la política SELECT consolidada.
--
-- Nota lints: los WARN 0028/0029 sobre los helpers SECURITY DEFINER se tratan en
-- 0005 (revoke EXECUTE a anon/authenticated).
-- =============================================================================

-- Fija search_path en el trigger de updated_at (lint 0011).
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Helper: ids de perfil del usuario actual (dueño-de-propiedad), para RLS.
create or replace function public.current_profile_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select id from public.profiles where user_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- profiles  (SELECT: directorio público OR propio OR admin · una sola política)
-- ---------------------------------------------------------------------------
create policy profiles_select on public.profiles for select
  using (
    (show_in_directory and is_active)
    or (select auth.uid()) = user_id
    or (select public.is_admin((select auth.uid())))
  );
create policy profiles_insert on public.profiles for insert
  with check (
    (select auth.uid()) = user_id
    or (select public.is_admin((select auth.uid())))
  );
create policy profiles_update on public.profiles for update
  using (
    (select auth.uid()) = user_id
    or (select public.is_admin((select auth.uid())))
  )
  with check (
    (select auth.uid()) = user_id
    or (select public.is_admin((select auth.uid())))
  );
create policy profiles_delete_admin on public.profiles for delete
  using ((select public.is_admin((select auth.uid()))));

-- ---------------------------------------------------------------------------
-- role_assignments  (superadmin gestiona todo; admin gestiona agent/user)
-- ---------------------------------------------------------------------------
create policy role_assignments_select on public.role_assignments for select
  using ((select auth.uid()) = user_id or (select public.is_admin((select auth.uid()))));
create policy role_assignments_insert on public.role_assignments for insert
  with check ((select public.is_superadmin((select auth.uid())))
              or ((select public.is_admin((select auth.uid()))) and role in ('agent','user')));
create policy role_assignments_update on public.role_assignments for update
  using ((select public.is_superadmin((select auth.uid())))
         or ((select public.is_admin((select auth.uid()))) and role in ('agent','user')))
  with check ((select public.is_superadmin((select auth.uid())))
              or ((select public.is_admin((select auth.uid()))) and role in ('agent','user')));
create policy role_assignments_delete on public.role_assignments for delete
  using ((select public.is_superadmin((select auth.uid())))
         or ((select public.is_admin((select auth.uid()))) and role in ('agent','user')));

-- ---------------------------------------------------------------------------
-- properties  (SELECT: público no-pendiente OR staff · una sola política)
-- ---------------------------------------------------------------------------
create policy properties_select on public.properties for select
  using (status <> 'pendiente' or (select public.is_staff((select auth.uid()))));
create policy properties_insert_staff on public.properties for insert
  with check ((select public.is_staff((select auth.uid()))));
create policy properties_update_owner_admin on public.properties for update
  using ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()))
  with check ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()));
create policy properties_delete_owner_admin on public.properties for delete
  using ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()));

-- ---------------------------------------------------------------------------
-- property_images  (público lee; dueño/admin escribe — write separado en
-- INSERT/UPDATE/DELETE para no solapar SELECT)
-- ---------------------------------------------------------------------------
create policy property_images_select_public on public.property_images for select
  using (true);
create policy property_images_insert_owner_admin on public.property_images for insert
  with check (exists (select 1 from public.properties p where p.id = property_id
              and ((select public.is_admin((select auth.uid()))) or p.agent_id in (select public.current_profile_ids()))));
create policy property_images_update_owner_admin on public.property_images for update
  using (exists (select 1 from public.properties p where p.id = property_id
         and ((select public.is_admin((select auth.uid()))) or p.agent_id in (select public.current_profile_ids()))))
  with check (exists (select 1 from public.properties p where p.id = property_id
         and ((select public.is_admin((select auth.uid()))) or p.agent_id in (select public.current_profile_ids()))));
create policy property_images_delete_owner_admin on public.property_images for delete
  using (exists (select 1 from public.properties p where p.id = property_id
         and ((select public.is_admin((select auth.uid()))) or p.agent_id in (select public.current_profile_ids()))));

-- ---------------------------------------------------------------------------
-- service_zones  (SELECT: activas OR admin · admin escribe por I/U/D)
-- ---------------------------------------------------------------------------
create policy service_zones_select on public.service_zones for select
  using (active or (select public.is_admin((select auth.uid()))));
create policy service_zones_admin_insert on public.service_zones for insert
  with check ((select public.is_admin((select auth.uid()))));
create policy service_zones_admin_update on public.service_zones for update
  using ((select public.is_admin((select auth.uid())))) with check ((select public.is_admin((select auth.uid()))));
create policy service_zones_admin_delete on public.service_zones for delete
  using ((select public.is_admin((select auth.uid()))));

-- ---------------------------------------------------------------------------
-- site_settings  (lectura pública; admin escribe por I/U/D)
-- ---------------------------------------------------------------------------
create policy site_settings_select_public on public.site_settings for select
  using (true);
create policy site_settings_admin_insert on public.site_settings for insert
  with check ((select public.is_admin((select auth.uid()))));
create policy site_settings_admin_update on public.site_settings for update
  using ((select public.is_admin((select auth.uid())))) with check ((select public.is_admin((select auth.uid()))));
create policy site_settings_admin_delete on public.site_settings for delete
  using ((select public.is_admin((select auth.uid()))));

-- ---------------------------------------------------------------------------
-- cms_pages  (SELECT: publicadas OR admin · admin escribe por I/U/D)
-- ---------------------------------------------------------------------------
create policy cms_pages_select on public.cms_pages for select
  using (is_published or (select public.is_admin((select auth.uid()))));
create policy cms_pages_admin_insert on public.cms_pages for insert
  with check ((select public.is_admin((select auth.uid()))));
create policy cms_pages_admin_update on public.cms_pages for update
  using ((select public.is_admin((select auth.uid())))) with check ((select public.is_admin((select auth.uid()))));
create policy cms_pages_admin_delete on public.cms_pages for delete
  using ((select public.is_admin((select auth.uid()))));

-- ---------------------------------------------------------------------------
-- contact_inquiries  (alta vía edge function service_role; lectura admin/agente)
-- ---------------------------------------------------------------------------
create policy contact_inquiries_select on public.contact_inquiries for select
  using ((select public.is_admin((select auth.uid()))) or assigned_to_agent in (select public.current_profile_ids()));
create policy contact_inquiries_update on public.contact_inquiries for update
  using ((select public.is_admin((select auth.uid()))) or assigned_to_agent in (select public.current_profile_ids()))
  with check ((select public.is_admin((select auth.uid()))) or assigned_to_agent in (select public.current_profile_ids()));
create policy contact_inquiries_delete_admin on public.contact_inquiries for delete
  using ((select public.is_admin((select auth.uid()))));

-- ---------------------------------------------------------------------------
-- scheduled_visits  (igual patrón que contact_inquiries)
-- ---------------------------------------------------------------------------
create policy scheduled_visits_select on public.scheduled_visits for select
  using ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()));
create policy scheduled_visits_update on public.scheduled_visits for update
  using ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()))
  with check ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()));
create policy scheduled_visits_delete_admin on public.scheduled_visits for delete
  using ((select public.is_admin((select auth.uid()))));

-- ---------------------------------------------------------------------------
-- agent_invitations  (solo admin; el alta/lectura por token en la aceptación la
-- resuelve la edge function accept-agent-invitation con service_role)
-- ---------------------------------------------------------------------------
create policy agent_invitations_all_admin on public.agent_invitations for all
  using ((select public.is_admin((select auth.uid())))) with check ((select public.is_admin((select auth.uid()))));

-- ---------------------------------------------------------------------------
-- user_favorites  (cada quien los suyos)
-- ---------------------------------------------------------------------------
create policy user_favorites_all_own on public.user_favorites for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- audit_logs  (lectura admin; escritura solo definer/service_role)
-- ---------------------------------------------------------------------------
create policy audit_logs_select_admin on public.audit_logs for select
  using ((select public.is_admin((select auth.uid()))));

-- =============================================================================
-- STORAGE: bucket property-images (lectura pública; escritura por rol staff).
-- SIN carpeta temp/ ni cron de limpieza → elimina el mecanismo del Bug 2.
-- Las rutas permanentes serán {propertyId}/... y profiles/{userId}/...
-- =============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('property-images', 'property-images', true, 10485760,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- (Sin política SELECT amplia: el bucket es público y sirve objetos por URL sin
--  RLS; una SELECT abierta permitiría LISTAR todo el bucket — lint 0025. Si el
--  admin necesitara listar, agregar una política SELECT acotada a is_staff.)
create policy property_images_insert_staff on storage.objects for insert
  with check (bucket_id = 'property-images' and (select public.is_staff((select auth.uid()))));
create policy property_images_update_staff on storage.objects for update
  using (bucket_id = 'property-images' and (select public.is_staff((select auth.uid()))))
  with check (bucket_id = 'property-images' and (select public.is_staff((select auth.uid()))));
create policy property_images_delete_staff on storage.objects for delete
  using (bucket_id = 'property-images' and (select public.is_staff((select auth.uid()))));
