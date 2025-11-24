# GEMINI.md - YR Inmobiliaria

This document provides a high-level overview of the YR Inmobiliaria project, its structure, and development conventions to guide AI-assisted development.

## Project Overview

This is a modern, full-stack real estate platform for YR Inmobiliaria, a business based in Oaxaca, Mexico. The application is a Single Page Application (SPA) built with a focus on performance, SEO, and a clean user experience.

**Key Technologies:**

*   **Frontend Framework:** React (v18) with TypeScript
*   **Build Tool & Dev Server:** Vite
*   **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
*   **Styling:** Tailwind CSS with a custom theme. It also uses components from `shadcn/ui`.
*   **Routing:** React Router DOM v6
*   **Data Fetching & State:** TanStack Query (React Query) for managing server state and caching.
*   **Forms:** React Hook Form with Zod for schema validation.
*   **Internationalization (i18n):** The app is bilingual (Spanish/English), managed via a custom `LanguageContext`.

**Architecture:**

*   **SPA (Single Page Application):** The frontend is a SPA that loads a single HTML page, and subsequent navigation between "pages" is handled dynamically on the client-side by React Router, providing a fast, app-like user experience without full page reloads.
*   **Component-Based:** The UI is built with a clear component hierarchy, organized by feature and reusability.
*   **Lazy Loading:** Routes and non-critical components are lazy-loaded to improve initial page load speed.
*   **Hooks for Logic:** Business logic and data fetching are encapsulated in custom hooks within `src/hooks`.
*   **Direct Supabase Integration:** The frontend communicates directly with the Supabase API for data, authentication, and storage.

---

## Building and Running

The project uses `bun` as the package manager.

**Key Commands:**

*   **Install Dependencies:**
    ```bash
    bun install
    ```

*   **Run Development Server:**
    *   Starts the app on `http://localhost:8080`.
    *   Includes hot-reloading and `lovable-tagger` for component identification.
    ```bash
    bun run dev
    ```

*   **Build for Production:**
    *   Bundles the application into the `dist/` directory.
    *   Optimizes assets, splits vendor chunks, and removes `console.log` statements.
    ```bash
    bun run build
    ```

*   **Run Linter:**
    *   Analyzes the code for style and quality issues using ESLint.
    ```bash
    bun run lint
    ```

*   **Run Tests:**
    *   Executes the test suite using Vitest.
    ```bash
    bun test
    ```

---

## Development Conventions

*   **Path Aliases:** Use the `@` alias to refer to the `src` directory for cleaner import paths (e.g., `import { MyComponent } from '@/components/MyComponent';`).
*   **Styling:**
    *   Use Tailwind CSS utility classes for styling.
    *   Adhere to the design system defined in `tailwind.config.ts` and the existing `shadcn/ui` component styles.
*   **State Management:**
    *   Use **TanStack Query** for all server state (fetching, caching, mutations).
    *   For simple, local UI state, use React's built-in `useState` or `useReducer`.
    *   For global UI state, use the existing `LanguageContext` or create a new React Context.
*   **Data Fetching:**
    *   All Supabase queries should be encapsulated within custom hooks in the `src/hooks` directory (e.g., `useProperties`).
    *   Transform data from the Supabase schema to the application's TypeScript types within these hooks.
*   **Components:**
    *   General-purpose, reusable UI components are in `src/components/ui`.
    *   Larger, feature-specific components are in `src/components`.
    *   Pages (top-level route components) reside in `src/pages`.
*   **SEO:** When creating new pages, include the `<MetaTags />` and `<StructuredData />` components to ensure proper SEO.
*   **Types:** Define all custom types in the `src/types` directory. For Supabase-related types, refer to the auto-generated types in `src/integrations/supabase/types.ts`.
*   **Environment Variables:** All secret keys and environment-specific settings are managed in `.env` files, loaded by Vite. Refer to `.env.example` for the required variables.
