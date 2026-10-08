// Genera las capturas del informe semanal (semanas 8 a 13) con datos ficticios.
// Requisitos: build servido en local (npm run build && npm run preview, puerto 4173)
// y Microsoft Edge o Google Chrome instalados. Uso: npm run capturas (desde tools/capturas).
import { chromium } from 'playwright-core';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const BASE = process.env.CAPTURE_URL ?? 'http://127.0.0.1:4173';
const OUT = fileURLToPath(new URL('../../docs/evidencias/', import.meta.url));
const PC = { width: 1280, height: 800 };
const CEL = { width: 390, height: 844 };
const PROFILE = { name: 'Alumno de prueba', age: 16, course: '4° B' };
const PROFILE_KEY = 'edu-app-contable:student-profile:v1';
const PROGRESS_KEY = 'edu-app-contable:progress:v2';
const log = [];

const out = name => join(OUT, name);

async function launch() {
  for (const channel of ['msedge', 'chrome']) {
    try { return await chromium.launch({ channel, headless: true }); } catch (error) { log.push(`${channel} no disponible: ${error.message.split('\n')[0]}`); }
  }
  throw new Error('No se encontró Microsoft Edge ni Google Chrome.');
}

async function context(browser, viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, acceptDownloads: true, locale: 'es-AR' });
  return { ctx, page: await ctx.newPage() };
}

async function open(page, path, { profile = true } = {}) {
  await page.goto(BASE + '/');
  await page.evaluate(([key, value]) => (value === null ? localStorage.removeItem(key) : localStorage.setItem(key, value)), [PROFILE_KEY, profile ? JSON.stringify(PROFILE) : null]);
  await page.goto(BASE + path);
  await page.addStyleTag({ content: '.skip-link { display: none !important; }' });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(400);
}

async function shot(page, name, options = {}) {
  await page.screenshot({ path: out(name), fullPage: true, ...options });
  log.push(`OK ${name}`);
}

async function fillFields(page, values) {
  for (const [name, value] of Object.entries(values)) {
    const el = page.locator(`[name="${name}"]`);
    if (await el.evaluate(node => node.tagName === 'SELECT')) await el.selectOption(value);
    else await el.fill(value);
  }
}

const ORDEN_HALF = { number: '001', date: '01/05/2026', party: 'Ledesma', 'item1.quantity': '10', 'item1.unitPrice': '50000' };
const ORDEN_REST = {
  address: 'Calle San Martín N.º 234', locality: 'Jujuy', taxId: '30-87824728-1', saleCondition: 'Cuenta corriente',
  'item1.description': 'Cajas de resmas', 'item2.quantity': '15', 'item2.unitPrice': '20000', 'item2.description': 'Cajas de cuadernos A4',
};

async function semana8(browser) {
  let { ctx, page } = await context(browser, PC);
  await open(page, '/');
  await shot(page, 's8_inicio_pc.png', { fullPage: false });
  await page.screenshot({ path: out('s8_menu_principal.png'), clip: { x: 0, y: 0, width: 1280, height: 120 } });
  log.push('OK s8_menu_principal.png');
  await ctx.close();
  ({ ctx, page } = await context(browser, CEL));
  await open(page, '/');
  await shot(page, 's8_inicio_cel.png', { fullPage: false });
  await ctx.close();
}

async function semana9(browser) {
  const { ctx, page } = await context(browser, PC);
  await open(page, '/jugar');
  await page.getByRole('button', { name: /EMPEZAR PARTIDA/ }).click();
  const card = page.locator('.quiz-card');
  await card.waitFor();
  await card.screenshot({ path: out('s9_pregunta.png') });
  log.push('OK s9_pregunta.png');
  let wrongDone = false;
  let rightDone = false;
  for (let i = 0; i < 10; i++) {
    const options = page.locator('.quiz-option');
    const count = await options.count();
    await options.nth(i % 2 === 0 ? 0 : count - 1).click();
    const feedback = page.locator('.quiz-feedback');
    await feedback.waitFor();
    const wrong = (await feedback.textContent()).includes('Todavía no');
    if (wrong && !wrongDone) { await card.screenshot({ path: out('s9_feedback_incorrecto.png') }); wrongDone = true; log.push('OK s9_feedback_incorrecto.png'); }
    if (!wrong && !rightDone) { await card.screenshot({ path: out('s9_feedback_correcto.png') }); rightDone = true; log.push('OK s9_feedback_correcto.png'); }
    await page.locator('.quiz-advance').click();
  }
  await page.locator('.quiz-final').waitFor();
  await page.locator('.quiz-final').screenshot({ path: out('s9_resultado_final.png') });
  log.push('OK s9_resultado_final.png');
  if (!wrongDone) log.push('AVISO s9: no se capturó feedback incorrecto (todas las respuestas coincidieron con la opción elegida)');
  if (!rightDone) log.push('AVISO s9: no se capturó feedback correcto');
  await ctx.close();
}

