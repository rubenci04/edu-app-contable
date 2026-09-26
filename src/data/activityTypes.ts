export type Answers = Record<string, string>;
export type FieldKind = 'text' | 'identifier' | 'date' | 'choice' | 'quantity' | 'money';
export type ValidationKind = 'text' | 'identifier' | 'quantity' | 'money' | 'date' | 'teacher';

export interface ActivityField {
  id: string;
  label: string;
  kind: FieldKind;
  validation: ValidationKind;
  answer?: string | number;
  accepted?: string[];
  options?: { value: string; label: string }[];
  hint: string;
  placeholder?: string;
}

export interface ActivityItem {
  id: string;
  label: string;
  fields: ActivityField[];
}

export interface Activity {
  id: string;
  title: string;
  documentType: string;
  documentMark: string;
  source: string;
  statement: string[];
  issuer: { name: string; address?: string; taxId?: string };
  fields: ActivityField[];
  items: ActivityItem[];
  totals: ActivityField[];
  headFieldCount?: number;
  sectionTitle?: string;
  theoryPath: string;
  nextId?: string;
  teacherReviewNote?: string;
  teacherReviewTitle?: string;
}

export interface Feedback {
  fieldId: string;
  message: string;
  status: 'error' | 'review';
}

export interface ValidationResult {
  correct: boolean;
  needsTeacherReview: boolean;
  feedback: Feedback[];
}
