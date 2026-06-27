import { defineConfig, devices } from '@playwright/test';

/**
 * E2E smoke de las rutas públicas. Por defecto corre contra el sitio en vivo,
 * pero el baseURL es configurable (PLAYWRIGHT_BASE_URL) para apuntar a un preview
 * de Vercel o a un `next start` local.
 *
 * Solo cubre flujos de lectura (no envía formularios ni hace login) para no
 * generar datos en producción.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: process.env.CI ? 2 : 4,
  reporter: [['list']],
  timeout: 45_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'https://yrinmobiliaria.com',
    trace: 'on-first-retry',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
