-- =============================================================================
-- 0005 — Phase 2.1 (fix): forma canónica del wrap de auth en RLS
-- =============================================================================
-- 0004 dejó los helpers como `(select is_X(auth.uid()))`. El linter 0003 exige
-- que la llamada a auth.* esté envuelta EN SÍ MISMA: `(select auth.uid())`. Forma
-- final: `(select public.is_X((select auth.uid())))` — auth.uid() init-planeado
-- (limpia el lint) y el helper también init-planeado (corre una vez por consulta).
-- ALTER POLICY (no-destructivo). Semánticamente idéntico. Espejo de policies.sql.
-- =============================================================================

-- profiles
alter policy profiles_select on public.profiles
  using ((show_in_directory and is_active)
         or (select auth.uid()) = user_id
         or (select public.is_admin((select auth.uid()))));
alter policy profiles_insert on public.profiles
  with check ((select auth.uid()) = user_id
              or (select public.is_admin((select auth.uid()))));
alter policy profiles_update on public.profiles
  using ((select auth.uid()) = user_id
         or (select public.is_admin((select auth.uid()))))
  with check ((select auth.uid()) = user_id
              or (select public.is_admin((select auth.uid()))));
alter policy profiles_delete_admin on public.profiles
  using ((select public.is_admin((select auth.uid()))));

-- role_assignments
alter policy role_assignments_select on public.role_assignments
  using ((select auth.uid()) = user_id or (select public.is_admin((select auth.uid()))));
alter policy role_assignments_insert on public.role_assignments
  with check ((select public.is_superadmin((select auth.uid())))
              or ((select public.is_admin((select auth.uid()))) and role in ('agent','user')));
alter policy role_assignments_update on public.role_assignments
  using ((select public.is_superadmin((select auth.uid())))
         or ((select public.is_admin((select auth.uid()))) and role in ('agent','user')))
  with check ((select public.is_superadmin((select auth.uid())))
              or ((select public.is_admin((select auth.uid()))) and role in ('agent','user')));
alter policy role_assignments_delete on public.role_assignments
  using ((select public.is_superadmin((select auth.uid())))
         or ((select public.is_admin((select auth.uid()))) and role in ('agent','user')));

-- properties
alter policy properties_select on public.properties
  using (status <> 'pendiente' or (select public.is_staff((select auth.uid()))));
alter policy properties_insert_staff on public.properties
  with check ((select public.is_staff((select auth.uid()))));
alter policy properties_update_owner_admin on public.properties
  using ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()))
  with check ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()));
alter policy properties_delete_owner_admin on public.properties
  using ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()));

-- property_images
alter policy property_images_insert_owner_admin on public.property_images
  with check (exists (select 1 from public.properties p where p.id = property_id
              and ((select public.is_admin((select auth.uid()))) or p.agent_id in (select public.current_profile_ids()))));
alter policy property_images_update_owner_admin on public.property_images
  using (exists (select 1 from public.properties p where p.id = property_id
         and ((select public.is_admin((select auth.uid()))) or p.agent_id in (select public.current_profile_ids()))))
  with check (exists (select 1 from public.properties p where p.id = property_id
         and ((select public.is_admin((select auth.uid()))) or p.agent_id in (select public.current_profile_ids()))));
alter policy property_images_delete_owner_admin on public.property_images
  using (exists (select 1 from public.properties p where p.id = property_id
         and ((select public.is_admin((select auth.uid()))) or p.agent_id in (select public.current_profile_ids()))));

-- service_zones
alter policy service_zones_select on public.service_zones
  using (active or (select public.is_admin((select auth.uid()))));
alter policy service_zones_admin_insert on public.service_zones
  with check ((select public.is_admin((select auth.uid()))));
alter policy service_zones_admin_update on public.service_zones
  using ((select public.is_admin((select auth.uid())))) with check ((select public.is_admin((select auth.uid()))));
alter policy service_zones_admin_delete on public.service_zones
  using ((select public.is_admin((select auth.uid()))));

-- site_settings
alter policy site_settings_admin_insert on public.site_settings
  with check ((select public.is_admin((select auth.uid()))));
alter policy site_settings_admin_update on public.site_settings
  using ((select public.is_admin((select auth.uid())))) with check ((select public.is_admin((select auth.uid()))));
alter policy site_settings_admin_delete on public.site_settings
  using ((select public.is_admin((select auth.uid()))));

-- cms_pages
alter policy cms_pages_select on public.cms_pages
  using (is_published or (select public.is_admin((select auth.uid()))));
alter policy cms_pages_admin_insert on public.cms_pages
  with check ((select public.is_admin((select auth.uid()))));
alter policy cms_pages_admin_update on public.cms_pages
  using ((select public.is_admin((select auth.uid())))) with check ((select public.is_admin((select auth.uid()))));
alter policy cms_pages_admin_delete on public.cms_pages
  using ((select public.is_admin((select auth.uid()))));

-- contact_inquiries
alter policy contact_inquiries_select on public.contact_inquiries
  using ((select public.is_admin((select auth.uid()))) or assigned_to_agent in (select public.current_profile_ids()));
alter policy contact_inquiries_update on public.contact_inquiries
  using ((select public.is_admin((select auth.uid()))) or assigned_to_agent in (select public.current_profile_ids()))
  with check ((select public.is_admin((select auth.uid()))) or assigned_to_agent in (select public.current_profile_ids()));
alter policy contact_inquiries_delete_admin on public.contact_inquiries
  using ((select public.is_admin((select auth.uid()))));

-- scheduled_visits
alter policy scheduled_visits_select on public.scheduled_visits
  using ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()));
alter policy scheduled_visits_update on public.scheduled_visits
  using ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()))
  with check ((select public.is_admin((select auth.uid()))) or agent_id in (select public.current_profile_ids()));
alter policy scheduled_visits_delete_admin on public.scheduled_visits
  using ((select public.is_admin((select auth.uid()))));

-- agent_invitations / audit_logs
alter policy agent_invitations_all_admin on public.agent_invitations
  using ((select public.is_admin((select auth.uid())))) with check ((select public.is_admin((select auth.uid()))));
alter policy audit_logs_select_admin on public.audit_logs
  using ((select public.is_admin((select auth.uid()))));

-- storage.objects (bucket property-images)
alter policy property_images_insert_staff on storage.objects
  with check (bucket_id = 'property-images' and (select public.is_staff((select auth.uid()))));
alter policy property_images_update_staff on storage.objects
  using (bucket_id = 'property-images' and (select public.is_staff((select auth.uid()))))
  with check (bucket_id = 'property-images' and (select public.is_staff((select auth.uid()))));
alter policy property_images_delete_staff on storage.objects
  using (bucket_id = 'property-images' and (select public.is_staff((select auth.uid()))));
