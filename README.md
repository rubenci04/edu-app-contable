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
- Rutas `/`, `/aprender`, `/aprender/:lessonId`, `/practicar`, `/practicar/:activityId`, `/practicar/patrimonio/:exerciseId`, `/jugar`, `/progreso` y `/acerca-de`, más una pantalla para direcciones desconocidas.
- Navegación inferior en teléfonos y superior en escritorio, foco al cambiar de pantalla, enlace para saltar al contenido y respeto por movimiento reducido.
- Componentes reutilizables `Button`, `Card`, `PageHeader` y `ProgressBar`.
- Módulo Aprendemos con 17 lecciones navegables en dos grupos: documentos comerciales y patrimonio. La teoría y los ejemplos proceden de los documentos de `docs`.
- Comparación de facturas A, B y C en la lección general de Factura; cada tipo también tiene su propia lección.
- Las diez prácticas del PDF (Orden de compra, Remito, facturas A/B/C, notas de débito/crédito, Recibo, Pagaré y Cheque) usan formularios reutilizables con validación y pistas por campo.
- Cuatro ejercicios de patrimonio del documento teórico: tres valores faltantes de la ecuación y la clasificación, totales y Patrimonio Neto del caso de Sofía Medina.
- Juego de diez preguntas aleatorias por partida, con selección múltiple, verdadero/falso, clasificación y cálculos respaldados por el material; feedback inmediato y pantalla final. No es una evaluación oficial.
- Mi Progreso muestra documentos y ejercicios completados, porcentaje general y puntajes del juego. El reinicio solicita confirmación.
- Borradores, intentos, actividades completadas y puntajes se guardan en `localStorage`, clave `edu-app-contable:progress:v2`. Se conserva el progreso previo de la clave `v1` cuando existe. El bloqueo del almacenamiento no impide navegar.
- PWA instalable con manifest, iconos locales y service worker que guarda el shell y los assets compilados para uso sin conexión después de la primera carga.

No incluye backend, autenticación, panel docente, servicios pagos ni evaluaciones oficiales. El progreso corresponde solo a este navegador.

**TODO_TEACHER_CONFIRMATION:** la Actividad N.º 3 no indica la tasa de IVA de Factura A. La Actividad N.º 5 no da número ni condición de venta de Factura C. Las Actividades N.º 6 y 7 muestran IVA y total en los modelos de notas, pero no indican la tasa para calcularlos. Esos campos quedan disponibles sin corrección automática; las cuatro prácticas permanecen en revisión docente. Las consignas «en el día de la fecha» no fijan una fecha única; se valida que sea una fecha válida, no un día específico.

## Publicación estática

El build genera `dist`. El hosting debe servirlo por HTTPS y redirigir las rutas internas de la SPA a `index.html`. `public/_redirects` aporta esa regla en plataformas que admiten ese formato. Para publicar bajo una subruta, configurá `APP_BASE_PATH` con una ruta que empiece y termine en `/` antes del build (por ejemplo, `/edu-contable/`) y configurá la misma subruta en el rewrite del hosting. La PWA requiere HTTPS en producción; `localhost` sirve para pruebas. Más detalles en `docs/DESPLIEGUE_ESTATICO.md`.

## Organización

`src/components/ui.tsx`: componentes compartidos. `src/data/sections.ts`: módulos y navegación. `src/data/lessonTypes.ts` y `src/data/lessons.ts`: contenido pedagógico. `src/data/activityTypes.ts`, `src/data/activities.ts` y `src/data/patrimonyActivities.ts`: consignas, campos y respuestas de prácticas. `src/data/quizQuestions.ts`: banco de preguntas y selección de partida. `src/lib/activityValidation.ts`: validación reutilizable. `src/pages/LearnPages.tsx`, `src/pages/PracticePages.tsx`, `src/pages/PatrimonyPage.tsx` y `src/pages/PlayPage.tsx`: pantallas. `src/hooks/useLocalProgress.ts`: persistencia local. `src/App.tsx`: layout, progreso y rutas. `src/styles.css`: Tailwind y estilos responsive. `public`: manifest, iconos, service worker y regla de fallback. `scripts/prepare_pwa.mjs`: versión de caché del build.

Los documentos originales están en `docs`. El análisis previo está en `docs/REVISION.md`. `scripts/inspect_documents.py` permite extraer su texto usando el runtime de Python con pypdf, solo para revisión de desarrollo; no es parte de la aplicación.
