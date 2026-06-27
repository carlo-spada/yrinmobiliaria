import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { configDefaults, defineConfig } from 'vitest/config';

// Config de pruebas unitarias (Vitest). Antes vivía en vite.config.ts; al retirar
// Vite como build system (Next/Turbopack es el único build), el setup de tests
// queda aquí, independiente. Vitest trae su propio Vite; solo necesitamos el
// plugin de React (SWC) para JSX y el alias @ → src.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    globals: true,
    // Los specs de Playwright viven en e2e/ y se corren con `npm run test:e2e`.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
});
