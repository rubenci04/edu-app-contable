import { useCallback, useRef, useState } from 'react';
import type { Answers } from '../data/activityTypes';

const KEY = 'edu-app-contable:progress:v2';
const LEGACY_KEY = 'edu-app-contable:progress:v1';

export interface ActivityProgress {
  started: boolean;
  answers: Answers;
  attempts: number;
  completed: boolean;
  readyForReview: boolean;
}

interface Progress { version: 2; activities: Record<string, ActivityProgress> }
const empty = (): Progress => ({ version: 2, activities: {} });
const emptyActivity = (): ActivityProgress => ({ started: true, answers: {}, attempts: 0, completed: false, readyForReview: false });

function readProgress(): { progress: Progress; error: boolean } {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null && 'version' in parsed && parsed.version === 2 && 'activities' in parsed && typeof parsed.activities === 'object' && parsed.activities !== null) {
        const activities: Record<string, ActivityProgress> = {};
        for (const [id, record] of Object.entries(parsed.activities)) {
          if (!record || typeof record !== 'object') continue;
          const value = record as Partial<ActivityProgress>;
          const answers: Answers = {};
          if (value.answers && typeof value.answers === 'object') {
            for (const [field, answer] of Object.entries(value.answers)) if (typeof answer === 'string') answers[field] = answer;
          }
          activities[id] = { started: Boolean(value.started), answers, attempts: Number.isSafeInteger(value.attempts) && Number(value.attempts) >= 0 ? Number(value.attempts) : 0, completed: Boolean(value.completed), readyForReview: Boolean(value.readyForReview) };
        }
        return { progress: { version: 2, activities }, error: false };
      }
    }
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const parsed: unknown = JSON.parse(legacy);
      if (typeof parsed === 'object' && parsed !== null && 'completedActivityIds' in parsed && Array.isArray(parsed.completedActivityIds)) {
        const activities: Progress['activities'] = {};
        for (const id of parsed.completedActivityIds) if (typeof id === 'string') activities[id] = { ...emptyActivity(), completed: true };
        return { progress: { version: 2, activities }, error: false };
      }
    }
    return { progress: empty(), error: false };
  } catch { return { progress: empty(), error: true }; }
}

export function useLocalProgress() {
  const [initial] = useState(readProgress);
  const [progress, setProgress] = useState(initial.progress);
  const [storageError, setStorageError] = useState(initial.error);
  const current = useRef(progress);

  const update = useCallback((id: string, mutate: (record: ActivityProgress) => ActivityProgress) => {
    const previous = current.current.activities[id] ?? emptyActivity();
    const next = { ...current.current, activities: { ...current.current.activities, [id]: mutate(previous) } };
    current.current = next;
    setProgress(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); setStorageError(false); }
    catch { setStorageError(true); }
  }, []);

  const startActivity = useCallback((id: string) => {
    if (!current.current.activities[id]) update(id, record => record);
  }, [update]);
  const saveAnswers = useCallback((id: string, answers: Answers) => update(id, record => ({ ...record, answers, completed: false, readyForReview: false })), [update]);
  const recordResult = useCallback((id: string, correct: boolean, review: boolean) => update(id, record => ({ ...record, attempts: record.attempts + 1, completed: record.completed || (correct && !review), readyForReview: correct && review })), [update]);

  return { progress, storageError, startActivity, saveAnswers, recordResult };
}
