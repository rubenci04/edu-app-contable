import type { Lesson, LessonGroupId } from './lessonTypes';

// Teoría y resúmenes: docs/Teoria_documentos_comerciales_y_patrimonio.docx.
// Los ejemplos tomados del PDF práctico llevan su actividad y página.
// No completar campos ausentes con reglas o ejemplos ajenos a las fuentes.
export const theorySource = 'Teoria_documentos_comerciales_y_patrimonio.docx';
const theoryExample = 'Material teórico';

export const lessonGroups: { id: LessonGroupId; title: string; description: string }[] = [
  { id: 'documentos-comerciales', title: 'DOCUMENTOS COMERCIALES', description: 'Conocé los comprobantes, sus funciones y sus diferencias.' },
  { id: 'patrimonio', title: 'PATRIMONIO', description: 'Bienes, derechos y obligaciones: de los conceptos a la ecuación patrimonial.' },
];

// Una única comparación, utilizada por la lección general de Factura.
export const invoiceComparison = [
  { lessonId: 'factura-a', title: 'Factura A', issuer: 'Responsable inscripto', recipient: 'Responsable inscripto', vat: 'Discriminado' },
  { lessonId: 'factura-b', title: 'Factura B', issuer: 'Responsable inscripto', recipient: 'Consumidor final, monotributista o exento', vat: 'Incluido en el total' },
  { lessonId: 'factura-c', title: 'Factura C', issuer: 'Monotributista o sujeto exento', recipient: 'Cliente, según corresponda', vat: 'No se discrimina' },
];

