// Spike del paso 1 (Fase 2): ¿Supabase Auth acepta el email interno usuario@campus.local?
// Uso: npm run spike:auth   (lo ejecuta la persona responsable del proyecto, no el asistente)
// Crea UN usuario descartable. Al terminar, borralo desde el panel de Supabase (instrucciones al final).
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';

function loadEnv() {
  const env = { ...process.env };
  try {
    for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match && !(match[1] in env)) env[match[1]] = match[2];
    }
  } catch { /* sin .env.local: se usan las variables del sistema */ }
  return env;
}

const env = loadEnv();
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) { console.error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_PUBLISHABLE_KEY en .env.local.'); process.exit(1); }

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const user = `spike${randomBytes(3).toString('hex')}`;
const password = randomBytes(9).toString('base64url');
const domains = ['campus.local', 'alumnos.invalid'];

console.log('Spike de email interno · se prueba un dominio por vez y se frena en el primero que Auth acepte.\n');
let accepted = null;
for (const domain of domains) {
  const email = `${user}@${domain}`;
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    console.log(`@${domain}: RECHAZADO -> [${error.status ?? '?'}] ${error.code ?? ''} ${error.message}`);
    continue;
  }
  accepted = { domain, email, hasSession: Boolean(data.session), userId: data.user?.id, confirmedAt: data.user?.email_confirmed_at ?? null };
  console.log(`@${domain}: ACEPTADO (usuario creado, id ${accepted.userId}).`);
  break;
}

if (!accepted) {
  console.log('\nNingún dominio fue aceptado. No se creó ningún usuario. Pasale esta salida al asistente para proponer otra alternativa.');
  process.exit(0);
}

console.log(`\nConfirmación de email: ${accepted.hasSession ? 'DESACTIVADA (el alta devolvió sesión directamente)' : 'ACTIVADA (el alta no devolvió sesión; falta confirmar el email)'}`);
const login = await supabase.auth.signInWithPassword({ email: accepted.email, password });
console.log(login.error
  ? `Login: FALLÓ -> ${login.error.code ?? ''} ${login.error.message}`
  : 'Login: OK con usuario y contraseña.');

console.log(`
LIMPIEZA (obligatoria): el cliente no puede borrar usuarios con la publishable key.
  1. Panel de Supabase -> tu proyecto -> Authentication -> Users.
  2. Buscá "${accepted.email}".
  3. Menú "..." de la fila -> Delete user -> confirmar.
Si la confirmación de email está activada, el alta pudo intentar enviar un correo a @${accepted.domain}; no se entrega y no tiene consecuencias salvo gastar parte del límite de correos de Auth.`);
