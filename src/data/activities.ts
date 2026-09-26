import type { Activity, ActivityField, ActivityItem } from './activityTypes';

const issuer = {
  name: 'Pisapapeles',
  address: 'Calle 43 N.º 567, Ordóñez, Provincia de Córdoba',
  taxId: '20-16009082-1',
};
const saleOptions = [
  { value: 'Contado', label: 'Contado' },
  { value: 'Cuenta corriente', label: 'Cuenta corriente' },
];
const text = (id: string, label: string, answer: string, hint: string, accepted?: string[]): ActivityField => ({ id, label, kind: 'text', validation: 'text', answer, hint, accepted });
const number = (id: string, label: string, answer: number, hint: string, kind: 'quantity' | 'money' = 'money'): ActivityField => ({ id, label, kind, validation: kind, answer, hint });
const date = (): ActivityField => ({ id: 'date', label: 'Fecha', kind: 'date', validation: 'date', hint: 'Ingresá una fecha válida con formato DD/MM/AAAA. La consigna no indica un día concreto para corregir.' });
const sale = (): ActivityField => ({ id: 'saleCondition', label: 'Condición de venta', kind: 'choice', validation: 'text', answer: 'Cuenta corriente', options: saleOptions, hint: 'Revisá la condición de venta. Volvé a leer cómo se realizó la operación.' });
const idField = (id: string, label: string, answer: string, hint: string): ActivityField => ({ id, label, kind: 'identifier', validation: 'identifier', answer, hint });
const item = (id: string, label: string, quantity: number, description: string, unitPrice: number, accepted?: string[]): ActivityItem => ({
  id, label,
  fields: [
    number(`${id}.quantity`, 'Cantidad', quantity, 'Revisá la cantidad indicada en la consigna.', 'quantity'),
    text(`${id}.description`, 'Descripción', description, 'Revisá el nombre y presentación del artículo.', accepted),
    number(`${id}.unitPrice`, 'Precio unitario', unitPrice, 'Revisá el precio unitario indicado en la consigna.'),
    number(`${id}.amount`, 'Importe', quantity * unitPrice, 'Revisá el importe. Recordá calcular cantidad × precio unitario.'),
  ],
});

const sharedRemitoItems = [
  item('item1', 'Artículo 1', 22, 'Pegamento vinílico por 250 grs', 4000, ['Pegamento vinílico 250 grs', '22 pegamentos vinílicos por 250 grs', 'Pegamento vinílico por 250 gramos']),
  item('item2', 'Artículo 2', 15, 'Block oficio de 80 hojas', 8000, ['Blocks oficio de 80 hojas', 'Block oficio 80 hojas']),
];

