-- =============================================================================
-- YR Inmobiliaria — RLS, Storage y hardening (single-tenant, basado en ROLES)
-- Aplica DESPUÉS de schema.sql.
-- =============================================================================
-- Modelo: roles en `role_assignments` (user/agent/admin/superadmin). Helpers
-- is_staff/is_admin/is_superadmin (definidos en schema.sql). Los formularios
-- públicos (contacto, agendar) entran por edge functions con service_role, que
-- saltan RLS — por eso no llevan política de INSERT para anon.
-- Nota lints: los WARN 0028/0029 sobre los helpers SECURITY DEFINER son el patrón
-- estándar de RLS y se aceptan (deny-safe; exposición mínima).
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
-- profiles
-- ---------------------------------------------------------------------------
create policy profiles_select_public on public.profiles for select
  using (show_in_directory and is_active);
create policy profiles_select_own on public.profiles for select
  using (auth.uid() = user_id);
create policy profiles_select_admin on public.profiles for select
  using (public.is_admin(auth.uid()));
create policy profiles_insert_own on public.profiles for insert
  with check (auth.uid() = user_id);
create policy profiles_insert_admin on public.profiles for insert
  with check (public.is_admin(auth.uid()));
create policy profiles_update_own on public.profiles for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy profiles_update_admin on public.profiles for update
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy profiles_delete_admin on public.profiles for delete
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- role_assignments  (superadmin gestiona todo; admin gestiona agent/user)
-- ---------------------------------------------------------------------------
create policy role_assignments_select on public.role_assignments for select
  using (auth.uid() = user_id or public.is_admin(auth.uid()));
create policy role_assignments_insert on public.role_assignments for insert
  with check (public.is_superadmin(auth.uid())
              or (public.is_admin(auth.uid()) and role in ('agent','user')));
create policy role_assignments_update on public.role_assignments for update
  using (public.is_superadmin(auth.uid())
         or (public.is_admin(auth.uid()) and role in ('agent','user')))
  with check (public.is_superadmin(auth.uid())
              or (public.is_admin(auth.uid()) and role in ('agent','user')));
create policy role_assignments_delete on public.role_assignments for delete
  using (public.is_superadmin(auth.uid())
         or (public.is_admin(auth.uid()) and role in ('agent','user')));

-- ---------------------------------------------------------------------------
-- properties  (público ve no-borradores; staff dueño/admin gestiona)
-- ---------------------------------------------------------------------------
create policy properties_select_public on public.properties for select
  using (status <> 'pendiente');
create policy properties_select_staff on public.properties for select
  using (public.is_staff(auth.uid()));
create policy properties_insert_staff on public.properties for insert
  with check (public.is_staff(auth.uid()));
create policy properties_update_owner_admin on public.properties for update
  using (public.is_admin(auth.uid()) or agent_id in (select public.current_profile_ids()))
  with check (public.is_admin(auth.uid()) or agent_id in (select public.current_profile_ids()));
create policy properties_delete_owner_admin on public.properties for delete
  using (public.is_admin(auth.uid()) or agent_id in (select public.current_profile_ids()));

-- ---------------------------------------------------------------------------
-- property_images  (público lee; staff dueño/admin escribe → corrige Bug 1)
-- ---------------------------------------------------------------------------
create policy property_images_select_public on public.property_images for select
  using (true);
create policy property_images_write_owner_admin on public.property_images for all
  using (exists (select 1 from public.properties p where p.id = property_id
                 and (public.is_admin(auth.uid()) or p.agent_id in (select public.current_profile_ids()))))
  with check (exists (select 1 from public.properties p where p.id = property_id
                 and (public.is_admin(auth.uid()) or p.agent_id in (select public.current_profile_ids()))));

-- ---------------------------------------------------------------------------
-- service_zones  (público ve activas; admin gestiona)
-- ---------------------------------------------------------------------------
create policy service_zones_select_public on public.service_zones for select
  using (active);
create policy service_zones_all_admin on public.service_zones for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- site_settings  (lectura pública; escritura admin)
-- ---------------------------------------------------------------------------
create policy site_settings_select_public on public.site_settings for select
  using (true);
create policy site_settings_all_admin on public.site_settings for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- cms_pages  (público ve publicadas; admin gestiona)
-- ---------------------------------------------------------------------------
create policy cms_pages_select_public on public.cms_pages for select
  using (is_published);
create policy cms_pages_all_admin on public.cms_pages for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- contact_inquiries  (alta vía edge function service_role; lectura admin/agente)
-- ---------------------------------------------------------------------------
create policy contact_inquiries_select on public.contact_inquiries for select
  using (public.is_admin(auth.uid()) or assigned_to_agent in (select public.current_profile_ids()));
create policy contact_inquiries_update on public.contact_inquiries for update
  using (public.is_admin(auth.uid()) or assigned_to_agent in (select public.current_profile_ids()))
  with check (public.is_admin(auth.uid()) or assigned_to_agent in (select public.current_profile_ids()));
create policy contact_inquiries_delete_admin on public.contact_inquiries for delete
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- scheduled_visits  (igual patrón que contact_inquiries)
-- ---------------------------------------------------------------------------
create policy scheduled_visits_select on public.scheduled_visits for select
  using (public.is_admin(auth.uid()) or agent_id in (select public.current_profile_ids()));
create policy scheduled_visits_update on public.scheduled_visits for update
  using (public.is_admin(auth.uid()) or agent_id in (select public.current_profile_ids()))
  with check (public.is_admin(auth.uid()) or agent_id in (select public.current_profile_ids()));
create policy scheduled_visits_delete_admin on public.scheduled_visits for delete
  using (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- agent_invitations  (solo admin; el alta/lectura por token en la aceptación
-- se resolverá con una RPC SECURITY DEFINER en PR1b)
-- ---------------------------------------------------------------------------
create policy agent_invitations_all_admin on public.agent_invitations for all
  using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- ---------------------------------------------------------------------------
-- user_favorites  (cada quien los suyos)
-- ---------------------------------------------------------------------------
create policy user_favorites_all_own on public.user_favorites for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- audit_logs  (lectura admin; escritura solo definer/service_role)
-- ---------------------------------------------------------------------------
create policy audit_logs_select_admin on public.audit_logs for select
  using (public.is_admin(auth.uid()));

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
  with check (bucket_id = 'property-images' and public.is_staff(auth.uid()));
create policy property_images_update_staff on storage.objects for update
  using (bucket_id = 'property-images' and public.is_staff(auth.uid()))
  with check (bucket_id = 'property-images' and public.is_staff(auth.uid()));
create policy property_images_delete_staff on storage.objects for delete
  using (bucket_id = 'property-images' and public.is_staff(auth.uid()));
