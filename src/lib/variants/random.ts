// Generador pseudoaleatorio determinista (mulberry32). Misma semilla, misma secuencia.
export interface Rng {
  int(min: number, max: number): number;
  pick<T>(list: readonly T[]): T;
  sample<T>(list: readonly T[], count: number): T[];
}

export function createRng(seed: number): Rng {
  let state = (Math.imul(seed >>> 0, 2654435761) ^ 0x9e3779b9) >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next(); next(); next();
  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1));
  return {
    int,
    pick: list => list[int(0, list.length - 1)],
    sample: (list, count) => {
      const copy = [...list];
      for (let i = 0; i < count; i++) {
        const j = int(i, copy.length - 1);
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.slice(0, count);
    },
  };
}
