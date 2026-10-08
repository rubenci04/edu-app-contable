// Arma el PDF del informe semanal: texto de docs/informe-semanal-edu-app-contable.txt (sin reescribir)
// + capturas de docs/evidencias/. Requiere haber corrido capturar.mjs antes.
// Uso: npm run informe   (desde tools/capturas)
import { chromium } from 'playwright-core';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const TEXT = join(ROOT, 'docs', 'informe-semanal-edu-app-contable.txt');
const EVID = join(ROOT, 'docs', 'evidencias');
const OUT = join(EVID, 'informe-avance-edu-app-contable.pdf');
const MANUAL = 'Captura manual pendiente: app instalada en el celular';

const escapeHtml = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const image = async (file, caption, phone = false) => {
  const data = (await readFile(join(EVID, file))).toString('base64');
  return `<figure class="shot${phone ? ' phone' : ''}"><img src="data:image/png;base64,${data}" alt="${escapeHtml(caption)}"><figcaption>${escapeHtml(caption)}</figcaption></figure>`;
};
const manualBox = `<div class="manual" role="note"><strong>${MANUAL}</strong></div>`;

const captures = {
  8: [['s8_inicio_pc.png', 'Inicio en computadora', false], ['s8_inicio_cel.png', 'Inicio en celular', true], ['s8_menu_principal.png', 'Menú principal de la aplicación (vista de escritorio)', false]],
  9: [['s9_pregunta.png', 'Pregunta de una partida del juego', false], ['s9_feedback_incorrecto.png', 'Retroalimentación con respuesta incorrecta', false], ['s9_feedback_correcto.png', 'Retroalimentación con respuesta correcta', false], ['s9_resultado_final.png', 'Resultado final de la partida', false]],
  10: [['s10_listado_lecciones.png', 'Listado de lecciones de Aprendemos', false], ['s10_leccion_factura_a.png', 'Lección abierta: Factura A', false], ['s10_leccion_sin_conexion.png', 'Lección abierta sin conexión, después de la primera carga', false]],
  11: [['s11_listado_practicar.png', 'Listado de Practicamos', false], ['s11_orden_medio_completada.png', 'Orden de compra a medio completar, con importes calculados', false], ['s11_orden_con_error.png', 'Orden de compra con un error (precio unitario incorrecto)', false], ['s11_orden_completada.png', 'Orden de compra completada, con el mensaje de confirmación', false], ['s11_sofia_medina.png', 'Caso de Sofía Medina (Patrimonio): clasificación y totales', false]],
  12: [['s12_bienvenida_formulario.png', 'Bienvenida con el formulario de perfil', true], ['s12_mi_progreso.png', 'Mi Progreso con datos cargados', false], ['s12_reinicio_confirmacion.png', 'Confirmación de reinicio de progreso', false]],
  13: [['s13_pc_y_cel.png', 'Computadora y celular, lado a lado', false], ['s13_sobre_la_app.png', 'Página Nuestra historia, con la foto de la docente', false], ['s13_pie_de_pagina.png', 'Pie de página con la autoría del desarrollo', false]],
};
const improvements = [
  ['mejora_calculo_importes.png', 'Cálculo automático de importe y total en la Orden de compra', false],
  ['mejora_pdf_compartir.png', 'Botones Descargar PDF y Compartir con la actividad completada', false],
  ['mejora_consigna_variable.png', 'Consigna variable, con el aviso de consigna n.º 48213', false],
  ['mejora_menu.png', 'Menú desplegable en celular, con Acerca de y Nuestra historia', true],
];

const lines = (await readFile(TEXT, 'utf8')).split(/\r?\n/);
const cover = [lines[0], lines[1], lines[2]];
const nota = lines.find(line => line.startsWith('Nota general:'));
const weeks = [];
const advance = { title: '', body: [] };
let current = null;
let inAdvance = false;
for (let i = 3; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  if (line === nota) continue;
  const header = line.match(/^SEMANA (\d+) \((.+)\)$/);
  if (header) { current = { number: Number(header[1]), heading: line, title: '', state: '', body: [] }; weeks.push(current); inAdvance = false; continue; }
  if (line.startsWith('AVANCE ADICIONAL:')) { inAdvance = true; advance.title = line; current = null; continue; }
  if (inAdvance) { advance.body.push(line); continue; }
  if (!current) continue;
  if (!current.title) { current.title = line; continue; }
  if (line.startsWith('Estado:')) { current.state = line; continue; }
  current.body.push(line);
}