export const activities: Activity[] = [
  {
    id: 'orden-de-compra', title: 'Orden de compra', documentType: 'ORDEN DE COMPRA', documentMark: 'X',
    source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad N.º 1 · página 1',
    statement: [
      'En el día de la fecha, Pisapapeles comienza su actividad comercial dedicada al sector de librería, con ventas al mayor y menor y domicilio en Calle 43 N.º 567, Ordóñez, Provincia de Córdoba. Es responsable inscripto en IVA, N.º 20-16009082-1.',
      'Solicita en cuenta corriente, según Orden de Compra N.º 001, a su proveedor Ledesma, con domicilio en Calle San Martín N.º 234, Jujuy, responsable inscripto en IVA, CUIT N.º 30-87824728-1: 10 cajas de resmas a $50.000 cada una y 15 cajas de cuadernos A4 a $20.000 cada una.',
    ],
    issuer,
    fields: [
      idField('number', 'Número de orden', '001', 'Revisá el número de orden de compra en la consigna.'), date(),
      text('party', 'Proveedor', 'Ledesma', 'Revisá los datos del proveedor.'),
      text('address', 'Dirección del proveedor', 'Calle San Martín N.º 234', 'Revisá la dirección del proveedor.', ['San Martín 234', 'Calle San Martín 234']),
      text('locality', 'Localidad / provincia', 'Jujuy', 'Revisá la ubicación del proveedor.'),
      idField('taxId', 'CUIT del proveedor', '30-87824728-1', 'Revisá el CUIT del proveedor.'),
      sale(),
    ],
    items: [
      item('item1', 'Artículo 1', 10, 'Cajas de resmas', 50000, ['Caja de resmas', 'Resmas, cajas']),
      item('item2', 'Artículo 2', 15, 'Cajas de cuadernos A4', 20000, ['Caja de cuadernos A4', 'Cuadernos A4, cajas']),
    ],
    totals: [number('total', 'Total', 800000, 'Revisá el total: sumá los importes de ambos artículos.')],
    theoryPath: '/aprender/orden-de-compra', nextId: 'remito',
  },
  {
    id: 'remito', title: 'Remito', documentType: 'REMITO', documentMark: 'R',
    source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad N.º 2 · página 2',
    statement: [
      'En el día de la fecha, Pisapapeles confecciona el Remito N.º 0002341 por la venta en cuenta corriente a Los Libritos, con domicilio en Larrea 338, Miramar, Provincia de Buenos Aires, responsable inscripto en IVA, CUIT N.º 30-22197295-2.',
      'Envía 22 pegamentos vinílicos de 250 grs a $4.000 cada uno y 15 blocks oficio de 80 hojas a $8.000 cada uno. Lugar de entrega: dirección de Los Libritos. Forma de envío: transporte Andreani.',
    ],
    issuer,
    fields: [
      idField('number', 'Número de remito', '0002341', 'Revisá el número de remito en la consigna.'), date(),
      text('party', 'Cliente', 'Los Libritos', 'Revisá el nombre del cliente.'),
      text('address', 'Domicilio del cliente', 'Larrea 338', 'Revisá el domicilio del cliente.'),
      text('locality', 'Localidad', 'Miramar', 'Revisá la localidad del cliente.'),
      idField('taxId', 'CUIT del cliente', '30-22197295-2', 'Revisá el CUIT del cliente.'),
      sale(),
      text('deliveryPlace', 'Lugar de entrega', 'Dirección de Los Libritos', 'Revisá dónde se entregan los artículos.', ['Domicilio de Los Libritos', 'Larrea 338, Miramar']),
      text('shipping', 'Forma de envío', 'Transporte Andreani', 'Revisá el transporte indicado en la consigna.', ['Andreani']),
    ],
    items: sharedRemitoItems,
    totals: [], theoryPath: '/aprender/remito', nextId: 'factura-a',
  },
  {
    id: 'factura-a', title: 'Factura A', documentType: 'FACTURA', documentMark: 'A',
    source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad N.º 3 · página 3, vinculada con la Actividad N.º 2 · página 2',
    statement: [
      'En el día de la fecha se confecciona la Factura A N.º 00065445 por la venta en cuenta corriente a Los Libritos según el Remito N.º 0002341.',
      'Consultá los datos de la actividad de Remito para completar el cliente, los artículos, las cantidades y los precios de esta factura.',
    ],
    issuer,
    fields: [
      { id: 'type', label: 'Tipo de factura', kind: 'choice', validation: 'text', answer: 'A', options: [{ value: 'A', label: 'Factura A' }, { value: 'B', label: 'Factura B' }, { value: 'C', label: 'Factura C' }], hint: 'Revisá el tipo de factura que indica la consigna.' },
      idField('number', 'Número de factura', '00065445', 'Revisá el número de factura en la consigna.'), date(),
      text('party', 'Cliente', 'Los Libritos', 'Revisá el cliente indicado en la factura y el remito.'),
      text('address', 'Domicilio del cliente', 'Larrea 338', 'Revisá el domicilio del cliente en el remito.', ['Larrea 338, Miramar']),
      text('locality', 'Localidad', 'Miramar', 'Revisá la localidad del cliente en el remito.'),
      idField('taxId', 'CUIT del cliente', '30-22197295-2', 'Revisá el CUIT del cliente en el remito.'),
      sale(),
      idField('relatedRemito', 'Remito relacionado', '0002341', 'Revisá el número de remito relacionado.'),
    ],
    items: sharedRemitoItems,
    totals: [
      number('subtotal', 'Subtotal', 208000, 'Revisá el subtotal: sumá los importes de los artículos.'),
      { id: 'vatRate', label: 'IVA (%)', kind: 'text', validation: 'teacher', hint: 'La tasa para esta operación necesita confirmación docente.', placeholder: 'Pendiente de indicación docente' },
      { id: 'vatAmount', label: 'Importe de IVA', kind: 'money', validation: 'teacher', hint: 'El importe de IVA necesita confirmación docente.', placeholder: 'Pendiente de indicación docente' },
      { id: 'total', label: 'Total', kind: 'money', validation: 'teacher', hint: 'El total con IVA necesita confirmación docente.', placeholder: 'Pendiente de indicación docente' },
    ],
    teacherReviewNote: 'TODO_TEACHER_CONFIRMATION: El PDF no indica la tasa de IVA aplicable a la operación de Los Libritos. El ejemplo de 21 % del documento teórico corresponde a otra operación y no se extrapola. Por eso IVA y total quedan preparados, pero no se validan ni se marca la Factura A como completada automáticamente.',
    theoryPath: '/aprender/factura-a',
  },
];

export const getActivity = (id: string | undefined) => activities.find(activity => activity.id === id);
export const allActivityFields = (activity: Activity) => [...activity.fields, ...activity.items.flatMap(line => line.fields), ...activity.totals];
