export type LessonGroupId = 'documentos-comerciales' | 'patrimonio';

export interface LessonBlock {
  title: string;
  paragraphs?: string[];
  items?: string[];
}

export interface Lesson {
  id: string;
  group: LessonGroupId;
  title: string;
  summary: string;
  concept: string;
  explanation?: LessonBlock[];
  purpose?: string[];
  example?: LessonBlock & { source: string };
  remember: string;
  formulas?: string[];
  related: string[];
  practiceId: string;
  practicePath: '/practicar' | `/practicar/${string}`;
  sourceSection: string;
  comparison?: 'invoices';
}
