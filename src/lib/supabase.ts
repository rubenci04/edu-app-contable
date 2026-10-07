import type { SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

/** false = faltan las variables de entorno: la app queda en modo local (Fase 1). */
export const supabaseConfigured = Boolean(url && publishableKey);

let client: Promise<SupabaseClient> | null = null;

/** Carga el cliente solo cuando hace falta. Devuelve null sin variables de entorno. Solo usa la publishable key. */
export function getSupabase(): Promise<SupabaseClient> | null {
  if (!supabaseConfigured) return null;
  client ??= import('@supabase/supabase-js').then(({ createClient }) => createClient(url as string, publishableKey as string));
  return client;
}
