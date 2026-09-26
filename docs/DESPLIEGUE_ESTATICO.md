# Despliegue estático

1. Ejecutar `npm run build` y publicar el contenido completo de `dist` en un hosting estático con HTTPS.
2. Configurar un rewrite de todas las rutas que no correspondan a un archivo hacia `index.html`. Esto permite abrir y refrescar `/aprender/...`, `/practicar/...`, `/jugar`, `/progreso` y `/acerca-de` directamente. El archivo `_redirects` incluido en `dist` sirve en plataformas compatibles; en otras se debe configurar el equivalente.
3. Si la aplicación se publica bajo una subruta, definir `APP_BASE_PATH` antes del build con esa subruta, por ejemplo `/edu-contable/`, y usarla también en la regla de rewrite. El valor predeterminado es `/`.
4. Visitar la aplicación una vez con conexión. El service worker registra el shell, manifest, iconos y assets del build; luego las secciones básicas pueden abrirse sin conexión. Un build nuevo cambia la versión del cache y reemplaza los assets anteriores al instalarse el worker actualizado.

El prototipo no requiere servidor de datos ni variables secretas. `localStorage` conserva el progreso únicamente en el mismo origen y navegador; cambiar de dominio o borrar datos del sitio no transfiere esos avances. La instalación PWA requiere HTTPS en producción o un entorno local compatible.
