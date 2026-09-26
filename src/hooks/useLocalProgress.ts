import { useEffect, useState } from 'react';

const KEY = 'edu-app-contable:progress:v1';
type Progress = { version: 1; completedActivityIds: string[] };
const emptyProgress = (): Progress => ({ version: 1, completedActivityIds: [] });

export function useLocalProgress() {
  const [storageError, setStorageError] = useState(false);
  const [progress] = useState<Progress>(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (!stored) return emptyProgress();
      const parsed: unknown = JSON.parse(stored);
      if (typeof parsed === 'object' && parsed !== null && 'version' in parsed && parsed.version === 1 &&
          'completedActivityIds' in parsed && Array.isArray(parsed.completedActivityIds) &&
          parsed.completedActivityIds.every((id: unknown) => typeof id === 'string')) {
        return { version: 1, completedActivityIds: [...new Set(parsed.completedActivityIds as string[])] };
      }
    } catch { /* Datos inválidos: iniciar un estado vacío sin interrumpir la aplicación. */ }
    return emptyProgress();
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(progress)); }
    catch { setStorageError(true); }
  }, [progress]);

  return { progress, storageError };
}
