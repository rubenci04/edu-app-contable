// Datos para generar consignas variantes de la Orden de compra.
// Archivo pensado para que la profesora lo revise y corrija: son solo listas, sin lógica.
//
// REGLAS PARA EDITAR
// - Agregar entradas AL FINAL de cada lista. No reordenar ni borrar: el número de consigna
//   (?v=número) depende del orden, y cambiarlo altera las consignas ya compartidas.
// - Todo lo marcado TODO_TEACHER_CONFIRMATION es provisorio y necesita criterio de la docente.
// - Un proveedor sin `taxId` NO se usa en las consignas: apenas se complete el CUIT, entra solo.
// - Los CUIT solo pueden ser los que figuran en el material docente. No se inventan CUIT.

export interface SupplierData {
  name: string;
  /** Domicilio tal como se escribe en la consigna y se espera en el campo "Dirección del proveedor". */
  address: string;
  addressAccepted?: string[];
  /** Cómo aparece la ubicación en la consigna (puede incluir la provincia). */
  localityText: string;
  /** Respuesta esperada en "Localidad / provincia". */
  locality: string;
  localityAccepted?: string[];
  /** CUIT. Falta (undefined) = pendiente de la docente; ese proveedor no se usa todavía. */
  taxId?: string;
  /** 'material' = sale del material docente. Otro valor = dato provisorio a confirmar. */
  status: 'material' | 'TODO_TEACHER_CONFIRMATION';
}

export interface ArticleData {
  singular: string;
  plural: string;
  /** Concordancia de "cada una" / "cada uno". */
  each: 'una' | 'uno';
  /** Otras descripciones que también se aceptan como correctas. */
  accepted?: string[];
  /** Cantidades posibles: de mínimo a máximo. TODO_TEACHER_CONFIRMATION en todos los casos. */
  quantity: readonly [min: number, max: number];
  /** Precios unitarios posibles, en pesos. TODO_TEACHER_CONFIRMATION en todos los casos. */
  prices: readonly number[];
  status: 'material' | 'TODO_TEACHER_CONFIRMATION';
}

// TODO_TEACHER_CONFIRMATION: nombres, domicilios y localidades provisorios (ficticios). Revisar que
// ninguno coincida con un comercio real. Solo Ledesma y Los Libritos salen del material docente.
// TODO_TEACHER_CONFIRMATION: Los Libritos figura en el material como CLIENTE (Remito); usarlo como
// proveedor es provisorio.
export const suppliers: readonly SupplierData[] = [
  { name: 'Ledesma', address: 'Calle San Martín N.º 234', addressAccepted: ['San Martín 234', 'Calle San Martín 234'], localityText: 'Jujuy', locality: 'Jujuy', taxId: '30-87824728-1', status: 'material' },
  { name: 'Los Libritos', address: 'Larrea 338', localityText: 'Miramar, Provincia de Buenos Aires', locality: 'Miramar', localityAccepted: ['Miramar, Provincia de Buenos Aires', 'Miramar Buenos Aires'], taxId: '30-22197295-2', status: 'material' },
  // TODO_TEACHER_CONFIRMATION: completar `taxId` (CUIT) en cada uno de los siguientes.
  { name: 'Papelera del Plata', address: 'Calle Belgrano N.º 120', addressAccepted: ['Belgrano 120', 'Calle Belgrano 120'], localityText: 'Mendoza', locality: 'Mendoza', status: 'TODO_TEACHER_CONFIRMATION' },
  { name: 'Distribuidora Sierra', address: 'Calle Mitre N.º 455', addressAccepted: ['Mitre 455', 'Calle Mitre 455'], localityText: 'Salta', locality: 'Salta', status: 'TODO_TEACHER_CONFIRMATION' },
  { name: 'Mayorista Norte', address: 'Calle Sarmiento N.º 78', addressAccepted: ['Sarmiento 78', 'Calle Sarmiento 78'], localityText: 'Tucumán', locality: 'Tucumán', status: 'TODO_TEACHER_CONFIRMATION' },
  { name: 'Insumos Pampeanos', address: 'Calle Rivadavia N.º 910', addressAccepted: ['Rivadavia 910', 'Calle Rivadavia 910'], localityText: 'Santa Fe', locality: 'Santa Fe', status: 'TODO_TEACHER_CONFIRMATION' },
  { name: 'Comercial Andina', address: 'Calle Moreno N.º 312', addressAccepted: ['Moreno 312', 'Calle Moreno 312'], localityText: 'San Luis', locality: 'San Luis', status: 'TODO_TEACHER_CONFIRMATION' },
  { name: 'Librería Mayorista Litoral', address: 'Calle Urquiza N.º 64', addressAccepted: ['Urquiza 64', 'Calle Urquiza 64'], localityText: 'Entre Ríos', locality: 'Entre Ríos', status: 'TODO_TEACHER_CONFIRMATION' },
];

