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

export function validateActivity(activity: Activity, answers: Answers): ValidationResult {
  const feedback = allActivityFields(activity).flatMap(field => {
    if (field.validation === 'teacher' || matches(field, answers[field.id] ?? '')) return [];
    return [{ fieldId: field.id, message: field.hint, status: 'error' as const }];
  });
  return { correct: feedback.length === 0, needsTeacherReview: Boolean(activity.teacherReviewNote), feedback };
}
