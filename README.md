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
- Rutas `/`, `/aprender`, `/aprender/:lessonId`, `/practicar`, `/jugar` y `/progreso`, más una pantalla para direcciones desconocidas.
- Navegación inferior en teléfonos y superior en escritorio, foco al cambiar de pantalla, enlace para saltar al contenido y respeto por movimiento reducido.
- Componentes reutilizables `Button`, `Card`, `PageHeader` y `ProgressBar`.
- Módulo Aprendemos con 17 lecciones navegables en dos grupos: documentos comerciales y patrimonio. La teoría y los ejemplos proceden de los documentos de `docs`.
- Comparación de facturas A, B y C en la lección general de Factura; cada tipo también tiene su propia lección.
- Placeholders explícitos para ejercicios y juego. No hay actividades completas ni calificaciones simuladas.
- Estado inicial versionado en `localStorage`, clave `edu-app-contable:progress:v1`. Los datos inválidos se reemplazan por un estado vacío y el bloqueo del almacenamiento no impide navegar.

No incluye backend, autenticación, panel docente, servicios pagos ni evaluaciones oficiales. El progreso empieza en cero y solo podrá avanzar cuando se implementen las actividades.

## Organización

`src/components/ui.tsx`: componentes compartidos. `src/data/sections.ts`: módulos y navegación. `src/data/lessonTypes.ts` y `src/data/lessons.ts`: estructura y contenido pedagógico. `src/pages/LearnPages.tsx`: listado y lecciones. `src/hooks/useLocalProgress.ts`: persistencia inicial. `src/App.tsx`: layout y rutas. `src/styles.css`: Tailwind y estilos responsive.

Los documentos originales están en `docs`. El análisis previo está en `docs/REVISION.md`. `scripts/inspect_documents.py` permite extraer su texto usando el runtime de Python con pypdf, solo para revisión de desarrollo; no es parte de la aplicación.
