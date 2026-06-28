-- =============================================================================
-- 0004 — Phase 2.1: RLS perf + correctness
-- =============================================================================
-- Cierra advisors `auth_rls_initplan` (28) y `multiple_permissive_policies` (40):
--   * Envuelve auth.*()/is_*() en (select …) → InitPlan (una vez por consulta).
--   * Fusiona políticas permisivas solapadas en una por (tabla, acción).
-- Semánticamente idéntico (permisivas = OR). Atómico: si algo falla, rollback,
-- sin ventana sin políticas. Reversible re-aplicando las definiciones previas.
-- Aplicar vía Supabase MCP (apply_migration). Espejo de supabase/policies.sql.
-- =============================================================================

-- ---- DROP de políticas previas -------------------------------------------------
drop policy if exists profiles_select_public            on public.profiles;
drop policy if exists profiles_select_own               on public.profiles;
drop policy if exists profiles_select_admin             on public.profiles;
drop policy if exists profiles_insert_own               on public.profiles;
drop policy if exists profiles_insert_admin             on public.profiles;
drop policy if exists profiles_update_own               on public.profiles;
drop policy if exists profiles_update_admin             on public.profiles;
drop policy if exists profiles_delete_admin             on public.profiles;

drop policy if exists role_assignments_select           on public.role_assignments;
drop policy if exists role_assignments_insert           on public.role_assignments;
drop policy if exists role_assignments_update           on public.role_assignments;
drop policy if exists role_assignments_delete           on public.role_assignments;

drop policy if exists properties_select_public          on public.properties;
drop policy if exists properties_select_staff           on public.properties;
drop policy if exists properties_insert_staff           on public.properties;
drop policy if exists properties_update_owner_admin     on public.properties;
drop policy if exists properties_delete_owner_admin     on public.properties;

drop policy if exists property_images_select_public     on public.property_images;
drop policy if exists property_images_write_owner_admin on public.property_images;

drop policy if exists service_zones_select_public       on public.service_zones;
drop policy if exists service_zones_all_admin           on public.service_zones;

drop policy if exists site_settings_select_public       on public.site_settings;
drop policy if exists site_settings_all_admin           on public.site_settings;

drop policy if exists cms_pages_select_public           on public.cms_pages;
drop policy if exists cms_pages_all_admin               on public.cms_pages;

drop policy if exists contact_inquiries_select          on public.contact_inquiries;
drop policy if exists contact_inquiries_update          on public.contact_inquiries;
drop policy if exists contact_inquiries_delete_admin    on public.contact_inquiries;

drop policy if exists scheduled_visits_select           on public.scheduled_visits;
drop policy if exists scheduled_visits_update           on public.scheduled_visits;
drop policy if exists scheduled_visits_delete_admin     on public.scheduled_visits;

drop policy if exists agent_invitations_all_admin       on public.agent_invitations;
drop policy if exists user_favorites_all_own            on public.user_favorites;
drop policy if exists audit_logs_select_admin           on public.audit_logs;

drop policy if exists property_images_insert_staff      on storage.objects;
drop policy if exists property_images_update_staff      on storage.objects;
drop policy if exists property_images_delete_staff      on storage.objects;

-- ---- profiles ------------------------------------------------------------------
create policy profiles_select on public.profiles for select
  using (
    (show_in_directory and is_active)
    or (select auth.uid()) = user_id
    or (select public.is_admin(auth.uid()))
  );
create policy profiles_insert on public.profiles for insert
  with check (
    (select auth.uid()) = user_id
    or (select public.is_admin(auth.uid()))
  );
create policy profiles_update on public.profiles for update
  using (
    (select auth.uid()) = user_id
    or (select public.is_admin(auth.uid()))
  )
  with check (
    (select auth.uid()) = user_id
    or (select public.is_admin(auth.uid()))
  );
create policy profiles_delete_admin on public.profiles for delete
  using ((select public.is_admin(auth.uid())));

-- ---- role_assignments ----------------------------------------------------------
create policy role_assignments_select on public.role_assignments for select
  using ((select auth.uid()) = user_id or (select public.is_admin(auth.uid())));
create policy role_assignments_insert on public.role_assignments for insert
  with check ((select public.is_superadmin(auth.uid()))
              or ((select public.is_admin(auth.uid())) and role in ('agent','user')));
create policy role_assignments_update on public.role_assignments for update
  using ((select public.is_superadmin(auth.uid()))
         or ((select public.is_admin(auth.uid())) and role in ('agent','user')))
  with check ((select public.is_superadmin(auth.uid()))
              or ((select public.is_admin(auth.uid())) and role in ('agent','user')));
create policy role_assignments_delete on public.role_assignments for delete
  using ((select public.is_superadmin(auth.uid()))
         or ((select public.is_admin(auth.uid())) and role in ('agent','user')));

-- ---- properties ----------------------------------------------------------------
create policy properties_select on public.properties for select
  using (status <> 'pendiente' or (select public.is_staff(auth.uid())));
create policy properties_insert_staff on public.properties for insert
  with check ((select public.is_staff(auth.uid())));
