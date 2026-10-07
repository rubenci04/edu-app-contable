import { activities, allActivityFields } from '../src/data/activities';
import type { Activity, Answers } from '../src/data/activityTypes';
import { articles, suppliers } from '../src/data/variants/ordenDeCompraData';
import { validateActivity } from '../src/lib/activityValidation';
import { BASE_ID, MAX_SEED, buildStatement, dateLong, generateOrdenDeCompra, parseSeed } from '../src/lib/variants/ordenDeCompra';
import { formatCents } from '../src/lib/activityValidation';

const SEEDS = 1000;
const failures: string[] = [];
const counts: Record<string, number> = {};
const check = (name: string, ok: boolean, detail = '') => {
  counts[name] = (counts[name] ?? 0) + 1;
  if (!ok && failures.length < 25) failures.push(`${name}${detail ? ` -> ${detail}` : ''}`);
  if (!ok) counts[`FALLAS ${name}`] = (counts[`FALLAS ${name}`] ?? 0) + 1;
};

const base = activities.find(activity => activity.id === BASE_ID) as Activity;
const snapshotBefore = JSON.stringify(activities);

const correctAnswers = (activity: Activity): Answers => {
  const answers: Answers = {};
  for (const field of allActivityFields(activity)) {
    if (field.calculated || field.validation === 'teacher' || field.answer === undefined) continue;
    answers[field.id] = String(field.answer);
  }
  return answers;
};
const baseFieldIds = allActivityFields(base).map(field => field.id).sort().join(',');

const supplierUse: Record<string, number> = {};
const articleUse: Record<string, number> = {};
const distinct = new Set<string>();
const seen = new Set<string>();
let minQty = Infinity, maxQty = 0, minPrice = Infinity, maxPrice = 0;

