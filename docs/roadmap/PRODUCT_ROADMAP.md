# Product Roadmap — YR Inmobiliaria

> De catálogo + gestión básica a un sistema operativo inmobiliario que potencia a **agentes**, **propietarios** y **compradores**. Construido sobre nuestro stack actual (Next.js 16 + Supabase propio), sin tarifas por asiento, con el **bilingüe ES/EN** como diferenciador.

**Última actualización:** 27 de junio de 2026 · **Ejecución:** Claude Opus 4.8, 1 PR ≈ 1 sesión.

Documento vivo: marcar cada PR como hecho (`[x]`) y estampar la fecha al cerrarlo.

---

## 1. Decisiones estratégicas (tomadas)

- **Prioridad de audiencias:** productividad de agentes → portal de propietarios → experiencia de compradores.
- **WhatsApp / IA:** adopción **gradual** (quick-wins baratos primero; API/chatbot después).
- **Build vs. buy → Híbrido.** Construir in-house el núcleo de productividad (pipeline de leads, asignación, calendario, recordatorios, reportes) porque se monta sobre datos que ya poseemos y mantiene la unidad con el sitio bilingüe; **integrar vía API** lo commodity (WhatsApp Business API, APIs de IA, feeds a portales).

**Por qué Híbrido (resumen):** en mercados desarrollados nadie construye su CRM desde cero — el software best-of-breed es barato vs. el costo de desarrollo, y la diferenciación viene del proceso, los leads y la IA. Pero esas herramientas son inglés-first, atadas al MLS de EE.UU. y cobran por asiento. YR ya tiene los datos de negocio modelados en Supabase y un sitio público bilingüe (ventaja que EasyBroker/Wiggot no priorizan), así que el costo marginal de la capa CRM propia es bajo. **Regla:** copiar el *modelo* de los líderes (pipeline tipo Follow Up Boss, performance tipo Sisu, IA-ISA tipo Lofty) en nuestra capa; integrar lo genérico.

---

## 2. Referencias de mercado

- **CRM + routing:** Follow Up Boss (reglas por zona/precio/fuente, round-robin, first-to-claim); Real Geeks (geographic round-robin).
- **Automatización / IA-ISA:** Lofty AI Assistant, Real Geeks "Robin", Structurely, Ylopo (nutren 60–90 días hasta la cita).
- **Performance de equipo:** Sisu (dashboards, leaderboards, accountability, coaching por datos).
- **Transacciones/comisiones:** BoldTrail BackOffice (transacción + e-sign + splits).
- **IA de producto:** búsqueda en lenguaje natural (Zillow AI Mode 2026), AVM (HouseCanary), copy con IA (Claude), virtual staging (REimagine Home).
- **México:** EasyBroker / Wiggot — todo-en-uno (CRM + multipublicación 20+ portales + bolsa/MLS con comisión compartida); WhatsApp canal #1 (~98% open rate); débiles en EN/SEO. AMPI impulsa el MLS.
- **Legal MX:** LFPDPPP 2025 (Aviso de Privacidad + derechos ARCO, obligatorio); CFDI 4.0 si se manejan cobros (clave SAT 80131601 — agentes inmobiliarios).

---

## 3. Estado actual

**Funciona:** sitio público (home, listado+filtros, detalle, mapa Leaflet, directorio/perfil de agentes, contacto, agendar visita, favoritos local+cloud); back-office (CRUD de propiedades con imágenes AVIF/WebP, invitaciones+onboarding de agentes, gestión de inquiries/visitas con cambio de estado manual, usuarios/roles/zonas, settings, audit logs); backend Supabase single-tenant con RLS por rol, 6 edge functions, Resend (3 emails).

**Carencias que ataca el roadmap:**
- Sin pipeline/CRM de leads (etapas, temperatura, timeline de interacciones).
- Asignación de inquiries/visitas existe en BD (`assigned_to_agent`, `agent_id`) pero **sin automatizar ni UI**.
- Sin calendario, recordatorios ni notificaciones.
- Dashboard del agente = contadores; sin reportes ni vista de manager.
- Sin portal de propietarios (solo agentes/admin crean propiedades).
- Sin alertas, comparador, búsquedas guardadas (hook `useSavedSearches` sin usar) ni búsqueda IA.
- Sin WhatsApp en el flujo ni generación de copy con IA.
- Sin Aviso de Privacidad LFPDPPP 2025 ni flujo ARCO (riesgo legal).