create policy properties_update_owner_admin on public.properties for update
  using ((select public.is_admin(auth.uid())) or agent_id in (select public.current_profile_ids()))
  with check ((select public.is_admin(auth.uid())) or agent_id in (select public.current_profile_ids()));
create policy properties_delete_owner_admin on public.properties for delete
  using ((select public.is_admin(auth.uid())) or agent_id in (select public.current_profile_ids()));

-- ---- property_images -----------------------------------------------------------
create policy property_images_select_public on public.property_images for select
  using (true);
create policy property_images_insert_owner_admin on public.property_images for insert
  with check (exists (select 1 from public.properties p where p.id = property_id
              and ((select public.is_admin(auth.uid())) or p.agent_id in (select public.current_profile_ids()))));
create policy property_images_update_owner_admin on public.property_images for update
  using (exists (select 1 from public.properties p where p.id = property_id
         and ((select public.is_admin(auth.uid())) or p.agent_id in (select public.current_profile_ids()))))
  with check (exists (select 1 from public.properties p where p.id = property_id
         and ((select public.is_admin(auth.uid())) or p.agent_id in (select public.current_profile_ids()))));
create policy property_images_delete_owner_admin on public.property_images for delete
  using (exists (select 1 from public.properties p where p.id = property_id
         and ((select public.is_admin(auth.uid())) or p.agent_id in (select public.current_profile_ids()))));

-- ---- service_zones -------------------------------------------------------------
create policy service_zones_select on public.service_zones for select
  using (active or (select public.is_admin(auth.uid())));
create policy service_zones_admin_insert on public.service_zones for insert
  with check ((select public.is_admin(auth.uid())));
create policy service_zones_admin_update on public.service_zones for update
  using ((select public.is_admin(auth.uid()))) with check ((select public.is_admin(auth.uid())));
create policy service_zones_admin_delete on public.service_zones for delete
  using ((select public.is_admin(auth.uid())));

-- ---- site_settings -------------------------------------------------------------
create policy site_settings_select_public on public.site_settings for select
  using (true);
create policy site_settings_admin_insert on public.site_settings for insert
  with check ((select public.is_admin(auth.uid())));
create policy site_settings_admin_update on public.site_settings for update
  using ((select public.is_admin(auth.uid()))) with check ((select public.is_admin(auth.uid())));
create policy site_settings_admin_delete on public.site_settings for delete
  using ((select public.is_admin(auth.uid())));

-- ---- cms_pages -----------------------------------------------------------------
create policy cms_pages_select on public.cms_pages for select
  using (is_published or (select public.is_admin(auth.uid())));
create policy cms_pages_admin_insert on public.cms_pages for insert
  with check ((select public.is_admin(auth.uid())));
create policy cms_pages_admin_update on public.cms_pages for update
  using ((select public.is_admin(auth.uid()))) with check ((select public.is_admin(auth.uid())));
create policy cms_pages_admin_delete on public.cms_pages for delete
  using ((select public.is_admin(auth.uid())));

-- ---- contact_inquiries ---------------------------------------------------------
create policy contact_inquiries_select on public.contact_inquiries for select
  using ((select public.is_admin(auth.uid())) or assigned_to_agent in (select public.current_profile_ids()));
create policy contact_inquiries_update on public.contact_inquiries for update
  using ((select public.is_admin(auth.uid())) or assigned_to_agent in (select public.current_profile_ids()))
  with check ((select public.is_admin(auth.uid())) or assigned_to_agent in (select public.current_profile_ids()));
create policy contact_inquiries_delete_admin on public.contact_inquiries for delete
  using ((select public.is_admin(auth.uid())));

-- ---- scheduled_visits ----------------------------------------------------------
create policy scheduled_visits_select on public.scheduled_visits for select
  using ((select public.is_admin(auth.uid())) or agent_id in (select public.current_profile_ids()));
create policy scheduled_visits_update on public.scheduled_visits for update
  using ((select public.is_admin(auth.uid())) or agent_id in (select public.current_profile_ids()))
  with check ((select public.is_admin(auth.uid())) or agent_id in (select public.current_profile_ids()));
create policy scheduled_visits_delete_admin on public.scheduled_visits for delete
  using ((select public.is_admin(auth.uid())));

-- ---- agent_invitations / user_favorites / audit_logs ---------------------------
create policy agent_invitations_all_admin on public.agent_invitations for all
  using ((select public.is_admin(auth.uid()))) with check ((select public.is_admin(auth.uid())));
create policy user_favorites_all_own on public.user_favorites for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy audit_logs_select_admin on public.audit_logs for select
  using ((select public.is_admin(auth.uid())));

-- ---- storage.objects (bucket property-images) ----------------------------------
create policy property_images_insert_staff on storage.objects for insert
  with check (bucket_id = 'property-images' and (select public.is_staff(auth.uid())));
create policy property_images_update_staff on storage.objects for update
  using (bucket_id = 'property-images' and (select public.is_staff(auth.uid())))
  with check (bucket_id = 'property-images' and (select public.is_staff(auth.uid())));
create policy property_images_delete_staff on storage.objects for delete
  using (bucket_id = 'property-images' and (select public.is_staff(auth.uid())));
