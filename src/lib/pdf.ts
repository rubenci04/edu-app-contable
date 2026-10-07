// Generador mínimo de PDF (A4, Helvetica estándar) que corre en el navegador, sin dependencias ni red.
export interface PdfRow { label: string; value: string }
export interface PdfSection { title?: string; subtitle?: string; rows: PdfRow[] }
export interface PdfModel {
  title: string;
  heading?: { name: string; lines: string[]; type: string; mark?: string };
  sections: PdfSection[];
  statusLines: string[];
}
export interface PdfStudent { name: string; age: number; course: string }

const W = 595.28, H = 841.89, M = 44, FOOT = 52, LINE = 13.5, LABEL_W = 150;
type Rgb = [number, number, number];
const INK: Rgb = [0, 0, 0], SOFT: Rgb = [.3, .3, .3], PINK: Rgb = [.984, .835, .886], WINE: Rgb = [.56, .133, .286], RULE: Rgb = [.7, .7, .7];

const REG = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
const BOLD = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584];

const replacements: Record<string, string> = { '−': '-', '–': '-', '—': '-', '“': '"', '”': '"', '‘': "'", '’': "'", '…': '...', '•': '*' };
const latin1 = (s: string) => s.replace(/[\r\n\t]+/g, ' ').replace(/[^\x00-\xff]/g, c => replacements[c] ?? '?');
const escapeText = (s: string) => latin1(s).replace(/[\\()]/g, '\\$&');

function textWidth(s: string, bold: boolean, size: number): number {
  const table = bold ? BOLD : REG;
  let total = 0;
  for (const char of latin1(s)) {
    const base = char.normalize('NFD')[0].charCodeAt(0);
    total += base >= 32 && base <= 126 ? table[base - 32] : 556;
  }
  return total * size / 1000;
}

function wrap(text: string, bold: boolean, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let current = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = current ? `${current} ${word}` : word;
      if (textWidth(candidate, bold, size) <= maxWidth) { current = candidate; continue; }
      if (current) lines.push(current);
      current = '';
      let piece = '';
      for (const char of word) {
        if (textWidth(piece + char, bold, size) > maxWidth && piece) { lines.push(piece); piece = ''; }
        piece += char;
      }
      current = piece;
    }
    lines.push(current);
  }
  return lines;
}

class Layout {
  pages: string[][] = [];
  y = 0;
  constructor(private runningTitle: string, private stamp: string) { this.newPage(); }

  private current = 0;
  private get ops() { return this.pages[this.current]; }
  private color(c: Rgb) { return `${c[0]} ${c[1]} ${c[2]}`; }

  text(x: number, baseline: number, s: string, size: number, bold = false, color: Rgb = INK) {
    this.ops.push(`BT /${bold ? 'F2' : 'F1'} ${size} Tf ${this.color(color)} rg ${x.toFixed(2)} ${(H - baseline).toFixed(2)} Td (${escapeText(s)}) Tj ET`);
  }
  rect(x: number, top: number, w: number, h: number, fill?: Rgb, stroke?: Rgb) {
    const geometry = `${x.toFixed(2)} ${(H - top - h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re`;
    if (fill) this.ops.push(`${this.color(fill)} rg ${geometry} f`);
    if (stroke) this.ops.push(`${this.color(stroke)} RG 0.8 w ${geometry} S`);
  }
  hline(top: number, color: Rgb = RULE, x1 = M, x2 = W - M) {
    this.ops.push(`${this.color(color)} RG 0.5 w ${x1.toFixed(2)} ${(H - top).toFixed(2)} m ${x2.toFixed(2)} ${(H - top).toFixed(2)} l S`);
  }
  centered(baseline: number, s: string, size: number, bold = false, color: Rgb = SOFT) {
    this.text((W - textWidth(s, bold, size)) / 2, baseline, s, size, bold, color);
  }
  right(baseline: number, s: string, size: number, bold = false, color: Rgb = SOFT, edge = W - M) {
    this.text(edge - textWidth(s, bold, size), baseline, s, size, bold, color);
  }

  newPage() {
    const first = this.pages.length === 0;
    this.pages.push([]);
    this.current = this.pages.length - 1;
    if (first) {
      this.rect(0, 0, W, 78, PINK);
      this.rect(0, 0, 8, 78, WINE);
      this.text(M, 38, 'Edu App Contable', 22, true, WINE);
      this.text(M, 60, this.runningTitle, 13, true, INK);
      this.right(60, this.stamp, 9, false, SOFT);
      this.y = 100;
    } else {
      this.text(M, 34, 'Edu App Contable', 9, true, WINE);
      this.right(34, this.runningTitle, 9, false, SOFT);
      this.hline(42);
      this.y = 62;
    }
  }
  ensure(height: number) { if (this.y + height > H - FOOT) this.newPage(); }

