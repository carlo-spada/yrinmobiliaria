# YR Inmobiliaria - Indice Brownfield

**Last Updated:** April 15, 2026
**Modo:** `initial_scan`
**Profundidad:** `deep`
**Salida BMAD adaptada:** artefacto compacto en `vault/` para respetar el limite documental del repo

## Resumen Ejecutivo

YR Inmobiliaria es una SPA React/Vite bilingue para una inmobiliaria en Oaxaca. El repo no contiene un backend HTTP tradicional; la aplicacion consume Supabase directamente para Auth, Postgres, Storage, RPC y Edge Functions. En terminos de documentacion brownfield, esto debe leerse como un monolito frontend con backend serverless administrado fuera del runtime principal del navegador.

El codigo fuente activo vive sobre todo en `src/` con 195 archivos, 103 componentes, 39 archivos de pagina y 12 pruebas. La app esta separada por experiencia publica, cuenta de usuario, panel de agente y panel administrativo, pero todo comparte el mismo bundle de frontend y el mismo cliente de Supabase.

## Clasificacion Del Proyecto

- **Tipo de repositorio:** monolito
- **Tipo de proyecto:** web app React con backend serverless en Supabase
- **Lenguajes principales:** TypeScript, TSX, SQL, Deno TypeScript
- **Frontend:** React 19, React Router 7, Vite 7, Tailwind 4, shadcn/ui, Radix UI
- **Estado y datos:** TanStack Query + React Context
- **Backend consumido por el cliente:** Supabase Auth, Postgres, Storage, RPC, Realtime
- **Funciones serverless versionadas en repo:** `supabase/functions/*`
- **Persistencia y dominio:** propiedades, perfiles, organizaciones, favoritos, consultas, visitas, CMS, settings
- **Arquitectura efectiva:** UI por rutas + guards de rol + acceso directo a Supabase

## Arbol Critico

```text
.
|-- README.md
|-- CLAUDE.md
|-- AGENTS.md
|-- GEMINI.md
|-- PRODUCTION_CHECKLIST.md
|-- src/
|   |-- App.tsx                       # QueryClientProvider + BrowserRouter + LanguageProvider
|   |-- main.tsx                     # boot + analytics + validacion temprana de Supabase
|   |-- routes/index.tsx             # definicion de rutas publicas y autenticadas
|   |-- contexts/
|   |   |-- AuthContext.tsx          # sesion, perfil, rol y auth mutations
|   |   `-- LanguageContext.tsx      # traducciones ES/EN obligatorias
|   |-- components/
|   |   |-- layout/                  # shells publico/autenticado y layout base
|   |   |-- auth/                    # guards de auth/rol y completitud de perfil
|   |   |-- admin/                   # layout, tablas, formularios y contexto de organizacion
|   |   |-- seo/                     # meta tags y structured data
|   |   `-- ui/                      # primitives shadcn/radix
|   |-- hooks/
|   |   |-- useProperties.ts         # catalogo y detalle de propiedades
|   |   |-- useFavorites.ts          # merge guest/local con DB
|   |   |-- usePublicAgents.ts       # RPC publico de agentes + stats
|   |   |-- usePublicSession.ts      # sesion publica sincronizada via QueryClient
|   |   `-- useSiteSettings*.ts      # settings publicos y admin
|   |-- pages/
|   |   |-- admin/                   # dashboard, users, properties, settings, health, CMS
|   |   |-- agent/                   # dashboard y edicion de perfil
|   |   |-- auth/                    # aceptacion de invitaciones
|   |   |-- onboarding/              # completar perfil
|   |   `-- user/                    # dashboard de cuenta
|   |-- integrations/supabase/       # cliente tipado y tipos generados
|   |-- lib/                         # schema helpers, utilidades, validacion de Supabase
|   `-- utils/                       # analytics, audit log, image upload, translations
|-- supabase/
|   |-- functions/                   # submit-contact, submit-schedule-visit, send-agent-invitation, optimize-property-image
|   `-- migrations/                  # historial SQL legado; la politica actual es no crear nuevos aqui
|-- scripts/generate-hero-images.js  # utilitario de assets
`-- vault/bmad-output/planning-artifacts/
    `-- index.md                     # este artefacto
```

