# Edu App Contable

Prototipo educativo local con React, Vite, TypeScript, Tailwind CSS, React Router y Lucide React.

## Uso local

Requiere Node.js 22.12 o superior y npm.

```sh
npm install
npm run dev
```

Abrir la dirección local que imprime Vite. Para verificar la versión de producción:

```sh
npm run build
npm run preview
```

La instalación descarga dependencias de desarrollo. La aplicación en funcionamiento no consume APIs externas, fuentes remotas ni servicios de terceros.

## Alcance

- Inicio con las cuatro tarjetas solicitadas.
- Rutas `/`, `/aprender`, `/aprender/:lessonId`, `/practicar`, `/practicar/:activityId`, `/practicar/patrimonio/:exerciseId`, `/jugar` y `/progreso`, más una pantalla para direcciones desconocidas.
- Navegación inferior en teléfonos y superior en escritorio, foco al cambiar de pantalla, enlace para saltar al contenido y respeto por movimiento reducido.
- Componentes reutilizables `Button`, `Card`, `PageHeader` y `ProgressBar`.
- Módulo Aprendemos con 17 lecciones navegables en dos grupos: documentos comerciales y patrimonio. La teoría y los ejemplos proceden de los documentos de `docs`.
- Comparación de facturas A, B y C en la lección general de Factura; cada tipo también tiene su propia lección.
- Las primeras tres prácticas del PDF (Orden de compra, Remito y Factura A) usan un formulario reutilizable con validación y pistas por campo. Las demás prácticas de documentos siguen pendientes.
- Cuatro ejercicios de patrimonio del documento teórico: tres valores faltantes de la ecuación y la clasificación, totales y Patrimonio Neto del caso de Sofía Medina.
- Juego de diez preguntas aleatorias por partida, con selección múltiple, verdadero/falso, clasificación y cálculos respaldados por el material; feedback inmediato y pantalla final. No es una evaluación oficial.
- Mi Progreso muestra documentos y ejercicios completados, porcentaje general y puntajes del juego. El reinicio solicita confirmación.
- Borradores, intentos, actividades completadas y puntajes se guardan en `localStorage`, clave `edu-app-contable:progress:v2`. Se conserva el progreso previo de la clave `v1` cuando existe. El bloqueo del almacenamiento no impide navegar.

No incluye backend, autenticación, panel docente, servicios pagos ni evaluaciones oficiales. El progreso corresponde solo a este navegador.

**TODO_TEACHER_CONFIRMATION:** la Actividad N.º 3 del PDF no indica la tasa de IVA para esa operación. El ejemplo de 21 % del documento teórico pertenece a otra situación. El formulario permite anotar IVA y total, pero no los corrige ni marca Factura A como completada hasta que la profesora indique el criterio. Las consignas dicen «en el día de la fecha» sin fijar una fecha concreta; se valida el formato y la existencia de la fecha, no una respuesta única.

## Organización

`src/components/ui.tsx`: componentes compartidos. `src/data/sections.ts`: módulos y navegación. `src/data/lessonTypes.ts` y `src/data/lessons.ts`: contenido pedagógico. `src/data/activityTypes.ts`, `src/data/activities.ts` y `src/data/patrimonyActivities.ts`: consignas, campos y respuestas de prácticas. `src/data/quizQuestions.ts`: banco de preguntas y selección de partida. `src/lib/activityValidation.ts`: validación reutilizable. `src/pages/LearnPages.tsx`, `src/pages/PracticePages.tsx`, `src/pages/PatrimonyPage.tsx` y `src/pages/PlayPage.tsx`: pantallas. `src/hooks/useLocalProgress.ts`: persistencia local. `src/App.tsx`: layout, progreso y rutas. `src/styles.css`: Tailwind y estilos responsive.

Los documentos originales están en `docs`. El análisis previo está en `docs/REVISION.md`. `scripts/inspect_documents.py` permite extraer su texto usando el runtime de Python con pypdf, solo para revisión de desarrollo; no es parte de la aplicación.
