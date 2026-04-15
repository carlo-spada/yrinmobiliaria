---
project_name: 'yrinmobiliaria'
user_name: 'Yas'
date: '2026-04-15'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'seeded'
rule_count: 18
optimized_for_llm: true
source: 'manual bootstrap before collaborative BMAD refinement'
---

# Project Context for AI Agents

_Este archivo reúne las reglas críticas que los agentes deben leer antes de implementar código en este proyecto. Es un contexto inicial y debe refinarse con `bmad-generate-project-context` cuando cambien stack, patrones o workflow._

---

## Technology Stack & Versions

- React 19.2.1 + React DOM 19.2.1
- TypeScript 5.9.3
- Vite 7.3.2
- React Router DOM 7.14.1
- Tailwind CSS 4.1.17 + shadcn/Radix
- TanStack Query 5.90.12
- Supabase JS 2.87.1
- Vitest 4.1.4 + Testing Library 16.3.0

## Critical Implementation Rules

### Language-Specific Rules

- TypeScript estricto: evita `any` y respeta `strictNullChecks`, `noUnusedLocals` y `noUnusedParameters`
- Usa alias `@/` para imports internos
- Mantén `PascalCase.tsx` para componentes y `camelCase.ts` para hooks/utilidades
- No agregues comentarios obvios; documenta solo decisiones y bloques no triviales

### Framework-Specific Rules

- Toda consulta o mutación a Supabase debe vivir en hooks o utilidades dedicadas, no dispersa por páginas
- Las rutas públicas no deben asumir `AuthProvider`; el shell autenticado está separado del shell público
- Todo texto UI debe pasar por `LanguageContext`
- Reusa `src/components/ui/*` y `ResponsiveImage` antes de crear primitives nuevas
- Los cambios de backend, schema, RLS o Edge Functions se hacen fuera del repo, vía Lovable o Supabase

### Testing Rules

- Usa Vitest + React Testing Library
- Coloca tests como `*.test.ts` o `*.test.tsx`
- Prioriza cobertura en guards, auth, favoritos, admin y transforms de hooks
- No dependas de red real, Supabase real ni storage real en tests

### Code Quality & Style Rules

- Corre `npm run lint` y `npm run build` antes de cerrar trabajo; para cambios mayores también `npm audit --audit-level=high`
- Conserva lazy loading en admin, mapa y superficies pesadas
- No rompas la separación entre `PublicAppShell` y `AuthenticatedAppShell`
- Usa TanStack Query para server state y Context solo para preocupaciones transversales reales

### Development Workflow Rules

- Siempre sync first: `git fetch --all && git status -sb`
- Trabajo mayor entra por BMAD: `bmad-document-project` -> `bmad-generate-project-context` -> brief/PRFAQ -> PRD -> UX -> arquitectura -> épicas/historias -> readiness -> sprint planning -> ciclo de historias
- Fixes pequeños pueden usar flujo directo, pero siguen obligados a respetar guardrails y quality gates
- Guarda planeación en `vault/bmad-output/planning-artifacts`, implementación en `vault/bmad-output/implementation-artifacts` y pruebas en `vault/bmad-output/test-artifacts`
- Ejecuta skills BMAD en contextos frescos cuando sea posible

### Critical Don't-Miss Rules

- No crear `supabase/migrations/` ni `supabase/functions/`
- No comprometer secrets ni archivos `.env`
- No reintroducir los árboles legacy de `.claude/commands/bmad` o `.codex/prompts/bmad-*`
- Para mapas, valida bounds de Oaxaca cuando toques geolocalización
- Evita hardcodear textos ES/EN y no rompas accesibilidad ni labels

---

## Usage Guidelines

**Para agentes**

- Lee este archivo, `CLAUDE.md`, `AGENTS.md` y `docs/index.md` antes de cambios mayores
- Si el trabajo es mayor y no existe artefacto BMAD, crea o refresca el artefacto antes de implementar
- Cuando haya conflicto entre una conversación vieja y el repo actual, gana el repo actual

**Para humanos**

- Actualiza este archivo cuando cambien stack, reglas críticas o el workflow de entrega
- Refínalo con `bmad-generate-project-context`; este seed no reemplaza la versión colaborativa final
- Mantén el contenido corto, accionable y orientado a errores que un agente sí podría cometer

Last Updated: 2026-04-15