## Arquitectura De Runtime

1. `src/main.tsx` inicializa analytics si existe `VITE_GA_MEASUREMENT_ID` y valida variables criticas de Supabase antes de renderizar.
2. `src/App.tsx` monta `QueryClientProvider`, `LanguageProvider`, toasts, router y transiciones de pagina.
3. `src/routes/index.tsx` separa rutas publicas y autenticadas usando `PublicAppShell` y `AuthenticatedAppShell`.
4. `AuthenticatedAppShell` monta `AuthProvider`; `PublicAppShell` retrasa la carga del boton flotante de WhatsApp.
5. Los guards `RequireAuth`, `RequireRole` y `ProfileCompletionGuard` controlan acceso por sesion, rol y completitud de perfil.
6. La capa de datos consulta Supabase desde hooks y paginas, no desde un API interno intermedio.

### Capas Principales

- **Presentacion:** paginas y componentes en `src/pages` y `src/components`
- **Layout y navegacion:** `src/routes`, `src/components/layout`, `src/components/Header.tsx`, `src/components/Footer.tsx`
- **Estado de sesion/idioma:** `AuthContext`, `LanguageContext`, `usePublicSession`
- **Estado remoto/cache:** TanStack Query en hooks de dominio
- **Integracion externa:** `src/integrations/supabase/client.ts`, Storage, RPC, Realtime y Edge Functions

## Modulos Funcionales

### Experiencia Publica

- Catalogo de propiedades con filtros por tipo, operacion, zona, precio y habitaciones en [`src/pages/Properties.tsx`](../../../src/pages/Properties.tsx).
- Detalle de propiedad con galeria, SEO, schema markup, mini mapa y CTA de WhatsApp en [`src/pages/PropertyDetail.tsx`](../../../src/pages/PropertyDetail.tsx).
- Favoritos con modo guest sincronizable a DB en [`src/hooks/useFavorites.ts`](../../../src/hooks/useFavorites.ts).
- Directorio de agentes via RPC publico y perfiles publicos.
- Formularios de contacto y agendado enviados por Edge Functions, no por inserciones directas del cliente.

### Auth, Cuenta Y Onboarding

- `AuthContext` resuelve sesion, perfil y jerarquia `superadmin > admin > agent > user`.
- `AcceptInvitation` implementa onboarding de agentes desde token + alta de usuario + alta de perfil + aceptacion de invitacion.
- `CompleteProfile` y `ProfileCompletionGuard` fuerzan cierre de onboarding antes de usar paneles protegidos.
- `UserDashboard` centraliza ajustes de cuenta para usuarios autenticados.

### Admin Y Operacion

- `AdminLayout` encapsula acceso staff, selector de organizacion, sidebar persistente y guard de perfil completo.
- `AdminDashboard` agrega conteos y actividad reciente desde tablas operativas.
- `PropertyFormDialog` es una pieza central: valida coordenadas de Oaxaca, sube imagenes, persiste propiedades e imagenes, y genera audit logs.
- Hay modulos para propiedades, agentes, zonas, consultas, visitas, usuarios, settings, CMS, health y audit logs.

## Contratos Backend Reales

### Edge Functions

- `submit-contact`
  - Entrada: `name`, `email`, `phone`, `subject`, `message`
  - Hace: validacion, sanitizacion, rate limiting, insercion en `contact_inquiries`, envio de correo via Resend
- `submit-schedule-visit`
  - Entrada: `propertyId`, `name`, `email`, `phone`, `date`, `timeSlot`, `notes`
  - Hace: validacion, rate limiting, verificacion de propiedad, insercion en `scheduled_visits`, ruteo de correo a agente u organizacion
- `send-agent-invitation`
  - Entrada: `invitation_id`
  - Hace: lookup de invitacion, construccion de magic link y envio de correo
- `optimize-property-image`
  - Entrada: `propertyId`, `imageId`, `imagePath`
  - Hace: verificacion de privilegios y generacion de variantes AVIF/WebP sobre Storage

### RPCs Supabase Usadas Por El Frontend

- `get_public_agents`
- `get_public_agent_by_id`
- `get_public_organization`
- `get_public_organizations`
- `has_role`
- `can_manage_org`
- `is_org_admin`
- `promote_user_to_admin`

