# Edu App Contable — Fase 2 (aula virtual)

**Estado:** borrador v0.1 · 2026-10-07 · solo diseño: no hay código ni proyecto de Supabase creado.
**Base:** Fase 1 entregada (PWA React + Vite + TypeScript, `localStorage`, hosting estático en Cloudflare).

Este documento separa tres tipos de contenido para no mezclar lo decidido con lo propuesto:

- **Decisiones tomadas:** vienen de las definiciones acordadas y no se reabren acá.
- **Supuestos de diseño (§7):** propuestas mías para completar huecos. Hay que validarlas.
- **Preguntas abiertas (§8):** decisiones que todavía no están tomadas. No se inventó ninguna respuesta.

---

## 1. Alcance

### 1.1 Decisiones tomadas

| Tema | Decisión |
|---|---|
| Escala | 5 cursos, 40 a 50 alumnos cada uno (~250 en total) |
| Ingreso del alumno | Código de curso (lo da la profesora) + nombre de usuario + contraseña |
| Email | Interno generado `usuario@campus.local`. No se piden emails reales |
| Docente | Una cuenta con email real |
| Roles | `student` y `teacher` |
| Panel docente | Lista filtrable por curso: progreso, último puntaje, mejor puntaje, última actividad, última conexión, estado "activo" (actividad en los últimos 5 minutos) |
| Ranking | Top 10 de puntajes del juego. No se guarda el histórico completo |
| Exportación | CSV |
| Datos del alumno | Mínimos: nombre, edad, curso. Son menores de edad |
| Offline | `localStorage` y funcionamiento offline siguen siendo la base. Supabase solo sincroniza cuando hay conexión |
| Costo | Plan gratuito de Supabase |

### 1.2 Fuera de alcance de este bloque

Asistencia y notas (bloque aparte, se diseña después), chat, notificaciones, realtime avanzado. Tampoco: videollamadas, mensajería, pagos, seguimiento pantalla por pantalla.

---

## 2. Requisitos

### 2.1 Funcionales

**Cuentas y acceso**

- RF-01. El alumno se registra con código de curso, nombre de usuario, contraseña, nombre y edad. El curso queda determinado por el código.
- RF-02. El alumno inicia sesión con usuario + contraseña. La app arma internamente `usuario@campus.local`; el alumno nunca ve ni escribe ese email.
- RF-03. La docente inicia sesión con su email real y contraseña.
- RF-04. La docente puede generar, ver y desactivar el código de cada curso.
- RF-05. La docente puede restablecer la contraseña de un alumno, porque no hay email real para recuperarla.
- RF-06. La docente puede borrar la cuenta de un alumno (y todos sus datos).
- RF-07. No hay registro abierto: solo se crean alumnos con un código de curso válido y activo.

**Sincronización**

- RF-08. Sin sesión, la app funciona exactamente como en Fase 1 (todo local).
- RF-09. Con sesión, el progreso (estado por actividad, intentos, puntajes) se sube a Supabase cuando hay conexión.
- RF-10. Sin conexión, la app sigue funcionando y deja los cambios en una cola local que se envía al volver la conexión.
- RF-11. Al iniciar sesión por primera vez en un dispositivo con progreso local previo, ese progreso se conserva y se sincroniza (no se pierde).
- RF-12. Los datos del alumno se pueden ver y editar en "Mi progreso" (nombre y edad). El curso no se edita: lo define el código.

**Panel docente**

- RF-13. Lista de alumnos con filtro por curso y búsqueda por nombre.
- RF-14. Por alumno: progreso (actividades completadas de 14), último puntaje, mejor puntaje, última actividad (nombre de la actividad o "Juego"), última conexión y estado "activo".
- RF-15. "Activo" = el alumno envió señal de vida en los últimos 5 minutos (ver supuesto S-01).
- RF-16. Vista de detalle de un alumno: estado por actividad (sin empezar / en curso / completada / en revisión) e intentos.
- RF-17. Resumen por curso: cantidad de alumnos, activos ahora, promedio de progreso.
- RF-18. Exportar a CSV la lista filtrada actual.

