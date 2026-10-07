import { activities } from '../../data/activities';
import type { Activity, ActivityField, ActivityItem } from '../../data/activityTypes';
import { articles, dayRange, monthNames, orderNumberRange, suppliers, years } from '../../data/variants/ordenDeCompraData';
import type { ArticleData, SupplierData } from '../../data/variants/ordenDeCompraData';
import { formatCents } from '../activityValidation';
import { createRng } from './random';

export const MAX_SEED = 999999;
export const BASE_ID = 'orden-de-compra';

export interface VariantItem { article: ArticleData; quantity: number; unitPrice: number }
export interface OrdenDeCompraData {
  seed: number;
  number: string;
  date: { day: number; month: number; year: number };
  supplier: SupplierData & { taxId: string };
  items: [VariantItem, VariantItem];
}
export interface GeneratedVariant {
  seed: number;
  /** Clave para borradores e intentos: nunca coincide con la de la actividad original. */
  storageId: string;
  data: OrdenDeCompraData;
  activity: Activity;
}

/** Devuelve el número de consigna si es un entero de 1 a 999999; si no, null (se usa la original). */
export function parseSeed(raw: string | null | undefined): number | null {
  if (raw == null || !/^[1-9]\d{0,5}$/.test(raw.trim())) return null;
  const seed = Number(raw.trim());
  return seed >= 1 && seed <= MAX_SEED ? seed : null;
}

const pad = (value: number, size: number) => String(value).padStart(size, '0');
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const money = (pesos: number) => formatCents(pesos * 100);
const nounFor = (article: ArticleData, quantity: number) => (quantity === 1 ? article.singular : article.plural);

// Orden de sorteos (parte del contrato: cambiarlo cambia todas las consignas ya compartidas):
// proveedor, número de orden, mes, día, año, dos artículos distintos y, por cada uno, cantidad y precio.
export function generateData(seed: number): OrdenDeCompraData {
  const rng = createRng(seed);
  const eligible = suppliers.filter((supplier): supplier is SupplierData & { taxId: string } => Boolean(supplier.taxId));
  if (eligible.length === 0) throw new Error('No hay proveedores con CUIT confirmado.');
  const supplier = rng.pick(eligible);
  const number = pad(rng.int(orderNumberRange[0], orderNumberRange[1]), 3);
  const month = rng.int(1, 12);
  const day = rng.int(dayRange[0], dayRange[1]);
  const year = rng.pick(years);
  const [first, second] = rng.sample(articles, 2);
  const line = (article: ArticleData): VariantItem => ({
    article,
    quantity: rng.int(article.quantity[0], article.quantity[1]),
    unitPrice: rng.pick(article.prices),
  });
  return { seed, number, date: { day, month, year }, supplier, items: [line(first), line(second)] };
}

export function dateNumeric(date: OrdenDeCompraData['date']): string {
  return `${pad(date.day, 2)}/${pad(date.month, 2)}/${date.year}`;
}
export function dateLong(date: OrdenDeCompraData['date']): string {
  return `${date.day} de ${monthNames[date.month - 1]} de ${date.year}`;
}

const PISAPAPELES_INTRO = 'Pisapapeles comienza su actividad comercial dedicada al sector de librería, con ventas al mayor y menor y domicilio en Calle 43 N.º 567, Ordóñez, Provincia de Córdoba. Es responsable inscripto en IVA, N.º 20-16009082-1.';

/** Texto de la consigna. Mismo formato que la original, con los datos generados en los huecos. */
export function buildStatement(data: OrdenDeCompraData, firstSentence = `El ${dateLong(data.date)}`): string[] {
  const [a, b] = data.items;
  const piece = (item: VariantItem) => `${item.quantity} ${nounFor(item.article, item.quantity)} a ${money(item.unitPrice)} cada ${item.article.each}`;
  return [
    `${firstSentence}, ${PISAPAPELES_INTRO}`,
    `Solicita en cuenta corriente, según Orden de Compra N.º ${data.number}, a su proveedor ${data.supplier.name}, con domicilio en ${data.supplier.address}, ${data.supplier.localityText}, responsable inscripto en IVA, CUIT N.º ${data.supplier.taxId}: ${piece(a)} y ${piece(b)}.`,
  ];
}

export function baseActivity(): Activity {
  const base = activities.find(activity => activity.id === BASE_ID);
  if (!base) throw new Error('No se encontró la Orden de compra original.');
  return base;
}

export function generateOrdenDeCompra(seed: number): GeneratedVariant {
  const base = baseActivity();
  const data = generateData(seed);
  const total = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const fields = base.fields.map((field): ActivityField => {
    switch (field.id) {
      case 'number': return { ...field, answer: data.number };
      case 'date': return { ...field, validation: 'text', answer: dateNumeric(data.date), accepted: [dateLong(data.date)], hint: 'Revisá la fecha que indica la consigna.' };
      case 'party': return { ...field, answer: data.supplier.name };
      case 'address': return { ...field, answer: data.supplier.address, accepted: data.supplier.addressAccepted };
      case 'locality': return { ...field, answer: data.supplier.locality, accepted: data.supplier.localityAccepted };
      case 'taxId': return { ...field, answer: data.supplier.taxId };
      default: return { ...field };
    }
  });

  const items = base.items.map((line, index): ActivityItem => {
    const item = data.items[index];
    const answers: Record<string, ActivityField['answer']> = {
      [`${line.id}.quantity`]: item.quantity,
      [`${line.id}.description`]: capitalize(nounFor(item.article, item.quantity)),
      [`${line.id}.unitPrice`]: item.unitPrice,
      [`${line.id}.amount`]: item.quantity * item.unitPrice,
    };
    const accepted = [capitalize(item.quantity === 1 ? item.article.plural : item.article.singular), ...(item.article.accepted ?? [])];
    return {
      ...line,
      fields: line.fields.map((field): ActivityField => ({
        ...field,
        answer: answers[field.id],
        accepted: field.id === `${line.id}.description` ? accepted : field.accepted,
      })),
    };
  });

  const totals = base.totals.map((field): ActivityField => (field.id === 'total' ? { ...field, answer: total } : { ...field }));
  const activity: Activity = { ...base, statement: buildStatement(data), fields, items, totals };
  return { seed, storageId: `${BASE_ID}~${seed}`, data, activity };
}