### Storage Y Realtime

- Bucket principal observado: `property-images`
- `AdminHealth` prueba DB, Auth, RLS, Storage, acceso a prefijos y Realtime

## Modelo De Datos Operativo

### Tablas Nucleo

- `organizations`: multitenancy y branding por organizacion
- `profiles`: identidad extendida, organizacion, biografia, rol operativo, zonas, datos profesionales
- `role_assignments`: roles elevados separados del perfil
- `properties`: listing principal con JSON para ubicacion, features, amenidades e `image_variants`
- `property_images`: galeria por propiedad
- `service_zones`: zonas activas para catalogo y formularios
- `site_settings`: configuracion editable consumida por UI publica y admin

### Tablas Operativas

- `contact_inquiries`
- `scheduled_visits`
- `user_favorites`
- `audit_logs`
- `agent_invitations`
- `cms_pages`

### Tablas/Meta De Builder Interno

- `entity_definitions`
- `field_definitions`

## Convenciones Importantes

- Todo texto visible debe salir de `LanguageContext` o de fuentes CMS/settings; el repo exige bilingue ES/EN.
- Las coordenadas de propiedades se validan contra limites de Oaxaca en el formulario admin.
- Las imagenes deben pasar por `ResponsiveImage` y, cuando existan, por variantes generadas.
- El logging de cliente se oculta en produccion mediante `utils/logger.ts`.
- No hay backend Express/Nest/Next API dentro de `src/`; cualquier cambio de datos serio probablemente implica Supabase o Lovable.
- Aunque existen `supabase/migrations/` y `supabase/functions/`, la politica actual del repo dice no agregar nuevas migraciones o edge functions directamente.

## Desarrollo Y Operacion

### Requisitos

- Node.js compatible con Vite 7 y dependencias modernas
- `.env` local con `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` y opcionalmente `VITE_GA_MEASUREMENT_ID`
- Credenciales de Supabase/Lovable fuera del repo

### Comandos

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
```

### Calidad Y Release

- No existe `.github/workflows/` en el repo actual.
- El checklist operativo real vive en `PRODUCTION_CHECKLIST.md`.
- Las validaciones minimas del proyecto son `git fetch --all && git status -sb`, `npm run lint` y `npm run build`.
- Deploy y configuracion de secretos se gestionan via Lovable Cloud/Supabase, no desde este repo.

## Documentacion Existente Relevante

- [`README.md`](../../../README.md): overview humano y quick start
- [`CLAUDE.md`](../../../CLAUDE.md): filosofia y workflow operativo
- [`AGENTS.md`](../../../AGENTS.md): restricciones y reglas de colaboracion
- [`GEMINI.md`](../../../GEMINI.md): convenciones para Gemini
- [`PRODUCTION_CHECKLIST.md`](../../../PRODUCTION_CHECKLIST.md): readiness operacional

## Riesgos Y Gaps Para Trabajo Futuro

- La documentacion canonica del repo esta llena; por eso este output vive en `vault/`.
- El modelo de backend esta repartido entre tablas, RPCs, RLS y edge functions; cualquier cambio mal clasificado puede romper permisos sin tocar frontend.
- Hay artefactos legacy en `supabase/migrations/` aunque la politica actual desaconseja seguir por esa via.
- El worktree actual ya trae cambios locales grandes; cualquier feature nueva debe aislarse de ese trabajo en progreso.

## Como Usar Este Artefacto

- **UI publica:** empezar por `src/pages/Properties.tsx`, `src/pages/PropertyDetail.tsx`, `src/components/layout/PageLayout.tsx`
- **Auth/roles:** revisar `src/contexts/AuthContext.tsx`, `src/hooks/useUserRole.ts`, `src/components/auth/RouteAccessGuard.tsx`
- **Admin:** revisar `src/components/admin/AdminLayout.tsx` y luego la pagina admin especifica
- **Datos de propiedades:** revisar `src/hooks/useProperties.ts`, `src/types/property.ts`, `src/components/admin/PropertyFormDialog.tsx`
- **Flujos serverless:** revisar `supabase/functions/*` antes de asumir que el cliente escribe directo a DB

---

_Artefacto generado con el skill `bmad-document-project`, adaptado a la politica documental del repositorio._