**Ranking**

- RF-19. Ranking de los 10 mejores puntajes del juego, visible para los alumnos con sesión.
- RF-20. Solo se guarda por alumno el último y el mejor puntaje. No se guarda el histórico de partidas.
- RF-21. Alcance (por curso o general) y datos mostrados (nombre completo o nombre de pila): ver preguntas abiertas P-1 y P-2.

### 2.2 No funcionales

- RNF-01. **Costo:** debe entrar en el plan gratuito de Supabase (§3.4).
- RNF-02. **Offline:** no se rompe nada de lo verificado en Fase 1 (rutas offline, PWA, caché).
- RNF-03. **Privacidad:** datos mínimos, sin email real, sin DNI, teléfono ni dirección. Solo la docente ve datos de otros alumnos.
- RNF-04. **Seguridad:** RLS activo en todas las tablas; el cliente solo usa la clave pública (`anon`); la clave `service_role` vive únicamente en las Edge Functions.
- RNF-05. **Rendimiento:** el panel docente carga sin paginar con ~250 alumnos; el panel y Supabase JS no se cargan en la ruta de los alumnos (carga diferida).
- RNF-06. **Responsive:** 320 a 1024 px, igual que Fase 1. El panel docente se piensa primero para escritorio, pero debe ser usable en el celular.
- RNF-07. **Accesibilidad:** contraste AA con la paleta rosa actual.
- RNF-08. **Reversibilidad:** si falta la configuración de Supabase (variables de entorno), la app arranca en modo Fase 1.

---

## 3. Arquitectura propuesta

```
PWA React (localStorage = fuente de la interfaz)
   │  cola de cambios (outbox local)
   ▼
Supabase JS  ──►  Auth  (usuario@campus.local / email real docente)
             ──►  Postgres + RLS (tablas de §4)
             ──►  Edge Functions (registro, reset de clave, borrado)
```

### 3.1 Principio local-first

- La interfaz sigue leyendo y escribiendo `localStorage` como hoy (`edu-app-contable:progress:v2`, `edu-app-contable:student-profile:v1`).
- Una capa de sincronización aparte observa los cambios, los pone en una cola local nueva (`edu-app-contable:sync-queue:v1`) y los envía cuando hay conexión y sesión.
- Los **borradores** (respuestas a medio completar) **no se sincronizan** (ver S-02).

### 3.2 Reglas de combinación (merge)

Los envíos son idempotentes (`upsert`). Si hay datos en ambos lados, se combinan sin pisar avances:

| Dato | Regla |
|---|---|
| `completed` | OR: si alguna parte lo tiene completado, queda completado |
| `attempts` | máximo de ambos lados |
| `started`, `ready_for_review` | OR |
| `best_score` | máximo (además lo fuerza un trigger en la base) |
| `last_score` | el de fecha más reciente |

Esto requiere agregar marcas de tiempo al modelo local (hoy `Progress` no las tiene). Es un cambio chico del modelo local (versión 3 con migración desde la 2) y va en el paso 7 del plan.

### 3.3 Ingreso con email interno

- Supabase Auth exige un email. Se usa `usuario@campus.local`, con el `usuario` normalizado (minúsculas, `a-z 0-9 . _ -`, 3 a 20 caracteres, único en toda la plataforma).
- Hay que desactivar la confirmación de email y el registro público en Auth. El alta la hace una Edge Function que valida el código de curso y crea el usuario con el email ya confirmado.
- **Riesgo a verificar en un spike (paso 1):** que Auth acepte el dominio `.local`. Si no lo aceptara, se cambia el dominio interno (por ejemplo `@alumnos.invalid`) sin afectar el resto del diseño.
- Sin email real no hay "olvidé mi contraseña" por correo: la docente restablece la clave (RF-05).

### 3.4 Plan gratuito: estimación y límites a vigilar

