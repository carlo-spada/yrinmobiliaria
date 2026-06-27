import { expect, test } from '@playwright/test';

/**
 * Smoke E2E de las rutas públicas (solo lectura). Verifica que la app Next
 * hidrata y renderiza contra el backend nuevo: home, listado→detalle de
 * propiedad, agentes, formulario de contacto (sin enviar), mapa, 404 e i18n.
 */

test('home carga, hidrata y muestra navegación', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/YR Inmobiliaria/);
  // Nav del header (hidratado)
  await expect(page.getByRole('link', { name: 'Propiedades' }).first()).toBeVisible();
  // El footer existe (chrome completo)
  await expect(page.locator('footer')).toBeVisible();
});

test('listado de propiedades → detalle con precio', async ({ page }) => {
  await page.goto('/propiedades');
  const card = page.locator('a[href*="/propiedad/"]').first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page).toHaveURL(/\/propiedad\//);
  // Precio en MXN visible en el detalle
  await expect(page.getByText(/\$[\d,]+/).first()).toBeVisible();
});

test('directorio de agentes → perfil', async ({ page }) => {
  await page.goto('/agentes');
  const agentLink = page.locator('a[href^="/agentes/"]').first();
  await expect(agentLink).toBeVisible();
  await agentLink.click();
  await expect(page).toHaveURL(/\/agentes\/.+/);
});

test('formulario de contacto presente (sin enviar)', async ({ page }) => {
  await page.goto('/contacto');
  await expect(page.locator('textarea')).toBeVisible();
  expect(await page.locator('input').count()).toBeGreaterThanOrEqual(3);
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

test('mapa carga la isla de Leaflet', async ({ page }) => {
  await page.goto('/mapa');
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 30_000 });
});

test('404 en ruta inexistente', async ({ page }) => {
  await page.goto('/ruta-que-no-existe-xyz-123');
  await expect(page.getByText('404')).toBeVisible();
  await expect(page.getByRole('link', { name: /Return to Home|Inicio/i })).toBeVisible();
});

test('toggle de idioma ES → EN', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Propiedades' }).first()).toBeVisible();
  await page.getByRole('button', { name: /idioma|language|cambiar/i }).first().click();
  await page.getByRole('menuitem', { name: /English/i }).click();
  await expect(page.getByRole('link', { name: 'Properties' }).first()).toBeVisible();
});