// Artículos de librería. Los primeros siete aparecen en el material docente (nombre y presentación);
// los precios y cantidades de TODOS son provisorios: TODO_TEACHER_CONFIRMATION.
export const articles: readonly ArticleData[] = [
  { singular: 'caja de resmas', plural: 'cajas de resmas', each: 'una', accepted: ['Resmas, cajas'], quantity: [5, 30], prices: [40000, 45000, 50000, 55000, 60000], status: 'material' },
  { singular: 'caja de cuadernos A4', plural: 'cajas de cuadernos A4', each: 'una', accepted: ['Cuadernos A4, cajas'], quantity: [5, 30], prices: [15000, 18000, 20000, 22000, 25000], status: 'material' },
  { singular: 'pegamento vinílico por 250 grs', plural: 'pegamentos vinílicos por 250 grs', each: 'uno', accepted: ['Pegamento vinílico 250 grs', 'Pegamento vinílico por 250 gramos'], quantity: [10, 40], prices: [3500, 4000, 4500, 5000], status: 'material' },
  { singular: 'block oficio de 80 hojas', plural: 'blocks oficio de 80 hojas', each: 'uno', accepted: ['Block oficio 80 hojas'], quantity: [10, 40], prices: [7000, 8000, 9000], status: 'material' },
  { singular: 'carpeta de 3 anillos A4', plural: 'carpetas de 3 anillos A4', each: 'una', quantity: [5, 30], prices: [9000, 10000, 11000, 12000], status: 'material' },
  { singular: 'abrochadora', plural: 'abrochadoras', each: 'una', quantity: [3, 20], prices: [13000, 15000, 17000], status: 'material' },
  { singular: 'caja de broches Mit N.º 50 (5000 unidades)', plural: 'cajas de broches Mit N.º 50 (5000 unidades)', each: 'una', accepted: ['Caja de broches Mit N 50 5000 unidades'], quantity: [5, 30], prices: [2500, 3000, 3500], status: 'material' },
  // TODO_TEACHER_CONFIRMATION: los tres siguientes son sugerencias nuevas, no figuran en el material.
  { singular: 'caja de lapiceras azules', plural: 'cajas de lapiceras azules', each: 'una', quantity: [5, 30], prices: [8000, 10000, 12000], status: 'TODO_TEACHER_CONFIRMATION' },
  { singular: 'caja de marcadores', plural: 'cajas de marcadores', each: 'una', quantity: [5, 30], prices: [12000, 15000, 18000], status: 'TODO_TEACHER_CONFIRMATION' },
  { singular: 'caja de lápices negros', plural: 'cajas de lápices negros', each: 'una', quantity: [5, 30], prices: [6000, 8000, 10000], status: 'TODO_TEACHER_CONFIRMATION' },
];

// TODO_TEACHER_CONFIRMATION: rango de números de orden, de años y de días permitidos.
// Los días llegan hasta el 28 para que toda fecha sea válida en cualquier mes.
export const orderNumberRange = [1, 999] as const;
export const years: readonly number[] = [2026];
export const dayRange = [1, 28] as const;
export const monthNames: readonly string[] = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