---

## 4. Horizontes

| Fase | Horizonte | Foco |
|---|---|---|
| 0 | Días | Fundaciones: doc + cumplimiento legal |
| 1 | Semanas | Núcleo CRM y productividad de agentes |
| 2 | Semanas (paralelo) | Quick-wins WhatsApp + IA (baratos) |
| 3 | 1–2 meses | Portal de propietarios |
| 4 | 2–4 meses | Experiencia del comprador |
| 5 | Meses–año | Escalamiento (WhatsApp API, scoring, feeds, MLS, transacciones) |

---

## 5. Desglose en PRs (1 PR ≈ 1 sesión Opus 4.8)

> **Regla DB:** todo PR `[DB]` toca el backend en vivo → se aplica vía dashboard / Supabase MCP **solo con OK explícito del owner**, manteniendo `supabase/schema.sql` + `supabase/policies.sql` como fuente de verdad y regenerando tipos.
> **Reutilizar siempre:** `LanguageContext` (bilingüe), `ResponsiveImage`, shadcn/ui, patrón `page.tsx` (server) + `view.tsx` (client), `logAuditEvent()`.
> **Quality gates por PR:** `npm run build`, `npm run lint`, `npx vitest run`, `npm run test:e2e`.

### Fase 0 — Fundaciones
- [x] **PR 0.1 — Documento de roadmap.** Este archivo (`docs/roadmap/PRODUCT_ROADMAP.md`). Sin cambios de código. _(2026-06-27)_
- [x] **PR 0.2 — Cumplimiento LFPDPPP 2025 [legal].** Aviso de Privacidad conforme en `src/screens/PrivacyPolicy.tsx` (finalidades primarias/secundarias, derechos ARCO, datos sensibles, transferencias, seguridad, responsable desde `site_settings`); `ConsentCheckbox` reutilizable en `Contact.tsx`, `ScheduleVisit.tsx` y registro (`Auth.tsx`); flujo ARCO en `/derechos-arco` (`src/screens/DataRights.tsx` → `submit-contact`). _(2026-06-27)_

### Fase 1 — Núcleo CRM y productividad de agentes
- [ ] **PR 1.1 — Modelo de datos del CRM [DB].** Extender `contact_inquiries` y `scheduled_visits` con `stage` (nuevo/contactado/calificado/visita/negociación/cerrado-ganado/cerrado-perdido), `temperature` (hot/warm/cold), `source`, `last_contacted_at`, `next_follow_up_at`. Nuevas tablas: `lead_activities` (timeline call/email/whatsapp/note/status_change), `tasks` (follow-ups con due_date), `notifications`. RLS por rol + agente asignado. *Decisión: extender tablas existentes en lugar de crear `leads` nueva, para no romper los flujos públicos ni el admin.*
- [ ] **PR 1.2 — Asignación automática por zona [DB].** Trigger/edge function: asignar inquiry/visita al agente por zona de la propiedad (`profiles.service_zones`) con round-robin de respaldo (modelo Real Geeks). UI de reasignación (extender `ReassignPropertyDialog`). Registrar en `lead_activities` + audit.
- [ ] **PR 1.3 — Pipeline/Kanban de leads.** `src/screens/agent/LeadsPipeline.tsx` (Kanban por etapa, drag para cambiar stage) + panel de detalle con timeline y acciones rápidas (registrar llamada/nota, fijar próximo follow-up).
- [ ] **PR 1.4 — Calendario y agenda.** Vista mes/semana de `scheduled_visits` + `tasks`; export ICS. (Sync Google/Outlook → Fase 5.) Vista de agente y vista admin del equipo.
- [ ] **PR 1.5 — Recordatorios y notificaciones.** Centro de notificaciones in-app (`notifications`) + emails Resend (lead asignado, visita próxima, follow-up vencido). Disparo con `pg_cron` o edge function `process-reminders` + cron.
- [ ] **PR 1.6 — Dashboard de desempeño + manager.** KPIs reales en `AgentDashboard.tsx` (leads por etapa, conversión, tiempo de respuesta, visitas completadas, series). Vista admin: leaderboard + dashboard de equipo (modelo Sisu).