  student(student: PdfStudent | null) {
    if (!student) return;
    this.ensure(46);
    this.rect(M, this.y, W - 2 * M, 38, undefined, RULE);
    const cols: [string, string, number][] = [['ALUMNO', student.name, M + 10], ['EDAD', String(student.age), M + (W - 2 * M) * .58], ['CURSO', student.course, M + (W - 2 * M) * .72]];
    for (const [label, value, x] of cols) {
      this.text(x, this.y + 14, label, 7.5, true, SOFT);
      this.text(x, this.y + 29, value, 11, true);
    }
    this.y += 52;
  }

  heading(box: NonNullable<PdfModel['heading']>) {
    const height = 20 + Math.max(1, box.lines.length) * 12 + 16;
    this.ensure(height + 10);
    this.rect(M, this.y, W - 2 * M, height, undefined, INK);
    this.text(M + 12, this.y + 22, box.name, 13, true);
    box.lines.forEach((line, i) => this.text(M + 12, this.y + 38 + i * 12, line, 9, false, SOFT));
    let edge = W - M - 12;
    this.right(this.y + 24, box.type, 13, true, WINE, edge);
    if (box.mark) {
      const boxX = edge - textWidth(box.type, true, 13) - 40;
      this.rect(boxX, this.y + 8, 28, 22, undefined, WINE);
      this.text(boxX + (28 - textWidth(box.mark, true, 14)) / 2, this.y + 25, box.mark, 14, true, WINE);
    }
    this.y += height + 16;
  }

  section(section: PdfSection) {
    const first = section.rows[0];
    const firstHeight = first ? this.rowHeight(first) : 0;
    this.ensure((section.title ? 28 : 0) + (section.subtitle ? 20 : 0) + firstHeight);
    if (section.title) {
      this.rect(M, this.y, W - 2 * M, 18, PINK);
      this.text(M + 8, this.y + 12.5, section.title.toUpperCase(), 9, true, WINE);
      this.y += 22;
    }
    if (section.subtitle) { this.text(M + 2, this.y + 11, section.subtitle, 10, true); this.y += 17; }
    for (const row of section.rows) this.row(row);
    this.y += 12;
  }

  private valueWidth(row: PdfRow) { return row.label ? W - 2 * M - LABEL_W - 10 : W - 2 * M - 10; }
  private labelLines(row: PdfRow) { return row.label ? wrap(row.label, true, 9, LABEL_W - 14) : []; }
  private rowHeight(row: PdfRow) { return Math.max(wrap(row.value, false, 10.5, this.valueWidth(row)).length * LINE, this.labelLines(row).length * 12) + 6; }

  row(row: PdfRow) {
    const lines = wrap(row.value, false, 10.5, this.valueWidth(row));
    const height = this.rowHeight(row);
    this.ensure(height);
    this.labelLines(row).forEach((line, i) => this.text(M + 4, this.y + 13 + i * 12, line, 9, true, SOFT));
    const x = row.label ? M + LABEL_W : M + 4;
    lines.forEach((line, i) => this.text(x, this.y + 13 + i * LINE, line, 10.5));
    this.y += height;
    this.hline(this.y);
  }

  status(lines: string[]) {
    const height = 14 + lines.length * 16;
    this.ensure(height + 6);
    this.rect(M, this.y, W - 2 * M, height, undefined, INK);
    this.rect(M, this.y, 6, height, WINE);
    lines.forEach((line, i) => this.text(M + 18, this.y + 19 + i * 16, line, i === 0 ? 12 : 10.5, i === 0));
    this.y += height + 6;
  }

  finish(): string[] {
    const total = this.pages.length;
    for (let index = 0; index < total; index++) {
      this.current = index;
      this.hline(H - 40);
      this.centered(H - 26, 'Developer: Rubén E. Albarracín', 8.5);
      this.right(H - 26, `Página ${index + 1} de ${total}`, 8.5);
    }
    return this.pages.map(ops => ops.join('\n'));
  }
}

export function createPdf(model: PdfModel, student: PdfStudent | null, when = new Date()): Uint8Array<ArrayBuffer> {
  const pad = (n: number) => String(n).padStart(2, '0');
  const stamp = `${pad(when.getDate())}/${pad(when.getMonth() + 1)}/${when.getFullYear()} ${pad(when.getHours())}:${pad(when.getMinutes())}`;
  const layout = new Layout(model.title, stamp);
  layout.student(student);
  if (model.heading) layout.heading(model.heading);
  model.sections.forEach(section => layout.section(section));
  layout.status(model.statusLines);
  const streams = layout.finish();

  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    `<< /Type /Pages /Kids [${streams.map((_, i) => `${5 + i * 2} 0 R`).join(' ')}] /Count ${streams.length} >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
  ];
  streams.forEach((stream, i) => {
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${6 + i * 2} 0 R >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  objects.push(`<< /Title (${escapeText(`Edu App Contable - ${model.title}`)}) /Producer (Edu App Contable) >>`);

  let body = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((object, i) => { offsets.push(body.length); body += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map(o => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Uint8Array.from(body, char => char.charCodeAt(0));
}
