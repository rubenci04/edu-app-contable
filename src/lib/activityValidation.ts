import { allActivityFields } from '../data/activities';
import type { Activity, ActivityField, Answers, ValidationResult } from '../data/activityTypes';

export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
}

export function normalizeIdentifier(value: string): string {
  return value.replace(/[^0-9a-z]/gi, '').toLowerCase();
}

// Devuelve centavos enteros. Acepta separadores de miles y coma o punto decimal.
export function moneyToCents(value: string): number | null {
  const compact = value.trim().replace(/\s|\$/g, '');
  if (!/^[0-9.,]+$/.test(compact) || !/\d/.test(compact)) return null;
  const lastComma = compact.lastIndexOf(',');
  const lastDot = compact.lastIndexOf('.');
  const separator = Math.max(lastComma, lastDot);
  const tail = separator >= 0 ? compact.slice(separator + 1) : '';
  const isDecimal = separator >= 0 && tail.length > 0 && tail.length <= 2 && (lastComma >= 0 || (lastDot >= 0 && compact.indexOf('.') === lastDot));
  const whole = (isDecimal ? compact.slice(0, separator) : compact).replace(/[.,]/g, '');
  const cents = isDecimal ? tail.padEnd(2, '0') : '00';
  const result = Number(whole) * 100 + Number(cents);
  return Number.isSafeInteger(result) ? result : null;
}

function matches(field: ActivityField, raw: string): boolean {
  if (field.validation === 'date') {
    const match = raw.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) return false;
    const [, day, month, year] = match;
    const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return parsed.getUTCFullYear() === Number(year) && parsed.getUTCMonth() + 1 === Number(month) && parsed.getUTCDate() === Number(day);
  }
  if (field.validation === 'teacher') return true;
  if (!raw.trim() || field.answer === undefined) return false;
  if (field.validation === 'money') return moneyToCents(raw) === Number(field.answer) * 100;
  if (field.validation === 'quantity') return /^\d+$/.test(raw.trim()) && Number(raw.trim()) === field.answer;
  if (field.validation === 'identifier') return [String(field.answer), ...(field.accepted ?? [])].some(answer => normalizeIdentifier(raw) === normalizeIdentifier(answer));
  return [String(field.answer), ...(field.accepted ?? [])].some(answer => normalizeText(raw) === normalizeText(answer));
}

export function formatCents(cents: number): string {
  const whole = String(Math.floor(cents / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const rest = cents % 100;
  return `$${whole}${rest ? `,${String(rest).padStart(2, '0')}` : ''}`;
}

// Importe de cada fila (cantidad × precio) y total (suma de importes). null = falta algún dato.
export function calculatedCents(activity: Activity, answers: Answers): Record<string, number | null> {
  const result: Record<string, number | null> = {};
  let sum = 0;
  let any = false;
  for (const line of activity.items) {
    const amountField = line.fields.find(field => field.calculated === 'amount');
    if (!amountField) continue;
    const quantity = (answers[`${line.id}.quantity`] ?? '').trim();
    const price = moneyToCents(answers[`${line.id}.unitPrice`] ?? '');
    const product = /^\d+$/.test(quantity) && price !== null ? Number(quantity) * price : null;
    const cents = product !== null && Number.isSafeInteger(product) ? product : null;
    result[amountField.id] = cents;
    if (cents !== null) { sum += cents; any = true; }
  }
  for (const field of activity.totals) if (field.calculated === 'total') result[field.id] = any && Number.isSafeInteger(sum) ? sum : null;
  return result;
}

function withCalculatedAnswers(activity: Activity, answers: Answers): Answers {
  const merged = { ...answers };
  for (const [id, cents] of Object.entries(calculatedCents(activity, answers))) {
    merged[id] = cents === null ? '' : `${Math.floor(cents / 100)}${cents % 100 ? `,${String(cents % 100).padStart(2, '0')}` : ''}`;
  }
  return merged;
}

function calculationInputs(activity: Activity, fieldId: string): string[] {
  const lines = activity.items.filter(line => line.fields.some(field => field.calculated === 'amount'));
  const inputs = (id: string) => [`${id}.quantity`, `${id}.unitPrice`];
  const own = lines.find(line => `${line.id}.amount` === fieldId);
  if (own) return inputs(own.id);
  return activity.totals.some(field => field.id === fieldId && field.calculated === 'total') ? lines.flatMap(line => inputs(line.id)) : [];
}

export function validateActivity(activity: Activity, answers: Answers): ValidationResult {
  const result = validateFields(allActivityFields(activity), withCalculatedAnswers(activity, answers), Boolean(activity.teacherReviewNote));
  const failing = new Set(result.feedback.map(item => item.fieldId));
  // Un importe o total calculado no se marca aparte si ya se señala la cantidad o el precio que lo originan.
  const feedback = result.feedback.filter(item => !calculationInputs(activity, item.fieldId).some(id => failing.has(id)));
  return { ...result, feedback };
}

export const SHORT_YEAR_MESSAGE = 'Escribí el año con 4 cifras. Por ejemplo: 01/05/2026.';
export const hasShortYear = (raw: string) => /^\d{1,2}\/\d{1,2}\/\d{2}$/.test(raw.trim());

export function validateFields(fields: ActivityField[], answers: Answers, needsTeacherReview = false): ValidationResult {
  const feedback = fields.flatMap(field => {
    const raw = answers[field.id] ?? '';
    if (field.validation === 'teacher' || matches(field, raw)) return [];
    const message = field.kind === 'date' && hasShortYear(raw) ? SHORT_YEAR_MESSAGE : field.hint;
    return [{ fieldId: field.id, message, status: 'error' as const }];
  });
  return { correct: feedback.length === 0, needsTeacherReview, feedback };
}
