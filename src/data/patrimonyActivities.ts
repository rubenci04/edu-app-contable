import type { ActivityField } from './activityTypes';

export interface PatrimonyActivity {
  id: string;
  title: string;
  instruction: string;
  given: string[];
  fields: ActivityField[];
  theoryPath: string;
}

const money = (id: string, label: string, answer: number, hint: string): ActivityField => ({
  id, label, kind: 'money', validation: 'money', answer, hint,
});
const classification = (id: string, label: string, answer: 'Activo' | 'Pasivo'): ActivityField => ({
  id, label, kind: 'choice', validation: 'text', answer,
  options: [{ value: 'Activo', label: 'Activo' }, { value: 'Pasivo', label: 'Pasivo' }],
  hint: 'Revisá si representa un bien o derecho, o una obligación con terceros.',
});

// Fuente: docs/Teoria_documentos_comerciales_y_patrimonio.docx · PRÁCTICA CONTABLE.
export const patrimonyActivities: PatrimonyActivity[] = [
  {
    id: 'patrimonio-neto', title: 'Calculá el Patrimonio Neto',
    instruction: 'Completá el valor que falta y comprobá la ecuación patrimonial estática.',
    given: ['Activo = $95.000', 'Pasivo = $28.000', 'Patrimonio Neto = ?'],
    fields: [money('patrimonioNeto', 'Patrimonio Neto', 67000, 'Aplicá Patrimonio Neto = Activo − Pasivo.')],
    theoryPath: '/aprender/patrimonio-neto',
  },
  {
    id: 'activo', title: 'Completá el Activo',
    instruction: 'Completá el valor que falta en la ecuación patrimonial.',
    given: ['Activo = ?', 'Pasivo = $36.000', 'Patrimonio Neto = $54.000'],
    fields: [money('activo', 'Activo', 90000, 'Aplicá Activo = Pasivo + Patrimonio Neto.')],
    theoryPath: '/aprender/ecuacion-patrimonial-estatica',
  },
  {
    id: 'pasivo', title: 'Completá el Pasivo',
    instruction: 'Completá el valor que falta en la ecuación patrimonial.',
    given: ['Activo = $120.500', 'Pasivo = ?', 'Patrimonio Neto = $72.500'],
    fields: [money('pasivo', 'Pasivo', 48000, 'Aplicá Pasivo = Activo − Patrimonio Neto.')],
    theoryPath: '/aprender/ecuacion-patrimonial-estatica',
  },
  {
    id: 'sofia-medina', title: 'El patrimonio de Sofía Medina',
    instruction: 'Clasificá cada elemento y calculá los totales y el patrimonio neto.',
    given: [
      'Dinero en efectivo: $185.000',
      'Mercaderías destinadas a la venta: $126.000',
      'Personas que le deben dinero con pagarés: $58.000',
      'Pagarés de su firma entregados a terceros: $92.000',
    ],
    fields: [
      classification('efectivo', 'Dinero en efectivo', 'Activo'),
      classification('mercaderias', 'Mercaderías destinadas a la venta', 'Activo'),
      classification('pagareCobrar', 'Personas que le deben dinero con pagarés', 'Activo'),
      classification('pagarePagar', 'Pagarés de su firma entregados a terceros', 'Pasivo'),
      money('totalActivo', 'Total Activo', 369000, 'Sumá los bienes y derechos clasificados como Activo.'),
      money('totalPasivo', 'Total Pasivo', 92000, 'Sumá las obligaciones clasificadas como Pasivo.'),
      money('patrimonioNeto', 'Patrimonio Neto', 277000, 'Aplicá Patrimonio Neto = Activo − Pasivo.'),
    ],
    theoryPath: '/aprender/patrimonio',
  },
];

export const patrimonyPath = (id: string) => `/practicar/patrimonio/${id}`;
export const getPatrimonyActivity = (id: string | undefined) => patrimonyActivities.find(activity => activity.id === id);