const paragraphs = list => list.map(text => `<p>${escapeHtml(text)}</p>`).join('');
const weekHtml = async week => {
  const shots = captures[week.number] ?? [];
  const figures = [];
  for (const [file, caption, phone] of shots) figures.push(await image(file, caption, phone));
  if (week.number === 10) figures.push(manualBox);
  return `<section class="week">
    <h2>${escapeHtml(week.heading)}</h2>
    <h3>${escapeHtml(week.title)}</h3>
    ${week.state ? `<p class="state">${escapeHtml(week.state)}</p>` : ''}
    ${paragraphs(week.body)}
    <div class="shots">${figures.join('')}</div>
  </section>`;
};

const improvementsHtml = [];
for (const [file, caption, phone] of improvements) improvementsHtml.push(await image(file, caption, phone));

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 16mm 16mm 18mm; }
  :root { --ink: #1f1f1f; --soft: #555; --pink: #fbd5e2; --accent: #b0305f; --rule: #e6e6e6; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: "Segoe UI", system-ui, sans-serif; color: var(--ink); font-size: 11pt; line-height: 1.5; }
  .cover { height: 250mm; display: flex; flex-direction: column; justify-content: center; border-left: 8mm solid var(--accent); padding-left: 14mm; break-after: page; }
  .cover h1 { font-size: 26pt; margin: 0 0 8mm; letter-spacing: -0.5pt; }
  .cover .sub { color: var(--soft); font-size: 12pt; margin: 0 0 10mm; }
  .cover .credits { font-size: 11pt; color: var(--ink); }
  .cover .credits span { display: block; margin-top: 2mm; }
  .cover .accent { display: inline-block; background: var(--pink); padding: 2mm 4mm; border-radius: 3mm; font-size: 10pt; margin-top: 12mm; }
  .nota { background: #f7f5f6; border-left: 3mm solid var(--pink); padding: 4mm 5mm; margin: 0 0 8mm; font-size: 10.5pt; break-after: page; }
  .week { break-before: page; }
  h2 { font-size: 16pt; color: var(--accent); margin: 0 0 2mm; border-bottom: 0.4mm solid var(--pink); padding-bottom: 2mm; break-after: avoid; }
  h3 { font-size: 12.5pt; margin: 3mm 0 2mm; break-after: avoid; }
  .state { font-style: italic; color: var(--soft); margin: 0 0 3mm; }
  p { margin: 0 0 3mm; text-align: left; }
  .shots { margin-top: 5mm; }
  figure.shot { break-inside: avoid; margin: 0 0 6mm; text-align: center; }
  figure.shot img { display: block; margin: 0 auto; max-width: 100%; max-height: 215mm; width: auto; height: auto; border: 0.3mm solid var(--rule); border-radius: 2mm; }
  figure.shot.phone img { width: 62mm; max-height: none; border-radius: 6mm; }
  figcaption { font-size: 9.5pt; color: var(--soft); margin-top: 2mm; }
  .manual { break-inside: avoid; border: 0.6mm dashed var(--accent); background: var(--pink); padding: 4mm 5mm; border-radius: 3mm; margin: 0 0 6mm; text-align: center; color: var(--ink); }
  .mejoras { break-before: page; }
  .avance { break-before: page; }
  .avance h2 { font-size: 14pt; }
</style>
</head>
<body>
  <section class="cover">
    <h1>Informe de avance semanal – Edu App Contable</h1>
    <p class="sub">${escapeHtml(cover[1])}</p>
    <div class="credits"><span>${escapeHtml(cover[2].split(' | ')[0])}</span><span>${escapeHtml(cover[2].split(' | ')[1] ?? '')}</span></div>
    <span class="accent">Prototipo local · Documentos comerciales y patrimonio</span>
  </section>
  <section class="nota"><p>${escapeHtml(nota)}</p></section>
  ${(await Promise.all(weeks.map(weekHtml))).join('\n')}
  <section class="mejoras">
    <h2>Mejoras incorporadas después</h2>
    <div class="shots">${improvementsHtml.join('')}</div>
  </section>
  <section class="avance">
    <h2>${escapeHtml(advance.title.replace('AVANCE ADICIONAL: ', ''))}</h2>
    ${paragraphs(advance.body)}
  </section>
</body>
</html>`;

const browser = await (async () => {
  for (const channel of ['msedge', 'chrome']) {
    try { return await chromium.launch({ channel, headless: true }); } catch { /* prueba el siguiente */ }
  }
  throw new Error('No se encontró Microsoft Edge ni Google Chrome.');
})();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'load' });
await page.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '16mm', right: '16mm', bottom: '18mm', left: '16mm' },
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate: '<div style="width:100%;font-size:8pt;color:#777;text-align:center;font-family:Segoe UI,sans-serif">Edu App Contable · Informe de avance · Página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
});
await browser.close();
console.log(`PDF generado: ${OUT}`);