Los valores concretos del plan gratuito cambian con el tiempo: **verificarlos en la página de precios de Supabase al implementar**.

| Aspecto | Estimación para este proyecto |
|---|---|
| Filas | ~250 alumnos × 14 actividades ≈ 3.500 filas de progreso, ~250 de puntajes, ~250 perfiles. Muy por debajo del límite de base de datos |
| Escrituras | Heartbeat de ~250 alumnos cada 2 min como peor caso simultáneo ≈ 7.500 actualizaciones/hora. Es bajo |
| Usuarios activos | ~251 cuentas, muy por debajo del tope mensual |
| **Pausa por inactividad** | Los proyectos gratuitos se pausan tras un período sin actividad (históricamente ~1 semana). Riesgo real en vacaciones: hay que prever reactivarlo antes de retomar clases, o un "ping" periódico |
| **Sin backups automáticos** | El plan gratuito no los incluye. La exportación CSV y un volcado manual periódico hacen de respaldo |
| Cantidad de proyectos | Hay un tope de proyectos gratuitos por cuenta |

Realtime avanzado no se usa: el panel se actualiza solo cada 30–60 s y con un botón "Actualizar".

---

## 4. Roles y reglas de seguridad (RLS)

### 4.1 Cómo se determina el rol

- El rol docente se guarda en `app_metadata.role = 'teacher'` del usuario de Auth. Ese campo **no lo puede modificar el propio usuario**, a diferencia de `user_metadata`.
- La cuenta docente se crea a mano una sola vez (panel de Supabase). Nadie puede autoasignarse ese rol.
- `profiles.role` replica el valor para la interfaz, pero las políticas usan `is_teacher()` (lee el token), no esa columna.

### 4.2 Reglas base

- **RLS activado en todas las tablas.** Sin política, no hay acceso.
- El rol `anon` no accede a nada.
- Los alumnos solo operan sobre filas cuyo `student_id` / `id` sea su propio `auth.uid()`.
- La docente solo **lee** datos de alumnos. Los cambios de los alumnos los hacen ellos, salvo reset de clave y borrado, que van por Edge Function.

### 4.3 Matriz por tabla

| Tabla | Alumno | Docente | Anónimo |
|---|---|---|---|
| `courses` | Leer su propio curso | Leer / crear / editar todos | Nada |
| `course_codes` | Nada | Leer / crear / editar | Nada |
| `profiles` | Leer su fila; editar solo `display_name`, `age`, `last_seen_at`, `last_activity_at`, `last_activity_ref` | Leer todas; editar la propia | Nada |
| `activity_progress` | Leer / insertar / actualizar / borrar las suyas | Solo leer todas | Nada |
| `quiz_scores` | Leer / insertar / actualizar la suya | Solo leer todas | Nada |
| `teacher_student_overview` | Nada (no hay política que lo permita) | Leer | Nada |
| `get_top_scores()` | Ejecutar | Ejecutar | Sin permiso de ejecución |

### 4.4 Cosas que RLS solo no resuelve

- **Columnas protegidas:** una política de `UPDATE` no limita columnas. Se resuelve con permisos por columna (`revoke update on profiles from authenticated; grant update (display_name, age, last_seen_at, last_activity_at, last_activity_ref) ...`). Así un alumno no puede cambiarse `role`, `course_id` ni `username`.
- **`best_score` monótono:** trigger `before update` que fuerza `best_score = greatest(old, new)`.
- **Puntajes sin verificación:** el juego corre en el navegador, así que un alumno técnico podría enviar un puntaje inventado. Se acepta porque es un juego de práctica, no una evaluación. Los `check` de la base solo garantizan el rango 0 a 10.
- **Alta y claves:** el alta, el reset de contraseña y el borrado usan `service_role` dentro de Edge Functions, que validan que quien llama es docente (salvo el alta, que valida el código de curso).

### 4.5 Borrador de políticas (ilustrativo)

