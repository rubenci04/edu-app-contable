import type { Activity, ActivityField, Answers } from '../data/activityTypes';
import type { PatrimonyActivity } from '../data/patrimonyActivities';
import { calculatedCents, formatCents, moneyToCents } from './activityValidation';
import type { PdfModel, PdfRow, PdfSection } from './pdf';

const status = (attempts: number) => ['Estado: Completada correctamente', `Intentos: ${attempts}`];

function displayValue(field: ActivityField, answers: Answers, calculated: Record<string, number | null>): string {
  if (field.calculated) {
    const cents = calculated[field.id];
    return cents == null ? '-' : formatCents(cents);
  }
  const raw = (answers[field.id] ?? '').trim();
  if (!raw) return '-';
  if (field.kind === 'money') {
    const cents = moneyToCents(raw);
    return cents === null ? raw : formatCents(cents);
  }
  return raw;
}

export function activityPdfModel(activity: Activity, answers: Answers, attempts: number): PdfModel {
  const calculated = calculatedCents(activity, answers);
  const rows = (fields: ActivityField[], labelPrefix = ''): PdfRow[] => fields.map(field => ({ label: labelPrefix + field.label, value: displayValue(field, answers, calculated) }));
  const headCount = activity.headFieldCount ?? (activity.id === 'factura-a' ? 3 : 2);
  const sections: PdfSection[] = [{ rows: rows(activity.fields.slice(0, headCount)) }];
  if (activity.fields.length > headCount) {
    sections.push({ title: activity.sectionTitle ?? `Datos del ${activity.id === 'orden-de-compra' ? 'proveedor' : 'cliente'}`, rows: rows(activity.fields.slice(headCount)) });
  }
  if (activity.items.length > 0) {
    sections.push({ title: activity.items.length === 1 ? 'Detalle' : 'Artículos', rows: [] });
    for (const line of activity.items) sections.push({ subtitle: line.label, rows: rows(line.fields) });
  }
  if (activity.totals.length > 0) sections.push({ title: 'Totales', rows: rows(activity.totals) });
  return {
    title: activity.title,
    heading: { name: activity.issuer.name, lines: [activity.issuer.address, activity.issuer.taxId && `CUIT: ${activity.issuer.taxId}`].filter((line): line is string => Boolean(line)), type: activity.documentType, mark: activity.documentMark || undefined },
    sections,
    statusLines: status(attempts),
  };
}

export function patrimonyPdfModel(activity: PatrimonyActivity, answers: Answers, attempts: number): PdfModel {
  const calculated = {};
  return {
    title: activity.title,
    sections: [
      { title: 'Datos del ejercicio', rows: activity.given.map(line => ({ label: '', value: line })) },
      { title: 'Respuestas del alumno', rows: activity.fields.map(field => ({ label: field.label, value: displayValue(field, answers, calculated) })) },
    ],
    statusLines: status(attempts),
  };
}

export function pdfFileName(activityTitle: string, studentName: string): string {
  const slug = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${slug(activityTitle) || 'actividad'}-${slug(studentName) || 'alumno'}.pdf`;
}
