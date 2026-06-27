import { expect, test } from '@playwright/test';

/**
 * Smoke E2E de las rutas privadas (solo lectura, sin sesión). Verifica que tras
 * el port nativo a Next:
 *  - la pantalla de login renderiza e hidrata,
 *  - el guard de sesión (middleware server-side) redirige las rutas con prefijo
 *    privado a /auth (incluido /cuenta, ahora cubierto por el middleware).
 *
 * NO cubre flujos autenticados con escritura (login, subir foto, enviar
 * contacto): esos requieren credenciales de prueba y un entorno aislado para no
 * generar datos en producción. Se añaden por separado.
 */

test('login (/auth) renderiza el formulario', async ({ page }) => {
  await page.goto('/auth');
  await expect(page.getByText(/Iniciar Sesión|Crear Cuenta/).first()).toBeVisible();
  await expect(page.locator('input#email')).toBeVisible();
  await expect(page.locator('input#password')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test('/agent/dashboard sin sesión redirige a /auth', async ({ page }) => {
  await page.goto('/agent/dashboard');
  await expect(page).toHaveURL(/\/auth/);
});

test('/onboarding/complete-profile sin sesión redirige a /auth', async ({ page }) => {
  await page.goto('/onboarding/complete-profile');
  await expect(page).toHaveURL(/\/auth/);
});

test('/cuenta sin sesión redirige a /auth (middleware cubre /cuenta)', async ({ page }) => {
  await page.goto('/cuenta');
  await expect(page).toHaveURL(/\/auth/);
});

test('/admin sin sesión redirige a /auth', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/auth/);
});

test('/admin/users sin sesión redirige a /auth (middleware cubre /admin/*)', async ({ page }) => {
  await page.goto('/admin/users');
  await expect(page).toHaveURL(/\/auth/);
});

test('/admin/properties sin sesión redirige a /auth', async ({ page }) => {
  await page.goto('/admin/properties');
  await expect(page).toHaveURL(/\/auth/);
});