async function semana10(browser) {
  const { ctx, page } = await context(browser, PC);
  await open(page, '/aprender');
  await shot(page, 's10_listado_lecciones.png');
  await open(page, '/aprender/factura-a');
  await shot(page, 's10_leccion_factura_a.png');
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null && navigator.serviceWorker.controller !== undefined, null, { timeout: 15000 }).catch(() => log.push('AVISO s10: el service worker no tomó control; la captura offline puede fallar'));
  await ctx.setOffline(true);
  await page.reload();
  await page.waitForTimeout(800);
  await shot(page, 's10_leccion_sin_conexion.png');
  await ctx.setOffline(false);
  await ctx.close();
}

async function semana11(browser) {
  const { ctx, page } = await context(browser, PC);
  await open(page, '/practicar');
  await shot(page, 's11_listado_practicar.png');
  await open(page, '/practicar/orden-de-compra');
  await fillFields(page, ORDEN_HALF);
  await page.waitForTimeout(200);
  await shot(page, 's11_orden_medio_completada.png');
  await copyFile(out('s11_orden_medio_completada.png'), out('mejora_calculo_importes.png'));
  await fillFields(page, { ...ORDEN_REST, 'item1.unitPrice': '40000' });
  await page.getByRole('button', { name: /COMPROBAR/ }).click();
  await page.waitForTimeout(200);
  await shot(page, 's11_orden_con_error.png');
  await fillFields(page, { 'item1.unitPrice': '50000' });
  await page.getByRole('button', { name: /COMPROBAR/ }).click();
  await page.waitForTimeout(200);
  await shot(page, 's11_orden_completada.png');
  await page.locator('.pdf-actions').screenshot({ path: out('mejora_pdf_compartir.png') });
  log.push('OK mejora_pdf_compartir.png');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /DESCARGAR PDF/ }).click();
  const download = await downloadPromise;
  await download.saveAs(out('mejora_pdf_ejemplo.pdf'));
  log.push('OK mejora_pdf_ejemplo.pdf');
  await open(page, '/practicar/orden-de-compra?v=48213');
  await page.locator('.variant-banner').screenshot({ path: out('mejora_consigna_variable.png') });
  log.push('OK mejora_consigna_variable.png');
  await open(page, '/practicar/patrimonio/sofia-medina');
  await fillFields(page, { efectivo: 'Activo', mercaderias: 'Activo', pagareCobrar: 'Activo', pagarePagar: 'Pasivo', totalActivo: '369.000', totalPasivo: '92.000', patrimonioNeto: '277.000' });
  await page.getByRole('button', { name: /COMPROBAR/ }).click();
  await page.waitForTimeout(200);
  await shot(page, 's11_sofia_medina.png');
  await ctx.close();
}