```sql
alter table public.courses enable row level security;
alter table public.course_codes enable row level security;
alter table public.profiles enable row level security;
alter table public.activity_progress enable row level security;
alter table public.quiz_scores enable row level security;

-- profiles
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_teacher());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- activity_progress
create policy ap_select on public.activity_progress for select to authenticated
  using (student_id = auth.uid() or public.is_teacher());
create policy ap_write_own on public.activity_progress for all to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- quiz_scores: igual que activity_progress, sin delete

-- courses: el alumno ve solo el suyo
create policy courses_select on public.courses for select to authenticated
  using (public.is_teacher()
         or id = (select course_id from public.profiles where id = auth.uid()));
create policy courses_teacher_write on public.courses for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());

-- course_codes: solo docente
create policy codes_teacher on public.course_codes for all to authenticated
  using (public.is_teacher()) with check (public.is_teacher());
```

**Función de ranking** (la variante final depende de P-1 y P-2):

```sql
create function public.get_top_scores()
returns table (display_name text, best_score smallint, best_score_at timestamptz)
language sql security definer stable set search_path = public as $$
  select p.display_name, q.best_score, q.best_score_at
  from public.quiz_scores q join public.profiles p on p.id = q.student_id
  where q.best_score is not null
  order by q.best_score desc, q.best_score_at asc   -- desempate: quien llegó primero
  limit 10
$$;
revoke execute on function public.get_top_scores() from public, anon;
grant execute on function public.get_top_scores() to authenticated;
```

### 4.6 Otras medidas de seguridad

- Registro abierto deshabilitado en Auth; el alta pasa solo por la Edge Function.
- Códigos de curso aleatorios y no adivinables; la docente puede desactivarlos. La Edge Function de alta debe limitar intentos fallidos por IP para frenar el adivinado de códigos.
- Variables de entorno: URL y clave `anon` son públicas (van al build de Cloudflare); `service_role` jamás sale de las Edge Functions ni del repositorio.
- El service worker actual ignora los pedidos a otros orígenes, así que **no cachea** las respuestas de Supabase. No hay que cambiarlo para esto.
- Prueba obligatoria antes del piloto: verificar con sesión de alumno A, alumno B y docente que cada uno ve exactamente lo que dice la matriz (paso 3).

---

## 5. Modelo de datos

> Todo el SQL de esta sección es **borrador ilustrativo**: no se ejecuta nada en Supabase todavía. Las reglas de acceso están en §4.

### 5.0 Diagrama de relaciones

```
auth.users (Supabase)
    │ 1:1
    ▼
profiles ──────────┐ N:1
  │ 1:N            ▼
  │             courses ── 1:1 ── course_codes
  ├──► activity_progress  (PK: student_id + activity_id)
  └──► quiz_scores        (PK: student_id, una fila por alumno)
```

### 5.1 `courses`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `name` | text único | "4° B", etc. |
| `created_at` | timestamptz | |

### 5.2 `course_codes`

Separada de `courses` para que el código no sea legible por alumnos.

| Campo | Tipo | Notas |
|---|---|---|
| `course_id` | uuid PK, FK → courses | un código vigente por curso |
| `code` | text único | aleatorio, 8+ caracteres sin ambiguos |
| `active` | boolean | permite cerrar el alta sin borrar el código |
| `updated_at` | timestamptz | |

### 5.3 `profiles`

Una fila por cuenta (alumno o docente), con el mismo `id` que `auth.users`.

| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid PK, FK → auth.users, `on delete cascade` | |
| `role` | text | `student` o `teacher` |
| `username` | text único, nulo para docente | `^[a-z0-9._-]{3,20}$` |
| `display_name` | text | 1 a 40 caracteres |
| `age` | smallint | 10 a 99, igual que la validación actual de la app |
| `course_id` | uuid FK → courses | obligatorio para `student` |
| `created_at` | timestamptz | |
| `last_seen_at` | timestamptz | señal de vida / última conexión |
| `last_activity_at` | timestamptz | última actividad real |
| `last_activity_ref` | text | id de actividad o `juego` |