for (let seed = 1; seed <= SEEDS; seed++) {
  const variant = generateOrdenDeCompra(seed);
  const { activity, data } = variant;

  check('1. determinista (misma semilla = misma consigna)', JSON.stringify(variant) === JSON.stringify(generateOrdenDeCompra(seed)), `semilla ${seed}`);
  check('2. clave de borrador propia y única', variant.storageId === `${BASE_ID}~${seed}` && variant.storageId !== BASE_ID && !seen.has(variant.storageId));
  seen.add(variant.storageId);
  check('3. mismos campos que la original', [...allActivityFields(activity).map(field => field.id)].sort().join(',') === baseFieldIds, `semilla ${seed}`);

  const answers = correctAnswers(activity);
  const ok = validateActivity(activity, answers);
  check('4. respuestas correctas => Comprobar correcto', ok.correct && ok.feedback.length === 0, `semilla ${seed}: ${ok.feedback.map(f => f.fieldId).join(',')}`);

  const total = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  check('5. total = suma de cantidad × precio', activity.totals[0].answer === total);
  check('6. importe de cada fila = cantidad × precio', data.items.every((item, i) => activity.items[i].fields.find(f => f.id.endsWith('.amount'))?.answer === item.quantity * item.unitPrice));

  for (const format of [(n: number) => String(n), (n: number) => formatCents(n * 100).slice(1), (n: number) => formatCents(n * 100), (n: number) => `${n},00`]) {
    const formatted: Answers = { ...answers };
    data.items.forEach((item, i) => { formatted[`item${i + 1}.unitPrice`] = format(item.unitPrice); });
    check('7. precio aceptado en 50000 / 50.000 / $50.000 / 50000,00', validateActivity(activity, formatted).correct, `semilla ${seed}`);
  }
  const longDate: Answers = { ...answers, date: dateLong(data.date) };
  check('8. fecha aceptada también escrita en letras', validateActivity(activity, longDate).correct, `semilla ${seed}`);

  const mutations: [string, (a: Answers) => Answers, string][] = [
    ['cantidad +1', a => ({ ...a, 'item1.quantity': String(Number(a['item1.quantity']) + 1) }), 'item1.quantity'],
    ['precio +1.000', a => ({ ...a, 'item2.unitPrice': String(Number(a['item2.unitPrice']) + 1000) }), 'item2.unitPrice'],
    ['número de orden', a => ({ ...a, number: a.number === '777' ? '778' : '777' }), 'number'],
    ['proveedor', a => ({ ...a, party: 'Otro proveedor' }), 'party'],
    ['CUIT', a => ({ ...a, taxId: '30-00000000-0' }), 'taxId'],
    ['fecha distinta', a => ({ ...a, date: data.date.day === 1 ? `02/${a.date.slice(3)}` : `01/${a.date.slice(3)}` }), 'date'],
    ['fecha con año de 2 cifras', a => ({ ...a, date: `${a.date.slice(0, 6)}${a.date.slice(8)}` }), 'date'],
    ['descripción', a => ({ ...a, 'item1.description': 'Cosa cualquiera' }), 'item1.description'],
  ];
  for (const [name, mutate, fieldId] of mutations) {
    const result = validateActivity(activity, mutate(answers));
    check(`9. respuesta equivocada (${name}) => incorrecto y señala el campo`, !result.correct && result.feedback.some(f => f.fieldId === fieldId), `semilla ${seed}`);
  }

  const text = activity.statement.join(' ');
  const mustAppear = [data.supplier.name, data.supplier.address, data.supplier.taxId, `N.º ${data.number}`, dateLong(data.date),
    ...data.items.flatMap(item => [`${item.quantity} ${item.quantity === 1 ? item.article.singular : item.article.plural}`, `${formatCents(item.unitPrice * 100)} cada ${item.article.each}`])];
  check('10. la consigna contiene todos los datos que se piden', mustAppear.every(part => text.includes(part)), `semilla ${seed}: falta ${mustAppear.find(p => !text.includes(p))}`);
  check('11. la consigna no tiene undefined / NaN / TODO', !/undefined|NaN|TODO|\[object/.test(text), `semilla ${seed}`);
  check('12. dos artículos distintos', data.items[0].article !== data.items[1].article);
  check('13. solo proveedores con CUIT confirmado', Boolean(data.supplier.taxId) && Boolean(suppliers.find(s => s.name === data.supplier.name)?.taxId));
  check('14. fecha válida', (() => { const d = new Date(Date.UTC(data.date.year, data.date.month - 1, data.date.day)); return d.getUTCDate() === data.date.day && d.getUTCMonth() === data.date.month - 1; })());
  check('15. activity original sin cambios de id, tema ni siguiente', activity.id === base.id && activity.nextId === base.nextId && activity.theoryPath === base.theoryPath);

  distinct.add(JSON.stringify({ ...data, seed: 0 }));
  supplierUse[data.supplier.name] = (supplierUse[data.supplier.name] ?? 0) + 1;
  for (const item of data.items) {
    const key = item.article.singular;
    articleUse[key] = (articleUse[key] ?? 0) + 1;
    minQty = Math.min(minQty, item.quantity); maxQty = Math.max(maxQty, item.quantity);
    minPrice = Math.min(minPrice, item.unitPrice); maxPrice = Math.max(maxPrice, item.unitPrice);
  }
}

const ledesma = suppliers[0] as typeof suppliers[0] & { taxId: string };
const asOriginal = buildStatement({
  seed: 0, number: '001', date: { day: 1, month: 1, year: 2026 }, supplier: ledesma,
  items: [{ article: articles[0], quantity: 10, unitPrice: 50000 }, { article: articles[1], quantity: 15, unitPrice: 20000 }],
}, 'En el día de la fecha');
check('16. la plantilla reproduce EXACTAMENTE la consigna original (párrafo 1)', asOriginal[0] === base.statement[0], asOriginal[0]);
check('17. la plantilla reproduce EXACTAMENTE la consigna original (párrafo 2)', asOriginal[1] === base.statement[1], asOriginal[1]);

check('18. la actividad original no cambió tras generar 1.000 variantes', JSON.stringify(activities) === snapshotBefore);

for (const [raw, expected] of [['1', 1], ['123', 123], [' 48213 ', 48213], ['999999', 999999], ['0', null], ['-5', null], ['1.5', null], ['abc', null], ['', null], [null, null], [undefined, null], ['1000000', null], ['007', null], ['12 3', null]] as const) {
  check(`19. parseSeed(${JSON.stringify(raw)}) = ${expected}`, parseSeed(raw) === expected);
}
check('20. MAX_SEED = 999999', MAX_SEED === 999999);

const grouped = new Map<string, number>();
for (const [name, n] of Object.entries(counts)) if (!name.startsWith('FALLAS')) grouped.set(name, n);
console.log(`\nAUTOCOMPROBACIÓN DE VARIANTES · Orden de compra · ${SEEDS} semillas (1 a ${SEEDS})\n`);
for (const [name, n] of grouped) {
  const bad = counts[`FALLAS ${name}`] ?? 0;
  console.log(`${bad === 0 ? 'OK   ' : 'FALLA'}  ${name}  (${n - bad}/${n})`);
}
console.log(`\nConsignas distintas entre ${SEEDS} semillas: ${distinct.size}`);
console.log(`Proveedores usados (solo con CUIT confirmado): ${JSON.stringify(supplierUse)}`);
console.log(`Proveedores pendientes de CUIT (no se usan): ${suppliers.filter(s => !s.taxId).map(s => s.name).join(', ')}`);
console.log(`Artículos usados: ${Object.keys(articleUse).length} de ${articles.length}; cantidades ${minQty}-${maxQty}; precios $${minPrice}-$${maxPrice}`);
console.log('\nEjemplos de consigna:');
for (const seed of [1, 2, 48213]) console.log(`  [${seed}] ${generateOrdenDeCompra(seed).activity.statement[1]}`);
console.log(failures.length ? `\nPRIMERAS FALLAS:\n${failures.join('\n')}` : '\nRESULTADO: TODO OK');
process.exit(failures.length ? 1 : 0);