async function semana12(browser) {
  let { ctx, page } = await context(browser, CEL);
  await open(page, '/', { profile: false });
  await page.getByLabel('Nombre').fill(PROFILE.name);
  await page.getByLabel('Edad').fill(String(PROFILE.age));
  await page.getByLabel('Curso').fill(PROFILE.course);
  await shot(page, 's12_bienvenida_formulario.png', { fullPage: false });
  await ctx.close();

  ({ ctx, page } = await context(browser, PC));
  await open(page, '/practicar/orden-de-compra');
  await fillFields(page, { ...ORDEN_HALF, ...ORDEN_REST, 'item1.description': 'Cajas de resmas' });
  await page.getByRole('button', { name: /COMPROBAR/ }).click();
  await open(page, '/practicar/patrimonio/sofia-medina');
  await fillFields(page, { efectivo: 'Activo', mercaderias: 'Activo', pagareCobrar: 'Activo', pagarePagar: 'Pasivo', totalActivo: '369.000', totalPasivo: '92.000', patrimonioNeto: '277.000' });
  await page.getByRole('button', { name: /COMPROBAR/ }).click();
  await open(page, '/practicar/patrimonio/activo');
  await fillFields(page, { activo: '90.000' });
  await page.getByRole('button', { name: /COMPROBAR/ }).click();
  await open(page, '/jugar');
  await page.getByRole('button', { name: /EMPEZAR PARTIDA/ }).click();
  for (let i = 0; i < 10; i++) {
    await page.locator('.quiz-option').first().click();
    await page.locator('.quiz-advance').click();
  }
  await open(page, '/progreso');
  await shot(page, 's12_mi_progreso.png');
  await page.getByRole('button', { name: /Reiniciar progreso/ }).click();
  await page.locator('.reset-confirm').waitFor();
  await page.locator('.reset-confirm').screenshot({ path: out('s12_reinicio_confirmacion.png') });
  log.push('OK s12_reinicio_confirmacion.png');
  await ctx.close();
}

async function semana13(browser) {
  let { ctx, page } = await context(browser, PC);
  await open(page, '/');
  await page.screenshot({ path: out('s13_pc_tmp.png'), fullPage: false });
  await ctx.close();
  ({ ctx, page } = await context(browser, CEL));
  await open(page, '/');
  await page.screenshot({ path: out('s13_cel_tmp.png'), fullPage: false });
  await ctx.close();

  const pcData = (await readFile(out('s13_pc_tmp.png'))).toString('base64');
  const celData = (await readFile(out('s13_cel_tmp.png'))).toString('base64');
  ({ ctx, page } = await context(browser, { width: 1280, height: 760 }));
  await page.setContent(`<html><body style="margin:0;padding:24px;background:#faf7f8;font-family:Segoe UI,sans-serif;display:flex;gap:28px;align-items:flex-start;justify-content:center">
    <figure style="margin:0"><img src="data:image/png;base64,${pcData}" style="width:760px;border:1px solid #e6e6e6;border-radius:8px"><figcaption style="font-size:14px;color:#555;margin-top:8px">Computadora (1280 × 800)</figcaption></figure>
    <figure style="margin:0"><img src="data:image/png;base64,${celData}" style="width:300px;border:1px solid #e6e6e6;border-radius:16px"><figcaption style="font-size:14px;color:#555;margin-top:8px">Celular (390 × 844)</figcaption></figure>
  </body></html>`);
  await page.screenshot({ path: out('s13_pc_y_cel.png'), fullPage: true });
  log.push('OK s13_pc_y_cel.png');
  await ctx.close();
  await (await import('node:fs/promises')).rm(out('s13_pc_tmp.png'));
  await (await import('node:fs/promises')).rm(out('s13_cel_tmp.png'));

  ({ ctx, page } = await context(browser, PC));
  await open(page, '/nuestra-historia');
  await shot(page, 's13_sobre_la_app.png');
  await open(page, '/acerca-de');
  await shot(page, 's13_acerca_de.png');
  await open(page, '/');
  await page.locator('footer').screenshot({ path: out('s13_pie_de_pagina.png') });
  log.push('OK s13_pie_de_pagina.png');
  await ctx.close();
}

async function mejoraMenu(browser) {
  const { ctx, page } = await context(browser, CEL);
  await open(page, '/');
  await page.getByRole('button', { name: /Abrir menú/ }).click();
  await page.locator('.menu-panel').waitFor();
  await shot(page, 'mejora_menu.png', { fullPage: false });
  await ctx.close();
}

await mkdir(OUT, { recursive: true });
const browser = await launch();
const steps = [['semana 8', semana8], ['semana 9', semana9], ['semana 10', semana10], ['semana 11', semana11], ['semana 12', semana12], ['semana 13', semana13], ['mejora menú', mejoraMenu]];
for (const [name, step] of steps) {
  try { await step(browser); } catch (error) { log.push(`FALLA ${name}: ${error.message.split('\n')[0]}`); }
}
await browser.close();
console.log(log.join('\n'));
