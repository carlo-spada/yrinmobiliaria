# Supabase — Source of Truth & Backend Change Runbook

> The app runs on its **own** Supabase project (`ticsgpyathxawsupcghj`). Schema, policies, and functions here are the source of truth and back a **live production database real users depend on**. Apply DB changes only with the owner's explicit OK.

## Source of truth (canonical)

| File | Role |
|---|---|
| `schema.sql` | Canonical single-tenant schema: tables, types, indexes, functions, triggers, the `rls_auto_enable` event trigger, and RLS-enable flags. |
| `policies.sql` | Canonical RLS policies, column-level grants, the public `get_public_agents()` RPC, and Storage (bucket + policies). |
| `manual/NNNN_*.sql` | Hand-applied, ordered patch scripts — the **immutable history** of what was applied to live (not auto-migrations). |
| `functions/` | The 6 edge functions. `config.toml` sets `verify_jwt` per function. |
| `seed.sql` | Optional seed data. |

**`schema.sql` + `policies.sql` are a _verified baseline_:** together they fully reconstruct the live `public` schema. Verified 1:1 against live on **2026-06-28** (Phase 3) — every table/column/default, PK/FK/unique, index, enum, function, trigger, event trigger, RLS-enable flag, the `profiles` column-privacy grants, and the Storage bucket match. They already incorporate every `manual/0001–0008` patch.

**`_legacy_migrations/` is dead Lovable history** — kept only for archaeology. It does **not** reflect the live DB and must never be applied. **Do not run `supabase db push`** against this tree.

## Tooling decision (Phase 3.2) — declarative baseline, NOT CLI auto-migrations

**Decision:** stay **declarative**. `schema.sql` + `policies.sql` are the canonical current state; `manual/NNNN_*.sql` is the ordered, immutable ledger of patches applied to live. We do **not** adopt the Supabase CLI migration flow (`supabase migration new` / `supabase db push`) as the apply mechanism.

**Why:**
- The DB is small, single-tenant, and already clean; a declarative pair of files is easy to read top-to-bottom and to diff against live.
- Changes are applied deliberately — one reviewed script at a time, with owner approval and advisor re-checks — not by an automated push. `db push` against a live prod DB with real users is exactly the foot-gun we avoid.
- The stale `_legacy_migrations/` tree would confuse the CLI; we never want a push to target this project from this repo state.

**Forward process:** new change → add `manual/NNNN` (next number), apply via dashboard/MCP **with approval**, then fold the change into `schema.sql`/`policies.sql` in the **same PR** so the declared baseline never drifts. See the runbook below.

## Live migration ledger ↔ repo mapping

The live project's migration ledger (`supabase migrations list`) has **10** entries. Mapping to the repo:

| Live version | Name | Repo source |
|---|---|---|
| 20260619224411 | clean_single_tenant_schema | `schema.sql` (baseline) |
| 20260619224933 | rls_policies_role_based | `policies.sql` (baseline) |
| 20260619224945 | storage_property_images_bucket | `policies.sql` (storage) |
| 20260619225105 | storage_drop_broad_read_policy | `policies.sql` (storage) |
| 20260628031656 | phase2_fk_covering_indexes | `manual/0003` |
| 20260628033010 | phase2_rls_perf_and_consolidation | `manual/0004` |
| 20260628033606 | phase2_rls_initplan_fix | `manual/0005` |
| 20260628033758 | phase2_drop_unused_index | `manual/0006` |
| 20260628043538 | phase2_rate_limit_events | `manual/0007` |
| 20260628134525 | handle_new_user_trigger | `manual/0008` |

`manual/0001` (get_public_agents + column privacy) and `manual/0002` (rls_auto_enable EXECUTE revoke) were applied via the **SQL editor**, so they are **not** in the migration ledger; both are now folded into `policies.sql` / `schema.sql`.

## Live posture (verified 2026-06-28)

- RLS enabled on all **13** public tables (incl. `rate_limit_events` — deny-all, service_role only). No privilege-escalation path (only `superadmin` grants admin/superadmin).
- Performance advisors `auth_rls_initplan` / `multiple_permissive_policies` / `unindexed_foreign_keys` → **0** (Phase 2).
- Accepted / known advisor findings (no action): 12× "Public/Signed-In can execute SECURITY DEFINER" (the role helpers + `get_public_agents` — revoking EXECUTE **breaks RLS**, documented in `policies.sql`); 1× `rate_limit_events` deny-all INFO (intentional); 9× unused-index INFO (Phase 2.2 FK covering indexes — populate under traffic). **Deferred:** leaked-password protection (needs Supabase Pro).

## How to apply a DB change (runbook)

1. **Propose first.** Open a PR adding `manual/NNNN_description.sql` (next number) and, if it changes the declared shape, update `schema.sql`/`policies.sql` to match.
2. **Make it reversible where practical.** Include a commented `-- ROLLBACK:` section with the inverse statements.
3. **Get explicit owner approval** before touching the live project.
4. **Verify current live state** via the Supabase MCP / dashboard (`list_tables`, `get_advisors`, relevant `pg_policies`) before applying.
5. **Apply** via the dashboard SQL editor or the Supabase MCP `apply_migration` — one script at a time.
6. **Re-run advisors** (`get_advisors security` + `performance`) after the change; address new findings.
7. **Fold into `schema.sql`/`policies.sql`** in the same PR so the declared baseline never drifts from live.
8. **Never** edit `_legacy_migrations/`.

## Verify the baseline still matches live (repeatable drift-check)

Read-only; safe to run anytime. Via the Supabase MCP (or dashboard SQL editor), compare live against the canonical files:

- column catalog (`pg_attribute` / `information_schema.columns`) → tables, columns, types, defaults
- `pg_constraint`, `pg_indexes` → PK/FK/unique constraints + indexes
- `pg_proc`, `pg_trigger`, `pg_event_trigger` → functions, table triggers, event triggers
- `pg_policies` → RLS policies; `information_schema.column_privileges` on `profiles` → column-privacy grants
- `storage.buckets` → bucket config; `get_advisors` → security/performance posture

Any difference is **drift**: either fold the live object into `schema.sql`/`policies.sql` (if intended) or open a corrective `manual/NNNN`.

## Numbering

`manual/` scripts are numbered sequentially: `0001_…`, `0002_…`. Current highest: `0008_handle_new_user_trigger.sql` (Phase 7.5). Next change starts at `0009_`.

## Edge function `verify_jwt` matrix (`config.toml`)

| Function | verify_jwt | Auth model |
|---|---|---|
| `submit-contact` | false | public form |
| `submit-schedule-visit` | false | public form |
| `optimize-property-image` | true | + server-side staff role check |
| `upload-property-image` | false | does its own JWT + staff role check |
| `send-agent-invitation` | true | + server-side admin role check |
| `accept-agent-invitation` | false | authn = secret invitation token |
