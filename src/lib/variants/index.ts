import { BASE_ID, generateOrdenDeCompra, parseSeed } from './ordenDeCompra';
import type { GeneratedVariant } from './ordenDeCompra';

export type { GeneratedVariant };
export { parseSeed };

const generators: Record<string, (seed: number) => GeneratedVariant> = { [BASE_ID]: generateOrdenDeCompra };

export const supportsVariants = (activityId: string) => activityId in generators;
export const generateVariant = (activityId: string, seed: number) => generators[activityId]?.(seed);

export function randomSeed(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return 1 + (buffer[0] % 999999);
}