### 5.4 `activity_progress`

Una fila por alumno y actividad. Los ids son los de la app (10 documentos + 4 de patrimonio). No hay catálogo en la base: el contenido pedagógico vive en el código, y un id desconocido simplemente se ignora en el panel.

| Campo | Tipo | Notas |
|---|---|---|
| `student_id` | uuid FK → profiles, `on delete cascade` | PK compuesta |
| `activity_id` | text | PK compuesta |
| `started` | boolean | |
| `completed` | boolean | |
| `ready_for_review` | boolean | actividades con datos pendientes de confirmación docente |
| `attempts` | integer ≥ 0 | |
| `updated_at` | timestamptz | |

### 5.5 `quiz_scores`

Una sola fila por alumno: no hay histórico, solo último y mejor.

| Campo | Tipo | Notas |
|---|---|---|
| `student_id` | uuid PK, FK → profiles | |
| `last_score` | smallint 0–10 | |
| `last_played_at` | timestamptz | |
| `best_score` | smallint 0–10 | trigger: nunca baja |
| `best_score_at` | timestamptz | desempate del ranking |
| `games_played` | integer | contador, opcional (no es histórico) |

### 5.6 Vista y función

- **`teacher_student_overview`** (vista con `security_invoker`): une perfil, curso, cantidad de actividades completadas, puntajes, `last_seen_at`, `last_activity_*` y `is_active` (`last_seen_at > now() - interval '5 minutes'`). El porcentaje de progreso lo calcula el cliente con el total del catálogo (14), para no fijar ese número en la base.
- **`get_top_scores()`**: función `security definer` que devuelve el top 10. Es la **única** forma en que un alumno ve puntajes ajenos. Su alcance y los campos devueltos dependen de P-1 y P-2.

### 5.7 Borrador de SQL (ilustrativo)

```sql
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.course_codes (
  course_id uuid primary key references public.courses(id) on delete cascade,
  code text not null unique,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('student','teacher')),
  username text unique,
  display_name text not null check (char_length(display_name) between 1 and 40),
  age smallint check (age between 10 and 99),
  course_id uuid references public.courses(id),
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  last_activity_at timestamptz,
  last_activity_ref text,
  constraint student_fields check (
    role = 'teacher'
    or (username ~ '^[a-z0-9._-]{3,20}$' and course_id is not null)
  )
);

create table public.activity_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  activity_id text not null,
  started boolean not null default true,
  completed boolean not null default false,
  ready_for_review boolean not null default false,
  attempts integer not null default 0 check (attempts >= 0),
  updated_at timestamptz not null default now(),
  primary key (student_id, activity_id)
);

create table public.quiz_scores (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  last_score smallint check (last_score between 0 and 10),
  last_played_at timestamptz,
  best_score smallint check (best_score between 0 and 10),
  best_score_at timestamptz,
  games_played integer not null default 0
);

-- El rol docente vive en app_metadata (el usuario no puede editarlo).
create function public.is_teacher() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'teacher'
$$;
```

---

## 6. Privacidad y datos de menores

- **Se guarda:** nombre (texto libre), edad, curso, usuario, y actividad educativa. **No se guarda:** email real, DNI, teléfono, dirección ni datos sensibles.
- El usuario no debería contener el nombre real: se recomienda indicarlo en la pantalla de alta.
- Región del proyecto: elegir la más cercana disponible (idealmente Sudamérica) por latencia.
- Retención: propuesta de borrar las cuentas al terminar el ciclo lectivo, con exportación previa (S-07).
- La docente puede borrar a cualquier alumno (RF-06).
- Si el proyecto requiere autorizaciones o consentimientos, ver P-3. Como referencia a confirmar con quien corresponda, existe normativa argentina de protección de datos personales (Ley 25.326); esto es una pista para consultar, no un asesoramiento legal.

---

## 7. Supuestos de diseño (a validar)

No vienen de las decisiones tomadas: son mi propuesta para cubrir huecos.

