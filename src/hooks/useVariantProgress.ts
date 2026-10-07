import { useCallback, useRef, useState } from 'react';
import type { Answers } from '../data/activityTypes';
import type { ActivityProgress } from './useLocalProgress';

export const VARIANTS_KEY = 'edu-app-contable:variants:v1';
export const MAX_STORED_VARIANTS = 30;

export interface VariantRecord extends ActivityProgress { seed: number; updatedAt: number }
interface Store { version: 1; variants: Record<string, VariantRecord> }

const empty = (): Store => ({ version: 1, variants: {} });
const emptyRecord = (seed: number): VariantRecord => ({ seed, started: true, answers: {}, attempts: 0, completed: false, readyForReview: false, updatedAt: Date.now() });

function read(): { store: Store; error: boolean } {
  try {
    const stored = localStorage.getItem(VARIANTS_KEY);
    if (!stored) return { store: empty(), error: false };
    const parsed: unknown = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object' || !('variants' in parsed) || !parsed.variants || typeof parsed.variants !== 'object') return { store: empty(), error: false };
    const variants: Record<string, VariantRecord> = {};
    for (const [id, raw] of Object.entries(parsed.variants)) {
      if (!raw || typeof raw !== 'object') continue;
      const value = raw as Partial<VariantRecord>;
      if (!Number.isInteger(value.seed)) continue;
      const answers: Answers = {};
      if (value.answers && typeof value.answers === 'object') for (const [field, answer] of Object.entries(value.answers)) if (typeof answer === 'string') answers[field] = answer;
      variants[id] = {
        seed: Number(value.seed), started: Boolean(value.started), answers,
        attempts: Number.isSafeInteger(value.attempts) && Number(value.attempts) >= 0 ? Number(value.attempts) : 0,
        completed: Boolean(value.completed), readyForReview: Boolean(value.readyForReview),
        updatedAt: Number.isFinite(value.updatedAt) ? Number(value.updatedAt) : 0,
      };
    }
    return { store: { version: 1, variants }, error: false };
  } catch { return { store: empty(), error: true }; }
}

// Si se supera el tope, se descartan primero las consignas sin completar más antiguas y después las completadas más antiguas.
function trim(variants: Record<string, VariantRecord>, keep: string): Record<string, VariantRecord> {
  const ids = Object.keys(variants);
  if (ids.length <= MAX_STORED_VARIANTS) return variants;
  const removable = ids.filter(id => id !== keep).sort((a, b) => Number(variants[a].completed) - Number(variants[b].completed) || variants[a].updatedAt - variants[b].updatedAt);
  const next = { ...variants };
  for (const id of removable.slice(0, ids.length - MAX_STORED_VARIANTS)) delete next[id];
  return next;
}

export function useVariantProgress() {
  const [initial] = useState(read);
  const [store, setStore] = useState(initial.store);
  const [storageError, setStorageError] = useState(initial.error);
  const current = useRef(store);

  const commit = useCallback((next: Store) => {
    current.current = next;
    setStore(next);
    try { localStorage.setItem(VARIANTS_KEY, JSON.stringify(next)); setStorageError(false); }
    catch { setStorageError(true); }
  }, []);

  const update = useCallback((id: string, seed: number, mutate: (record: VariantRecord) => VariantRecord) => {
    const previous = current.current.variants[id] ?? emptyRecord(seed);
    const variants = trim({ ...current.current.variants, [id]: { ...mutate(previous), updatedAt: Date.now() } }, id);
    commit({ version: 1, variants });
  }, [commit]);

  const seedOf = (id: string) => current.current.variants[id]?.seed ?? Number(id.split('~')[1]);
  const startActivity = useCallback((id: string) => {
    if (!current.current.variants[id]) update(id, Number(id.split('~')[1]), record => record);
  }, [update]);
  const saveAnswers = useCallback((id: string, answers: Answers) => update(id, seedOf(id), record => ({ ...record, answers, completed: false, readyForReview: false })), [update]);
  const recordResult = useCallback((id: string, correct: boolean, review: boolean) => update(id, seedOf(id), record => ({ ...record, attempts: record.attempts + 1, completed: record.completed || (correct && !review), readyForReview: correct && review })), [update]);
  const resetVariants = useCallback(() => {
    current.current = empty();
    setStore(current.current);
    try { localStorage.removeItem(VARIANTS_KEY); setStorageError(false); }
    catch { setStorageError(true); }
  }, []);

  return { variants: store.variants, storageError, startActivity, saveAnswers, recordResult, resetVariants };
}