### Fase 2 — Quick-wins WhatsApp + IA (independientes; intercalables)
- [ ] **PR 2.1 — WhatsApp click-to-chat.** Enlaces `wa.me` con mensaje bilingüe pre-llenado en detalle, acciones de lead y compartir ficha. Registrar como `lead_activity`. Costo $0.
- [ ] **PR 2.2 — Generación de descripciones bilingües con IA.** Botón "Generar con IA" en `PropertyFormDialog`; edge function `generate-listing-copy` → API de Anthropic (Claude) devuelve título+descripción ES/EN. Secreto `ANTHROPIC_API_KEY` en Supabase.

### Fase 3 — Portal de propietarios
- [ ] **PR 3.1 — Modelo de datos de propietarios [DB].** Tabla `property_submissions` (oferta del dueño pendiente de revisión); `owner_user_id` en `properties`; rol `user` + flag `is_owner`. RLS.
- [ ] **PR 3.2 — Flujo público "Ofrece tu propiedad".** Página + wizard (vender/rentar) que crea submission y cuenta de propietario. Reutiliza `ImageUploadZone`, Zod, `LanguageContext`.
- [ ] **PR 3.3 — Dashboard del propietario.** En `/cuenta`: propiedades/submissions, estado, stats (vistas, inquiries, visitas), agente asignado.
- [ ] **PR 3.4 — Bandeja de revisión de submissions.** Admin/agente revisa → publica como `property` y asigna agente. Audit log.

### Fase 4 — Experiencia del comprador
- [ ] **PR 4.1 — Búsquedas guardadas.** Activar y dar UI al hook `useSavedSearches`; persistir en BD para autenticados [DB ligero].
- [ ] **PR 4.2 — Alertas de nuevas propiedades.** Suscripción a criterios → email/WhatsApp al entrar match (reutiliza `notifications` + cron de PR 1.5).
- [ ] **PR 4.3 — Comparador de propiedades.** Selección múltiple en listado + vista comparativa lado a lado.
- [ ] **PR 4.4 — Búsqueda en lenguaje natural con IA.** Input NL → Claude traduce a filtros sobre el inventario (modelo Zillow AI Mode).

### Fase 5 — Escalamiento (priorizar según tracción)
- [ ] WhatsApp **Business API** + chatbot de precalificación 24/7 (captura → CRM).
- [ ] Lead scoring por comportamiento/IA.
- [ ] Multipublicación: feed XML a Inmuebles24/Lamudi.
- [ ] Bolsa/MLS compartida + comisión compartida (AMPI).
- [ ] Transacciones, documentos, e-signature, comisiones/splits; CFDI si hay cobros.
- [ ] Sync bidireccional de calendario, virtual staging IA, transcripción/coaching de llamadas.

---

## 6. Dependencias

- **PR 1.1 es base** de 1.2–1.6 y 4.1–4.2 → primero.
- **PR 1.5** (notificaciones + cron) habilita las alertas de 4.2.
- Fase 2 es independiente → intercalar como quick-win.
- Fases 3 y 4 dependen de Fase 1 estable, no entre sí.
- **PR 0.2 (legal) antes de captar más datos.**

---

## 7. Guardrails

- DB: nada se aplica sin OK del owner; `schema.sql`/`policies.sql` como fuente de verdad.
- Secretos (`ANTHROPIC_API_KEY`, tokens WhatsApp) como Supabase Function secrets / Vercel env, nunca en el repo.
- Bilingüe vía `LanguageContext`; TS estricto sin `any`; quality gates verdes antes de merge.
- Costo IA gradual: Fase 2 usa Claude por request (centavos); WhatsApp Business API (Fase 5) es costo recurrente — decidir con datos de tracción.