| Id | Supuesto | Por qué |
|---|---|---|
| S-01 | **"Activo"** se calcula con una señal de vida (heartbeat) que la app envía cada ~2 min mientras la pestaña está visible y hay conexión, además de cada sincronización. Así un alumno que lee una lección también cuenta como activo | Si solo contaran respuestas a actividades, alguien leyendo teoría figuraría inactivo. `last_activity_at` se usa aparte para "última actividad" |
| S-02 | **Los borradores no se sincronizan**, solo estado por actividad, intentos y puntajes | Minimiza datos, evita conflictos y reduce volumen |
| S-03 | **"Reiniciar progreso"** borra también el progreso del alumno en la nube, pero no su perfil ni su cuenta. El mensaje de confirmación debe avisarlo | Si no, el panel mostraría datos que el alumno ya no ve. Hay que decidir qué pasa con el mejor puntaje (ver P-4) |
| S-04 | Usuario: 3 a 20 caracteres, minúsculas, números, `.` `_` `-`, único en toda la plataforma | Evita ambigüedad y simplifica el email interno |
| S-05 | Contraseña de mínimo 6 caracteres (mínimo por defecto de Supabase). La docente puede restablecerla | Chicos de secundaria, sin recuperación por email |
| S-06 | La app sigue siendo usable **sin cuenta** (modo Fase 1). Solo quienes tienen cuenta aparecen en el panel y en el ranking | Respeta el principio local-first y la reversibilidad |
| S-07 | Al terminar el año: exportar CSV y borrar las cuentas del curso | Minimiza datos de menores |
| S-08 | Desempate del ranking: gana quien llegó primero al puntaje. Como el máximo es 10, es esperable que muchos alumnos empaten en 10 | Sin desempate el top 10 sería arbitrario |
| S-09 | La edad se guarda como entero, tal como pide la app hoy. Queda desactualizada con el año | Se puede aceptar para ~1 año lectivo |
| S-10 | La CSV se genera en el navegador (sin costo de servidor), con BOM UTF-8 y `;` como separador para que Excel en español abra bien tildes y columnas | Es lo que suele funcionar con Excel en configuración regional argentina |

---

## 8. Preguntas abiertas

Sin respuesta todavía. **No se asumió ninguna.** El modelo de datos soporta cualquiera de las opciones.

**P-1. ¿El ranking es por curso o general?**
- *Por curso:* `get_top_scores()` filtra por el curso del alumno que consulta (tope de 10 por curso).
- *General:* devuelve el top 10 de los ~250 alumnos, lo que mezcla cursos.
- Impacto: solo la función de ranking y su pantalla.

**P-2. ¿Muestra el nombre completo o solo el nombre de pila?**
- Hoy la app pide un único campo "Nombre", sin apellido obligatorio, así que "nombre completo" depende de lo que escriba cada alumno.
- Si es solo el nombre de pila, la función debería recortar el primer término o se agrega un campo aparte.
- Impacto: privacidad de menores en una pantalla visible para otros alumnos.

**P-3. ¿La universidad o la escuela piden consentimiento por tratarse de un proyecto de posgrado?**
- Hay que consultarlo con la universidad (UAI) y con la escuela.
- Hasta tener respuesta, solo se debería probar con datos ficticios o con la propia docente, **no con alumnos reales**.
- Impacto: bloquea el piloto con alumnos (paso 13), no los pasos técnicos previos.

**P-4. Derivada de S-03: ¿al reiniciar el progreso también se borra el mejor puntaje del ranking?**
- Decisión de producto pendiente. Hoy "Reiniciar progreso" local borra el puntaje.

---

## 9. Plan de implementación (pasos chicos)

Cada paso es un bloque independiente, con su propia verificación y su propio commit, y no debería modificar nada sin necesidad. **Regla general:** el build de la app debe seguir pasando y el modo sin cuenta (Fase 1) debe seguir funcionando en todos los pasos.

