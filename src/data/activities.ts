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
const sale = (answer: 'Contado' | 'Cuenta corriente' = 'Cuenta corriente'): ActivityField => ({ id: 'saleCondition', label: 'Condición de venta', kind: 'choice', validation: 'text', answer, options: saleOptions, hint: 'Revisá la condición de venta. Volvé a leer cómo se realizó la operación.' });
const idField = (id: string, label: string, answer: string, hint: string): ActivityField => ({ id, label, kind: 'identifier', validation: 'identifier', answer, hint });
const teacher = (id: string, label: string, kind: 'text' | 'money' | 'identifier' | 'choice' = 'text'): ActivityField => ({ id, label, kind, validation: 'teacher', hint: 'Este dato necesita indicación docente.', placeholder: 'Pendiente de indicación docente', options: kind === 'choice' ? saleOptions : undefined });
const invoiceType = (answer: 'A' | 'B' | 'C'): ActivityField => ({ id: 'type', label: 'Tipo de factura', kind: 'choice', validation: 'text', answer, options: [{ value: 'A', label: 'Factura A' }, { value: 'B', label: 'Factura B' }, { value: 'C', label: 'Factura C' }], hint: 'Revisá el tipo de factura que muestra el modelo del PDF.' });
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

const baseActivities: Activity[] = [
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
      invoiceType('A'),
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
    teacherReviewTitle: 'IVA y total pendientes de indicación docente',
    theoryPath: '/aprender/factura-a', nextId: 'factura-b',
  },
  {
    id: 'factura-b', title: 'Factura B', documentType: 'FACTURA', documentMark: 'B',
    source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad N.º 4 · página 4',
    statement: ['En el día de la fecha, Pisapapeles vende al contado según Factura N.º 00056423 a Catalina Romano, consumidora final, con domicilio en Calle San Martín N.º 345, Ordóñez: 2 carpetas de 3 anillos A4 a $10.000 cada una, 1 abrochadora a $15.000 y 1 caja de broches Mit N.º 50 (5000 unidades) a $3.000.', 'El modelo de la actividad es una Factura B.'],
    issuer, headFieldCount: 3,
    fields: [
      invoiceType('B'), idField('number', 'Número de factura', '00056423', 'Revisá el número de factura.'), date(),
      text('party', 'Cliente', 'Catalina Romano', 'Revisá el nombre de la compradora.'),
      text('address', 'Domicilio', 'Calle San Martín N.º 345', 'Revisá el domicilio de la compradora.', ['San Martín 345']),
      text('locality', 'Localidad', 'Ordóñez', 'Revisá la localidad.'),
      text('ivaCondition', 'Condición frente al IVA', 'Consumidor final', 'La consigna identifica a la compradora como consumidora final.'),
      sale('Contado'),
    ],
    items: [
      item('item1', 'Artículo 1', 2, 'Carpetas de 3 anillos A4', 10000, ['Carpeta de 3 anillos A4']),
      item('item2', 'Artículo 2', 1, 'Abrochadora', 15000),
      item('item3', 'Artículo 3', 1, 'Caja de broches Mit N.º 50 (5000 unidades)', 3000, ['Caja de broches Mit N 50 5000 unidades']),
    ],
    totals: [number('total', 'Total', 38000, 'Sumá los importes de los tres artículos.')],
    theoryPath: '/aprender/factura-b', nextId: 'factura-c',
  },
  {
    id: 'factura-c', title: 'Factura C', documentType: 'FACTURA', documentMark: 'C',
    source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad N.º 5 · página 5',
    statement: ['En el día de la fecha, el taller mecánico de Ayrton Senna realiza un trabajo de puesta a punto de un Ford Focus de Alberto Ramírez, consumidor final, con domicilio en Calle Sarmiento N.º 890, Ordóñez. Importe: $200.000.', 'El modelo del PDF es una Factura C; la consigna no proporciona número ni condición de venta.'],
    issuer: { name: 'Taller mecánico de Ayrton Senna', address: 'Ordóñez, Provincia de Córdoba' }, headFieldCount: 3,
    fields: [
      invoiceType('C'), teacher('number', 'Número de factura', 'identifier'), date(),
      text('party', 'Cliente', 'Alberto Ramírez', 'Revisá el nombre del cliente.'),
      text('address', 'Domicilio', 'Calle Sarmiento N.º 890', 'Revisá el domicilio del cliente.', ['Sarmiento 890']),
      text('locality', 'Localidad', 'Ordóñez', 'Revisá la localidad.'),
      text('ivaCondition', 'Condición frente al IVA', 'Consumidor final', 'La consigna indica consumidor final.'),
      teacher('saleCondition', 'Condición de venta', 'choice'),
    ],
    items: [item('item1', 'Servicio', 1, 'Puesta a punto de un Ford Focus', 200000, ['Puesta a punto Ford Focus'])],
    totals: [number('total', 'Total', 200000, 'Revisá el importe del trabajo indicado en la consigna.')],
    teacherReviewTitle: 'Número y condición de venta pendientes',
    teacherReviewNote: 'TODO_TEACHER_CONFIRMATION: La Actividad N.º 5 no da número de factura ni indica si la venta fue al contado o en cuenta corriente. Los campos quedan disponibles sin validación automática y la Factura C espera indicación docente para completarse.',
    theoryPath: '/aprender/factura-c', nextId: 'nota-de-debito',
  },
  {
    id: 'nota-de-debito', title: 'Nota de débito', documentType: 'NOTA DE DÉBITO', documentMark: 'A',
    source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad N.º 6 · página 6; datos del cliente de la Actividad N.º 2',
    statement: ['En el día de la fecha, Pisapapeles envía a Los Libritos la Nota de Débito N.º 00023456 por gastos de flete de $15.000, vinculada con el Remito N.º 0002341 y la Factura A N.º 00065445.', 'El PDF muestra casillas para IVA y total, pero no indica una tasa aplicable a este cargo.'],
    issuer,
    fields: [
      idField('number', 'Número de nota', '00023456', 'Revisá el número de la nota de débito.'), date(),
      text('party', 'Cliente', 'Los Libritos', 'Revisá el destinatario de la nota.'),
      text('address', 'Domicilio', 'Larrea 338', 'Consultá el domicilio del cliente en el Remito N.º 0002341.'),
      text('locality', 'Localidad', 'Miramar', 'Consultá la localidad en el remito.'),
      idField('taxId', 'CUIT del cliente', '30-22197295-2', 'Consultá el CUIT en el remito.'),
      sale(), idField('relatedRemito', 'Remito relacionado', '0002341', 'Revisá el número de remito.'),
      idField('relatedInvoice', 'Factura relacionada', '00065445', 'Revisá la factura indicada en la consigna.'),
    ],
    items: [{ id: 'item1', label: 'Cargo', fields: [text('item1.description', 'Descripción', 'Gastos de flete', 'Revisá el motivo de la nota.', ['Gastos de fletes', 'Flete']), number('item1.amount', 'Importe', 15000, 'Revisá el importe del flete.') ] }],
    totals: [number('subtotal', 'Subtotal', 15000, 'Revisá el importe del cargo.'), teacher('vatRate', 'IVA (%)'), teacher('vatAmount', 'Importe de IVA', 'money'), teacher('total', 'Total', 'money')],
    teacherReviewTitle: 'IVA y total pendientes de indicación docente',
    teacherReviewNote: 'TODO_TEACHER_CONFIRMATION: La Actividad N.º 6 muestra campos de IVA y total, pero no proporciona tasa de IVA para el flete. Se valida el cargo de $15.000; IVA y total quedan sin corrección automática.',
    theoryPath: '/aprender/nota-de-debito', nextId: 'nota-de-credito',
  },
  {
    id: 'nota-de-credito', title: 'Nota de crédito', documentType: 'NOTA DE CRÉDITO', documentMark: 'A',
    source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad N.º 7 · página 7; precio unitario de la Actividad N.º 2',
    statement: ['En el día de la fecha, Pisapapeles envía a Los Libritos la Nota de Crédito N.º 00023421 por la devolución de 2 blocks oficio de 80 hojas deteriorados, según Remito N.º 0002341 y Factura A N.º 00065445.', 'El Remito de la Actividad N.º 2 indica un precio de $8.000 por cada block.'],
    issuer,
    fields: [
      idField('number', 'Número de nota', '00023421', 'Revisá el número de la nota de crédito.'), date(),
      text('party', 'Cliente', 'Los Libritos', 'Revisá el destinatario de la nota.'),
      text('address', 'Domicilio', 'Larrea 338', 'Consultá el domicilio en el remito.'),
      text('locality', 'Localidad', 'Miramar', 'Consultá la localidad en el remito.'),
      idField('taxId', 'CUIT del cliente', '30-22197295-2', 'Consultá el CUIT en el remito.'),
      sale(), idField('relatedRemito', 'Remito relacionado', '0002341', 'Revisá el número de remito.'),
      idField('relatedInvoice', 'Factura relacionada', '00065445', 'Revisá la factura indicada en la consigna.'),
    ],
    items: [item('item1', 'Artículo devuelto', 2, 'Block oficio de 80 hojas', 8000, ['Blocks oficio de 80 hojas'])],
    totals: [number('subtotal', 'Subtotal', 16000, 'Multiplicá 2 blocks por $8.000.'), teacher('vatRate', 'IVA (%)'), teacher('vatAmount', 'Importe de IVA', 'money'), teacher('total', 'Total', 'money')],
    teacherReviewTitle: 'IVA y total pendientes de indicación docente',
    teacherReviewNote: 'TODO_TEACHER_CONFIRMATION: La Actividad N.º 7 permite calcular $16.000 por los dos blocks, pero no indica una tasa de IVA para determinar el total de la Nota de Crédito. IVA y total no se validan automáticamente.',
    theoryPath: '/aprender/nota-de-credito', nextId: 'recibo',
  },
  {
    id: 'recibo', title: 'Recibo', documentType: 'RECIBO', documentMark: 'X',
    source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad N.º 8 · página 8; datos del cliente de la Actividad N.º 2',
    statement: ['En el día de la fecha, Pisapapeles recibe de Los Libritos $151.680 en efectivo como pago proporcional a cuenta de la Factura A N.º 00065445, según Recibo N.º 0001212.'],
    issuer, sectionTitle: 'Datos del pago',
    fields: [
      idField('number', 'Número de recibo', '0001212', 'Revisá el número del recibo.'), date(),
      text('party', 'Quién paga', 'Los Libritos', 'Revisá quién entrega el dinero.'),
      text('address', 'Domicilio', 'Larrea 338', 'Consultá el domicilio del cliente en el remito.'),
      text('locality', 'Localidad', 'Miramar', 'Consultá la localidad en el remito.'),
      idField('taxId', 'CUIT', '30-22197295-2', 'Consultá el CUIT en el remito.'),
      number('amount', 'Importe recibido', 151680, 'Revisá el importe recibido en efectivo.'),
      text('amountWords', 'Importe en letras', 'Ciento cincuenta y un mil seiscientos ochenta pesos', 'Escribí en letras el importe de $151.680.', ['Ciento cincuenta y un mil seiscientos ochenta']),
      text('concept', 'Concepto', 'Pago a cuenta de la Factura A N.º 00065445', 'Revisá a qué factura se aplica el pago.', ['Pago parcial de la Factura A N.º 00065445', 'Pago a cuenta de la factura 00065445']),
      text('paymentMethod', 'Forma de pago', 'Efectivo', 'Revisá cómo se recibió el dinero.'),
    ],
    items: [], totals: [], theoryPath: '/aprender/recibo', nextId: 'pagare',
  },
  {
    id: 'pagare', title: 'Pagaré', documentType: 'PAGARÉ', documentMark: '',
    source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad N.º 9 · página 9',
    statement: ['Completá el Pagaré N.º 053. Lugar y fecha: Ordóñez, 20 de abril de 2026. Beneficiario: Raúl Rosso, Calle 25 N.º 987, Ordóñez. Importe: $12.000. Vencimiento: 60 días. Firmante: Marcelo Gómez, Calle 46 N.º 345, Ordóñez, teléfono 15662536. Concepto: venta de mercaderías. Lugar de pago: Calle 25 N.º 987, Ordóñez.'],
    issuer: { name: 'Marcelo Gómez', address: 'Calle 46 N.º 345, Ordóñez' }, sectionTitle: 'Datos de la promesa de pago',
    fields: [
      idField('number', 'Número de pagaré', '053', 'Revisá el número del pagaré.'),
      { id: 'date', label: 'Fecha de emisión', kind: 'date', validation: 'text', answer: '20/04/2026', accepted: ['20 de abril de 2026'], hint: 'Revisá la fecha de emisión indicada en el PDF.' },
      text('place', 'Lugar de emisión', 'Ordóñez', 'Revisá el lugar de emisión.'),
      text('beneficiary', 'Beneficiario', 'Raúl Rosso', 'Revisá quién tiene derecho a cobrar.'),
      text('beneficiaryAddress', 'Domicilio del beneficiario', 'Calle 25 N.º 987, Ordóñez', 'Revisá el domicilio de Raúl Rosso.', ['Calle 25 987 Ordóñez']),
      number('amount', 'Importe', 12000, 'Revisá el importe del pagaré.'),
      text('amountWords', 'Importe en letras', 'Doce mil pesos', 'Escribí $12.000 en letras.', ['Doce mil']),
      text('due', 'Vencimiento', '60 días', 'Revisá el plazo de vencimiento.', ['A 60 días']),
      text('signer', 'Firmante o librador', 'Marcelo Gómez', 'Revisá quién se compromete a pagar.'),
      text('signerAddress', 'Domicilio del firmante', 'Calle 46 N.º 345, Ordóñez', 'Revisá el domicilio de Marcelo Gómez.', ['Calle 46 345 Ordóñez']),
      idField('phone', 'Teléfono del firmante', '15662536', 'Revisá el teléfono indicado en el PDF.'),
      text('concept', 'Concepto', 'Venta de mercaderías', 'Revisá qué originó la deuda.'),
      text('paymentPlace', 'Lugar de pago', 'Calle 25 N.º 987, Ordóñez', 'Revisá el lugar de pago.', ['Calle 25 987 Ordóñez']),
    ],
    items: [], totals: [], theoryPath: '/aprender/pagare', nextId: 'cheque',
  },
  {
    id: 'cheque', title: 'Cheque', documentType: 'CHEQUE COMÚN', documentMark: '',
    source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad N.º 10 · página 9',
    statement: ['En el día de la fecha se confecciona un cheque común por $14.530. Firmante o pagador: Garbarino SRL. Beneficiaria o cobradora: Carmen Rotondo.'],
    issuer: { name: 'Garbarino SRL' }, headFieldCount: 1, sectionTitle: 'Datos del cheque',
    fields: [
      date(), text('beneficiary', 'Beneficiaria o cobradora', 'Carmen Rotondo', 'Revisá a quién se paga.'),
      number('amount', 'Importe', 14530, 'Revisá el importe indicado en la consigna.'),
      text('amountWords', 'Importe en letras', 'Catorce mil quinientos treinta pesos', 'Escribí $14.530 en letras.', ['Catorce mil quinientos treinta']),
      text('signer', 'Firmante o pagador', 'Garbarino SRL', 'Revisá quién emite el cheque.'),
    ],
    items: [], totals: [], theoryPath: '/aprender/cheque', nextId: 'patrimonio/patrimonio-neto',
  },
];

// Solo actividades sin IVA ni TODO_TEACHER_CONFIRMATION: importe = cantidad × precio unitario y total = suma de importes.
const autoCalculatedIds = ['orden-de-compra', 'remito', 'factura-b'];
const withAutoCalculation = (activity: Activity): Activity => ({
  ...activity,
  items: activity.items.map(line => ({
    ...line,
    fields: line.fields.map(field => field.id === `${line.id}.amount`
      ? { ...field, calculated: 'amount' as const, hint: 'El importe se calcula solo. Revisá la cantidad y el precio unitario de este artículo.' }
      : field),
  })),
  totals: activity.totals.map(field => field.id === 'total'
    ? { ...field, calculated: 'total' as const, hint: 'El total se calcula solo. Revisá las cantidades y los precios unitarios de los artículos.' }
    : field),
});

export const activities: Activity[] = baseActivities.map(activity => autoCalculatedIds.includes(activity.id) ? withAutoCalculation(activity) : activity);
export const getActivity =(id: string | undefined) => activities.find(activity => activity.id === id);
export const allActivityFields = (activity: Activity) => [...activity.fields, ...activity.items.flatMap(line => line.fields), ...activity.totals];