export const lessons: Lesson[] = [
  {
    id: 'documentos-comerciales', group: 'documentos-comerciales', title: 'Concepto de documentos comerciales',
    summary: 'Qué son y para qué sirven.',
    concept: 'Los documentos comerciales son comprobantes escritos que dejan constancia de las operaciones realizadas por una empresa o un comerciante, como compras, ventas, pagos, cobros y traslados de mercaderías.',
    purpose: [
      'Comprobar que una operación comercial se realizó.',
      'Identificar a las personas o empresas que participaron.',
      'Servir de base para registrar las operaciones en la contabilidad.',
      'Facilitar el control de la entrada y salida de dinero y mercaderías.',
      'Actuar como medio de prueba ante reclamos o desacuerdos.',
      'Contribuir al cumplimiento de las obligaciones impositivas y legales.',
    ],
    remember: 'Los documentos deben confeccionarse correctamente y conservarse durante el plazo establecido por la legislación vigente.',
    related: ['orden-de-compra', 'remito', 'factura'], practiceId: 'documentos-comerciales', practicePath: '/practicar', sourceSection: 'Concepto de documentos comerciales',
  },
  {
    id: 'orden-de-compra', group: 'documentos-comerciales', title: 'Orden de compra', summary: 'La intención de comprar.',
    concept: 'La orden de compra es el documento que el comprador envía al vendedor para solicitar determinadas mercaderías o servicios.',
    explanation: [{ title: 'Qué expresa', paragraphs: ['Expresa la intención de comprar en las condiciones indicadas.'] }],
    example: { title: 'Un pedido de la escuela', paragraphs: ['Una escuela solicita mediante una orden de compra veinte resmas de papel a una librería.'], source: theoryExample },
    remember: 'Demuestra que se realizó un pedido, pero no acredita que la mercadería haya sido entregada ni pagada.',
    related: ['remito', 'recibo'], practiceId: 'orden-de-compra', practicePath: '/practicar/orden-de-compra', sourceSection: 'Orden de compra',
  },
  {
    id: 'remito', group: 'documentos-comerciales', title: 'Remito', summary: 'El traslado y la entrega de mercaderías.',
    concept: 'El remito es el documento que acompaña el traslado y la entrega de las mercaderías.',
    example: { title: 'El envío a Los Libritos', paragraphs: ['Pisapapeles confecciona el Remito N.º 0002341 por la venta en cuenta corriente a Los Libritos. Envía 22 pegamentos vinílicos de 250 gramos y 15 blocks oficio de 80 hojas.', 'La entrega se realiza en la dirección de Los Libritos mediante el transporte Andreani.'], source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad 2 · página 2' },
    remember: 'Permite comprobar que los productos fueron enviados y recibidos por el comprador.',
    related: ['orden-de-compra', 'factura'], practiceId: 'remito', practicePath: '/practicar/remito', sourceSection: '2. Remito',
  },
  {
    id: 'factura', group: 'documentos-comerciales', title: 'Factura', summary: 'La operación y el importe a pagar.',
    concept: 'La factura es el documento que el vendedor entrega al comprador para comunicarle el importe de las mercaderías vendidas o de los servicios prestados.',
    example: { title: 'Una factura relacionada con un remito', paragraphs: ['La Factura A N.º 00065445 corresponde a la venta en cuenta corriente a Los Libritos según el Remito N.º 0002341.'], source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad 3 · página 3' },
    comparison: 'invoices',
    remember: 'Acredita la operación e informa cantidades, precios, impuestos y total a pagar.',
    related: ['remito', 'nota-de-debito', 'nota-de-credito'], practiceId: 'facturas', practicePath: '/practicar', sourceSection: '3. Factura y Comparación de facturas',
  },
  {
    id: 'factura-a', group: 'documentos-comerciales', title: 'Factura A', summary: 'Precio neto, IVA y total por separado.',
    concept: 'La factura A es emitida, por lo general, por un responsable inscripto en IVA cuando realiza una operación con otro responsable inscripto.',
    example: { title: 'El ejemplo del material', items: ['Precio neto: $100.000.', 'IVA 21 %: $21.000.', 'Total: $121.000.'], source: theoryExample },
    remember: 'Presenta por separado el precio neto, el IVA y el importe total.',
    related: ['factura', 'factura-b', 'factura-c'], practiceId: 'factura-a', practicePath: '/practicar/factura-a', sourceSection: 'Factura A',
  },
  {
    id: 'factura-b', group: 'documentos-comerciales', title: 'Factura B', summary: 'El IVA incluido en el total.',
    concept: 'La factura B es emitida por un responsable inscripto cuando vende a consumidores finales, monotributistas o sujetos exentos.',
    example: { title: 'La compra de un electrodoméstico', paragraphs: ['Un consumidor final compra un electrodoméstico y recibe una factura B.'], source: theoryExample },
    remember: 'El IVA está incluido en el precio total y no se presenta discriminado para el comprador.',
    related: ['factura', 'factura-a', 'factura-c'], practiceId: 'factura-b', practicePath: '/practicar/factura-b', sourceSection: 'Factura B',
  },
  {
    id: 'factura-c', group: 'documentos-comerciales', title: 'Factura C', summary: 'Un comprobante sin IVA discriminado.',
    concept: 'La factura C es emitida principalmente por monotributistas y sujetos exentos, según corresponda.',
    explanation: [{ title: 'El IVA en este comprobante', paragraphs: ['El emisor no liquida este impuesto como responsable inscripto.'] }],
    example: { title: 'Un servicio de reparación', paragraphs: ['Un monotributista presta un servicio de reparación y entrega una factura C.'], source: theoryExample },
    remember: 'En la factura C no se discrimina el IVA.',
    related: ['factura', 'factura-a', 'factura-b'], practiceId: 'factura-c', practicePath: '/practicar/factura-c', sourceSection: 'Factura C',
  },
  {
    id: 'nota-de-debito', group: 'documentos-comerciales', title: 'Nota de débito', summary: 'Un aumento de la deuda del comprador.',
    concept: 'La nota de débito es el documento que el vendedor emite para comunicarle al comprador que aumentó el importe de su deuda.',
    explanation: [{ title: 'Puede originarse por', items: ['Intereses por pago fuera de término.', 'Gastos de transporte o flete no incluidos en la factura.', 'Errores de facturación que produjeron un importe menor al correcto.', 'Otros conceptos que incrementen la deuda del comprador.'] }],
    example: { title: 'Intereses sobre una deuda', paragraphs: ['Si el comprador debía $50.000 y se cargan $2.000 de intereses, deberá $52.000.'], source: theoryExample },
    remember: 'Para el vendedor aumenta el derecho a cobrar y para el comprador aumenta la deuda.',
    related: ['nota-de-credito', 'factura'], practiceId: 'nota-de-debito', practicePath: '/practicar/nota-de-debito', sourceSection: '4. Nota de débito',
  },
  {
    id: 'nota-de-credito', group: 'documentos-comerciales', title: 'Nota de crédito', summary: 'Una disminución de la deuda del comprador.',
    concept: 'La nota de crédito es el documento que el vendedor emite para comunicarle al comprador que disminuyó el importe de su deuda.',
    explanation: [{ title: 'Puede originarse por', items: ['Devolución de mercaderías.', 'Descuentos o bonificaciones.', 'Errores de facturación por importes cobrados de más.', 'Mercaderías dañadas o entregadas en menor cantidad.', 'Anulación total o parcial de una operación.'] }],
    example: { title: 'Una devolución de mercaderías', paragraphs: ['Si el comprador debía $50.000 y devuelve mercaderías por $5.000, deberá $45.000.'], source: theoryExample },
    remember: 'Para el vendedor disminuye el derecho a cobrar y para el comprador disminuye la deuda.',
    related: ['nota-de-debito', 'factura'], practiceId: 'nota-de-credito', practicePath: '/practicar/nota-de-credito', sourceSection: '5. Nota de crédito',
  },
  {
    id: 'recibo', group: 'documentos-comerciales', title: 'Recibo', summary: 'La constancia de un pago.',
    concept: 'El recibo es el documento que una persona entrega a otra para dejar constancia de que recibió dinero, cheques u otros valores.',
    explanation: [
      { title: 'Quiénes intervienen', items: ['Pagador: realiza el pago.', 'Cobrador o beneficiario: recibe el valor y emite el recibo.'] },
      { title: 'Qué debe indicar', items: ['Lugar y fecha.', 'Nombre de quien paga.', 'Importe en números y letras.', 'Concepto y forma de pago.', 'Firma de quien recibe.'] },
    ],
    example: { title: 'Un pago parcial', paragraphs: ['Pisapapeles recibe de Los Libritos $151.680 en efectivo a cuenta de la Factura A N.º 00065445, según el Recibo N.º 0001212.'], source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad 8 · página 8' },
    remember: 'Sirve como comprobante de pago y demuestra que una deuda fue cancelada total o parcialmente.',
    related: ['factura', 'cheque'], practiceId: 'recibo', practicePath: '/practicar/recibo', sourceSection: '6. Recibo',
  },
  {
    id: 'cheque', group: 'documentos-comerciales', title: 'Cheque', summary: 'Una orden de pago.',
    concept: 'El cheque es una orden de pago escrita mediante la cual una persona dispone que un banco pague una determinada suma de dinero a otra persona.',
    explanation: [
      { title: 'Quiénes intervienen', items: ['Librador o firmante: emite y firma el cheque.', 'Banco girado: entidad que debe efectuar el pago.', 'Beneficiario: persona que recibe o cobra el cheque.'] },
      { title: 'Cheque común', paragraphs: ['Es pagadero desde el momento de su presentación al banco. Para que sea abonado, el librador debe tener fondos suficientes en su cuenta o autorización para girar en descubierto.'] },
    ],
    example: { title: 'El cheque del material práctico', items: ['Importe: $14.530.', 'Firmante o pagador: Garbarino SRL.', 'Beneficiario o cobrador: Carmen Rotondo.'], source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad 10 · página 9' },
    remember: 'El cheque es una orden de pago; el pagaré es una promesa de pago.',
    related: ['pagare', 'recibo'], practiceId: 'cheque', practicePath: '/practicar/cheque', sourceSection: '7. Cheque y Síntesis para recordar',
  },
  {
    id: 'pagare', group: 'documentos-comerciales', title: 'Pagaré', summary: 'Una promesa de pago.',
    concept: 'El pagaré es una promesa escrita mediante la cual una persona se compromete a pagar una suma determinada de dinero a otra, en una fecha y lugar establecidos.',
    explanation: [
      { title: 'Quiénes intervienen', items: ['Firmante o librador: persona que se compromete a pagar.', 'Beneficiario o tomador: persona que tiene derecho a cobrar.'] },
      { title: 'Qué debe contener', items: ['Denominación pagaré y promesa de pago.', 'Lugar y fecha de emisión.', 'Importe en números y letras.', 'Nombre del beneficiario.', 'Fecha de vencimiento y lugar de pago.', 'Firma del librador.'] },
    ],
    example: { title: 'El pagaré N.º 053', paragraphs: ['Marcelo Gómez es el firmante o librador y Raúl Rosso es el beneficiario. El importe es de $12.000 y el vencimiento es a 60 días.', 'Se emite en Ordóñez el 20 de abril de 2026 por una venta de mercaderías. El lugar de pago es Calle 25 N.º 987, Ordóñez.'], source: 'DOCUMENTOS COMERCIALES PDF.pdf · Actividad 9 · página 9' },
    remember: 'El firmante se compromete a pagar y el beneficiario tiene derecho a cobrar.',
    related: ['cheque', 'activo', 'pasivo'], practiceId: 'pagare', practicePath: '/practicar/pagare', sourceSection: '8. Pagaré',
  },
  {
    id: 'patrimonio', group: 'patrimonio', title: 'Patrimonio', summary: 'Bienes, derechos y obligaciones.',
    concept: 'El patrimonio es el conjunto de bienes, derechos y obligaciones pertenecientes a una persona o empresa.',
    purpose: ['Permite conocer su situación económica y financiera en un momento determinado.'],
    explanation: [
      { title: 'Bienes', paragraphs: ['Elementos materiales o inmateriales que posee.'], items: ['Dinero, mercaderías, muebles y vehículos.'] },
      { title: 'Derechos', paragraphs: ['Importes que otras personas le deben.'], items: ['Clientes y documentos a cobrar.'] },
      { title: 'Obligaciones', paragraphs: ['Deudas que mantiene con terceros.'], items: ['Proveedores y préstamos bancarios.'] },
    ],
    remember: 'Activo: lo que la empresa posee y tiene derecho a cobrar. Pasivo: lo que debe. Patrimonio Neto: la parte que pertenece a los propietarios.',
    related: ['activo', 'pasivo', 'patrimonio-neto', 'ecuacion-patrimonial-estatica'], practiceId: 'patrimonio', practicePath: '/practicar/patrimonio/sofia-medina', sourceSection: 'Patrimonio y Síntesis para recordar',
  },
  {
    id: 'activo', group: 'patrimonio', title: 'Activo', summary: 'Lo que posee y tiene derecho a cobrar.',
    concept: 'El activo representa todos los bienes y derechos que posee una empresa.',
    example: { title: 'Ejemplos de bienes y derechos', items: ['Bienes: dinero en efectivo o depositado en bancos, mercaderías, muebles, maquinarias, vehículos, inmuebles y equipos de computación.', 'Derechos: importes adeudados por clientes, documentos a cobrar y otros valores pendientes de cobro.'], source: theoryExample },
    remember: 'Activo es todo lo que la empresa posee y todo lo que tiene derecho a cobrar.',
    related: ['patrimonio', 'pasivo', 'ecuacion-patrimonial-estatica'], practiceId: 'patrimonio', practicePath: '/practicar/patrimonio/activo', sourceSection: 'Activo',
  },
  {
    id: 'pasivo', group: 'patrimonio', title: 'Pasivo', summary: 'Las deudas y obligaciones con terceros.',
    concept: 'El pasivo representa todas las deudas y obligaciones que la empresa tiene con terceros.',
    example: { title: 'Ejemplos de deudas y obligaciones', items: ['Deudas con proveedores.', 'Préstamos bancarios.', 'Sueldos, impuestos y servicios pendientes de pago.', 'Documentos a pagar.'], source: theoryExample },
    remember: 'Pasivo es todo lo que la empresa debe.',
    related: ['patrimonio', 'activo', 'ecuacion-patrimonial-estatica'], practiceId: 'patrimonio', practicePath: '/practicar/patrimonio/pasivo', sourceSection: 'Pasivo',
  },
  {
    id: 'patrimonio-neto', group: 'patrimonio', title: 'Patrimonio Neto', summary: 'La parte que pertenece a los propietarios.',
    concept: 'El patrimonio neto representa la parte del patrimonio que verdaderamente pertenece a los propietarios.',
    explanation: [{ title: 'Cómo está formado', paragraphs: ['Está formado principalmente por sus aportes, las ganancias, las pérdidas y las reservas acumuladas.'] }],
    example: { title: 'Del Activo al Patrimonio Neto', paragraphs: ['Si una empresa posee un activo de $800.000 y un pasivo de $300.000, su patrimonio neto es de $500.000.'], source: theoryExample },
    remember: 'PATRIMONIO NETO = ACTIVO − PASIVO',
    related: ['activo', 'pasivo', 'ecuacion-patrimonial-estatica'], practiceId: 'patrimonio', practicePath: '/practicar/patrimonio/patrimonio-neto', sourceSection: 'Patrimonio neto',
  },
  {
    id: 'ecuacion-patrimonial-estatica', group: 'patrimonio', title: 'Ecuación patrimonial estática', summary: 'La relación entre Activo, Pasivo y Patrimonio Neto.',
    concept: 'La ecuación patrimonial estática muestra la composición del patrimonio en un momento determinado.',
    explanation: [{ title: 'Qué expresa', paragraphs: ['Los bienes y derechos fueron financiados con deudas frente a terceros y con recursos propios.'] }],
    formulas: ['PASIVO = ACTIVO − PATRIMONIO NETO', 'PATRIMONIO NETO = ACTIVO − PASIVO'],
    example: { title: 'Cálculo y comprobación', paragraphs: ['Una empresa posee un activo de $950.000 y un pasivo de $350.000.'], items: ['Patrimonio Neto = $950.000 − $350.000 = $600.000.', 'Comprobación: $950.000 = $350.000 + $600.000.'], source: theoryExample },
    remember: 'ACTIVO = PASIVO + PATRIMONIO NETO',
    related: ['activo', 'pasivo', 'patrimonio-neto'], practiceId: 'patrimonio', practicePath: '/practicar/patrimonio/patrimonio-neto', sourceSection: 'Ecuación patrimonial estática, Fórmulas derivadas y Ejemplo de aplicación',
  },
];

export const lessonPath = (id: string) => `/aprender/${id}`;
export const getLesson = (id: string | undefined) => lessons.find(lesson => lesson.id === id);