| # | Paso | Entregable | Cómo se verifica |
|---|---|---|---|
| 0 | Responder P-1 a P-4 | Decisiones registradas en este documento | Las preguntas quedan cerradas o marcadas como pendientes a propósito |
| 1 | **Spike descartable:** crear un proyecto de prueba y verificar el email `@campus.local`, confirmación de email desactivada y creación de usuario por Edge Function | Nota con resultados (¿acepta `.local`?) | Alta y login de un usuario de prueba |
| 2 | Proyecto real + migraciones SQL versionadas en `supabase/migrations/` (tablas, trigger, vista, función, RLS activo) | Esquema aplicado | Todas las tablas con RLS activo |
| 3 | **Pruebas de RLS** con alumno A, alumno B y docente | Lista de pruebas con resultado esperado vs real | Cada rol ve solo lo que dice §4.3 |
| 4 | Edge Functions: `register-student`, `reset-student-password`, `delete-student` (+ límite de intentos en el alta) | Funciones desplegadas | Alta con código válido, inválido y desactivado; reset y borrado solo por docente |
| 5 | Cuenta docente (manual) + 5 cursos + sus códigos | Datos iniciales cargados | La docente ve los 5 cursos y sus códigos |
| 6 | Cliente: dependencia Supabase con carga diferida, variable de entorno, hook de sesión y pantallas de ingreso/alta, sin tocar el progreso | Rutas nuevas; sin variables, la app queda en modo Fase 1 | Build OK; modo sin cuenta idéntico al de hoy |
| 7 | Modelo local v3 con marcas de tiempo y migración desde v2 | `useLocalProgress` extendido | Un progreso v2 existente se migra sin perder datos |
| 8 | Servicio de sincronización: cola local, reglas de §3.2, disparadores (sesión iniciada, vuelve la conexión, pestaña visible) | Sync funcionando | Offline → cambios → online: llegan sin duplicarse; dos dispositivos se combinan bien |
| 9 | Señal de vida y "última actividad" | `last_seen_at` / `last_activity_*` actualizados | Estado "activo" cambia a los 5 min sin señal |
| 10 | Ranking (según P-1 y P-2) | Pantalla de ranking y función final | Top 10 correcto con desempate; un alumno no ve puntajes que no sean del ranking |
| 11 | Panel docente: lista, filtros, búsqueda, resumen por curso, detalle | Ruta `/docente` solo para docente, con carga diferida | Un alumno no puede abrirla ni ver datos ajenos |
| 12 | Exportación CSV | Botón en el panel | El archivo abre bien en Excel, con tildes y columnas correctas |
| 13 | Piloto con **un** curso (requiere P-3 resuelta) | Informe del piloto | Sin errores de RLS ni de sync; uso del plan gratuito dentro de límites |
| 14 | Operación: cuándo se pausa el proyecto, respaldo manual, cierre de año, guía para la docente | Documento de operación | La docente puede dar de alta un alumno, restablecer una clave y exportar sin ayuda |

**Dependencias:** 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → (9, 10, 11) → 12 → 13 → 14. Los pasos 0 y 1 pueden hacerse en paralelo. El paso 13 es el único que depende de P-3.

---

## 10. Riesgos principales

| Riesgo | Mitigación |
|---|---|
| Auth no acepta el dominio `.local` | Spike en el paso 1; se cambia el dominio interno |
| Proyecto gratuito pausado por inactividad | Reactivar antes de retomar clases; evaluar un ping periódico |
| Sin backups en el plan gratuito | CSV y volcado manual periódico |
| Alumnos que olvidan su contraseña | Reset por la docente (RF-05); con ~250 alumnos puede ser carga operativa real |
| Conflictos de sincronización entre dispositivos | Reglas de §3.2 + pruebas del paso 8 |
| Datos de menores sin autorización | P-3 antes de tocar alumnos reales |
| Puntajes manipulables | Aceptado: es un juego de práctica |
| Peso del bundle por Supabase JS | Carga diferida (RNF-05) |
