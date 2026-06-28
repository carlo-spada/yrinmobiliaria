# Supabase — Source of Truth & Backend Change Runbook

> The app runs on its **own** Supabase project (`ticsgpyathxawsupcghj`). Schema, policies, and functions here are the source of truth and back a **live production database real users depend on**. Apply DB changes only with the owner's explicit OK.

## Source of truth (canonical)

| File | Role |
|---|---|
| `schema.sql` | Canonical single-tenant schema (tables, types, functions, triggers). |
| `policies.sql` | Canonical RLS + storage policies. |
| `manual/NNNN_*.sql` | Hand-applied, ordered hardening/patch scripts (applied via dashboard/MCP, **not** auto-migrations). |
| `functions/` | The 6 edge functions. `config.toml` sets `verify_jwt` per function. |
| `seed.sql` | Optional seed data. |

**`_legacy_migrations/` is dead Lovable history** — kept only for archaeology. It does **not** reflect the live DB and must never be applied. The live database was rebuilt from a clean baseline; `supabase migrations list` on the live project shows the `20260619…` clean baseline (4 migrations), not these 61 files. **Do not run `supabase db push`** against this tree.

## Live vs repo (as of 2026-06-28)

- Live baseline: 4 migrations (`clean_single_tenant_schema`, `rls_policies_role_based`, `storage_property_images_bucket`, `storage_drop_broad_read_policy`).
- **Phase 2 hardening aplicado** vía MCP (`manual/0003`–`0007`): índices de cobertura para FKs, RLS perf + consolidación (`(select …)` initplan + una sola política permisiva por acción), drop del índice no usado `profiles_directory_idx`, y la tabla `rate_limit_events`. Advisors de performance `auth_rls_initplan` / `multiple_permissive_policies` / `unindexed_foreign_keys` → **0**.
- RLS habilitado en todas las tablas públicas (incl. la nueva `rate_limit_events`, deny-all → solo service_role). Sin ruta de escalada de privilegios (solo `superadmin` otorga admin/superadmin). Los lints `0028/0029` (helpers SECURITY DEFINER) son **riesgo aceptado** documentado en `policies.sql` (revocar EXECUTE rompe RLS).

## How to apply a DB change (runbook)

1. **Propose first.** Open a PR that adds a new `manual/NNNN_description.sql` (next sequential number) and, if it changes the declared shape, updates `schema.sql`/`policies.sql` to match.
2. **Make it reversible where practical.** Include a commented `-- ROLLBACK:` section with the inverse statements.
3. **Get explicit owner approval** before touching the live project.
4. **Verify current live state** via the Supabase MCP / dashboard (`list_tables`, `get_advisors`, relevant `pg_policies`) before applying.
5. **Apply** via the Supabase dashboard SQL editor or the Supabase MCP `apply_migration` — one script at a time.
6. **Re-run advisors** (`get_advisors security` + `performance`) after the change; address new findings.
7. **Update `schema.sql`/`policies.sql`** in the same PR so the declared source of truth never drifts from live.
8. **Never** edit `_legacy_migrations/`.

## Numbering

`manual/` scripts are numbered sequentially: `0001_…`, `0002_…`. Current highest: `0007_phase2_rate_limit.sql` (Phase 2). Next change starts at `0008_`.

## Edge function `verify_jwt` matrix (`config.toml`)

| Function | verify_jwt | Auth model |
|---|---|---|
| `submit-contact` | false | public form |
| `submit-schedule-visit` | false | public form |
| `optimize-property-image` | true | + server-side staff role check |
| `upload-property-image` | false | does its own JWT + staff role check |
| `send-agent-invitation` | true | + server-side admin role check |
| `accept-agent-invitation` | false | authn = secret invitation token |
</content>
