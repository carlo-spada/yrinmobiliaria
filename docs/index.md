# Índice Brownfield — YR Inmobiliaria

**Última actualización:** 15 de abril de 2026

## Propósito

Punto de entrada de conocimiento brownfield para BMAD. Úsalo junto con `README.md`, `CLAUDE.md`, `AGENTS.md` y `vault/bmad-output/project-context.md` antes de planear o implementar trabajo mayor.

## Resumen del sistema

- SPA bilingüe de bienes raíces para Oaxaca, México
- Frontend: React 19, TypeScript, Vite 7, Tailwind 4, React Router 7
- Backend: Supabase consumido directamente desde el cliente; cambios de schema/backend se hacen fuera del repo
- Estado: TanStack Query + React Context
- Roles: `superadmin`, `admin`, `agent`, `user`

## Superficies clave

- Público: inicio, propiedades, detalle, mapa, agentes, contacto, agendar, favoritos
- Autenticado: `/cuenta`, onboarding, `/agent/*`, `/admin/*`
- Rutas: `src/routes/index.tsx`
- Shells: `src/components/layout/PublicAppShell.tsx` y `src/components/layout/AuthenticatedAppShell.tsx`
- Auth y guards: `src/contexts/AuthContext.tsx` y `src/components/auth/*`
- Datos: hooks en `src/hooks/*`, cliente Supabase en `src/integrations/supabase/client.ts`

## Estructura fuente

- `src/components/` — UI reusable y componentes de feature
- `src/components/ui/` — primitives de shadcn/Radix
- `src/components/admin/` — componentes del panel admin
- `src/contexts/` — auth, idioma y estado transversal
- `src/hooks/` — fetching, transforms y utilidades
- `src/pages/` — rutas top-level
- `src/routes/` — composición y guards de rutas
- `src/utils/` y `src/lib/` — helpers, validación y soporte

## Reglas operativas

- Siempre sincroniza primero: `git fetch --all && git status -sb`
- Trabajo mayor entra por BMAD; fixes pequeños pueden ir directo
- No crear migraciones ni edge functions dentro del repo
- Todo texto UI pasa por `LanguageContext`
- Mantén TypeScript estricto y evita `any`
- Gates mínimos antes de cerrar trabajo mayor: `npm run lint`, `npm run build`, `npm audit --audit-level=high`

## Ruta BMAD por defecto

1. `bmad-document-project` para refrescar contexto brownfield
2. `bmad-generate-project-context` para refinar reglas de agentes
3. Brief o PRFAQ -> PRD -> UX -> arquitectura -> épicas e historias
4. `bmad-check-implementation-readiness`
5. `bmad-sprint-planning`
6. Ciclo por historia: `bmad-create-story` -> validar -> `bmad-dev-story` -> `bmad-code-review`
7. TEA cuando el cambio requiera diseño de pruebas, automatización o trazabilidad

## Referencias humanas

- `README.md` — overview y comandos
- `CLAUDE.md` — workflow y guardrails principales
- `AGENTS.md` — reglas para agentes
- `GEMINI.md` — guía Gemini
- `PRODUCTION_CHECKLIST.md` — salida a producción

## Estado de adopción BMAD

- Runtime canónico instalado en `_bmad/` y `.agents/skills/`
- Los árboles legacy de `.claude/commands/bmad` y `.codex/prompts/bmad-*` están en retiro
- Los artefactos BMAD viven en `vault/bmad-output/`
- Este índice es el punto de partida brownfield; amplíalo o reemplázalo con una corrida completa de `bmad-document-project` cuando cambie materialmente la arquitectura
