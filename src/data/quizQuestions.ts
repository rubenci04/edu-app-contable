export type QuizKind = 'multiple' | 'true-false' | 'classification' | 'calculation';
export interface QuizQuestion {
  id: string;
  kind: QuizKind;
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  source: string;
}

const theory = 'Teoria_documentos_comerciales_y_patrimonio.docx';
// Cada consigna y explicación se apoya en el documento teórico; los importes
// de cálculo provienen de sus ejemplos o de la sección PRÁCTICA CONTABLE.
export const quizQuestions: QuizQuestion[] = [
  { id: 'orden', kind: 'multiple', prompt: '¿Qué documento envía el comprador para solicitar mercaderías o servicios?', options: ['Orden de compra', 'Remito', 'Recibo'], answer: 'Orden de compra', explanation: 'La orden de compra expresa la intención de comprar en las condiciones indicadas.', source: `${theory} · Orden de compra` },
  { id: 'remito', kind: 'multiple', prompt: '¿Qué documento acompaña el traslado y la entrega de mercaderías?', options: ['Recibo', 'Remito', 'Pagaré'], answer: 'Remito', explanation: 'El remito acompaña el traslado y la entrega de las mercaderías.', source: `${theory} · Remito` },
  { id: 'recibo', kind: 'multiple', prompt: '¿Qué documento deja constancia de que se recibió dinero u otros valores?', options: ['Factura', 'Orden de compra', 'Recibo'], answer: 'Recibo', explanation: 'El recibo deja constancia de la recepción de dinero, cheques u otros valores.', source: `${theory} · Recibo` },
  { id: 'cheque', kind: 'multiple', prompt: 'Según el material, ¿qué es un cheque?', options: ['Una orden de pago', 'Una promesa de pago', 'Una solicitud de mercaderías'], answer: 'Una orden de pago', explanation: 'El cheque es una orden de pago escrita dirigida a un banco.', source: `${theory} · Cheque` },
  { id: 'pagare', kind: 'multiple', prompt: 'Según el material, ¿qué es un pagaré?', options: ['Una orden de compra', 'Una promesa de pago', 'Un comprobante de entrega'], answer: 'Una promesa de pago', explanation: 'El pagaré contiene el compromiso escrito de pagar una suma determinada.', source: `${theory} · Pagaré` },
  { id: 'nota-debito', kind: 'multiple', prompt: '¿Qué comunica una nota de débito al comprador?', options: ['Que aumentó su deuda', 'Que disminuyó su deuda', 'Que se entregó la mercadería'], answer: 'Que aumentó su deuda', explanation: 'La nota de débito comunica un aumento de la deuda del comprador.', source: `${theory} · Nota de débito` },
  { id: 'nota-credito', kind: 'multiple', prompt: '¿Qué comunica una nota de crédito al comprador?', options: ['Que aumentó su deuda', 'Que disminuyó su deuda', 'Que se hizo un pedido'], answer: 'Que disminuyó su deuda', explanation: 'La nota de crédito comunica una disminución de la deuda del comprador.', source: `${theory} · Nota de crédito` },
  { id: 'factura-a', kind: 'multiple', prompt: '¿Cómo presenta el IVA una Factura A según el material?', options: ['Separado del precio neto', 'Siempre oculto', 'Como una promesa de pago'], answer: 'Separado del precio neto', explanation: 'La Factura A presenta por separado precio neto, IVA y total.', source: `${theory} · Factura A` },
  { id: 'factura-c', kind: 'multiple', prompt: '¿Qué indica el material sobre el IVA en una Factura C?', options: ['Se discrimina', 'No se discrimina', 'Aumenta la deuda'], answer: 'No se discrimina', explanation: 'En la Factura C no se discrimina el IVA.', source: `${theory} · Factura C` },
  { id: 'pn-concepto', kind: 'multiple', prompt: '¿Qué representa el Patrimonio Neto?', options: ['Las deudas con terceros', 'La parte que pertenece a los propietarios', 'Solo el efectivo'], answer: 'La parte que pertenece a los propietarios', explanation: 'El Patrimonio Neto representa la parte del patrimonio que pertenece a los propietarios.', source: `${theory} · Patrimonio neto` },
  { id: 'vf-orden', kind: 'true-false', prompt: 'Una orden de compra acredita que la mercadería ya fue entregada.', options: ['Verdadero', 'Falso'], answer: 'Falso', explanation: 'La orden de compra demuestra el pedido; no acredita la entrega ni el pago.', source: `${theory} · Orden de compra` },
  { id: 'vf-remito', kind: 'true-false', prompt: 'El remito acompaña el traslado de las mercaderías.', options: ['Verdadero', 'Falso'], answer: 'Verdadero', explanation: 'Esa es la función del remito indicada en el material.', source: `${theory} · Remito` },
  { id: 'vf-ecuacion', kind: 'true-false', prompt: 'La ecuación patrimonial estática es Activo = Pasivo + Patrimonio Neto.', options: ['Verdadero', 'Falso'], answer: 'Verdadero', explanation: 'El documento presenta exactamente esa relación.', source: `${theory} · Ecuación patrimonial estática` },
  { id: 'vf-cheque', kind: 'true-false', prompt: 'El cheque es una promesa de pago y el pagaré una orden de pago.', options: ['Verdadero', 'Falso'], answer: 'Falso', explanation: 'El cheque es una orden de pago; el pagaré, una promesa de pago.', source: `${theory} · Síntesis para recordar` },
  { id: 'clas-efectivo', kind: 'classification', prompt: 'Sofía Medina tiene dinero en efectivo. ¿Es Activo o Pasivo?', options: ['Activo', 'Pasivo'], answer: 'Activo', explanation: 'El efectivo es un bien que posee: integra el Activo.', source: `${theory} · PRÁCTICA CONTABLE · Sofía Medina` },
  { id: 'clas-mercaderias', kind: 'classification', prompt: 'Sofía Medina tiene mercaderías destinadas a la venta. ¿Es Activo o Pasivo?', options: ['Activo', 'Pasivo'], answer: 'Activo', explanation: 'Las mercaderías son bienes que posee: integran el Activo.', source: `${theory} · PRÁCTICA CONTABLE · Sofía Medina` },
  { id: 'clas-cobrar', kind: 'classification', prompt: 'Hay personas que le deben dinero a Sofía Medina con pagarés. ¿Es Activo o Pasivo?', options: ['Activo', 'Pasivo'], answer: 'Activo', explanation: 'Es un derecho a cobrar: integra el Activo.', source: `${theory} · PRÁCTICA CONTABLE · Sofía Medina` },
  { id: 'clas-pagar', kind: 'classification', prompt: 'Sofía Medina entregó pagarés de su firma a terceros. ¿Es Activo o Pasivo?', options: ['Activo', 'Pasivo'], answer: 'Pasivo', explanation: 'Representan una obligación frente a terceros: integran el Pasivo.', source: `${theory} · PRÁCTICA CONTABLE · Sofía Medina` },
  { id: 'calc-pn-1', kind: 'calculation', prompt: 'Activo $95.000 y Pasivo $28.000. ¿Cuánto es el Patrimonio Neto?', options: ['$67.000', '$123.000', '$28.000'], answer: '$67.000', explanation: 'Patrimonio Neto = Activo − Pasivo: $95.000 − $28.000 = $67.000.', source: `${theory} · PRÁCTICA CONTABLE · ejercicio 1` },
  { id: 'calc-activo', kind: 'calculation', prompt: 'Pasivo $36.000 y Patrimonio Neto $54.000. ¿Cuánto es el Activo?', options: ['$18.000', '$90.000', '$54.000'], answer: '$90.000', explanation: 'Activo = Pasivo + Patrimonio Neto: $36.000 + $54.000 = $90.000.', source: `${theory} · PRÁCTICA CONTABLE · ejercicio 1` },
  { id: 'calc-pasivo', kind: 'calculation', prompt: 'Activo $120.500 y Patrimonio Neto $72.500. ¿Cuánto es el Pasivo?', options: ['$48.000', '$193.000', '$72.500'], answer: '$48.000', explanation: 'Pasivo = Activo − Patrimonio Neto: $120.500 − $72.500 = $48.000.', source: `${theory} · PRÁCTICA CONTABLE · ejercicio 1` },
  { id: 'calc-sofia', kind: 'calculation', prompt: 'Sofía tiene Activo $369.000 y Pasivo $92.000. ¿Cuánto es su Patrimonio Neto?', options: ['$277.000', '$461.000', '$92.000'], answer: '$277.000', explanation: 'Con los importes del ejercicio, $369.000 − $92.000 = $277.000.', source: `${theory} · PRÁCTICA CONTABLE · Sofía Medina` },
];

const kinds: QuizKind[] = ['multiple', 'true-false', 'classification', 'calculation'];
function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function newQuiz(): QuizQuestion[] {
  const required = kinds.map(kind => shuffle(quizQuestions.filter(question => question.kind === kind))[0]);
  return shuffle([...required, ...shuffle(quizQuestions.filter(question => !required.includes(question))).slice(0, 6)]);
}
