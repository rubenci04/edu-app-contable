const CACHE = 'edu-app-contable-shell-__BUILD_HASH__';
const scope = self.registration.scope;
const shell = new URL('index.html', scope).href;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const response = await fetch(shell, { cache: 'reload' });
    if (!response.ok) throw new Error('No se pudo guardar la aplicación para uso sin conexión.');
    await cache.put(shell, response.clone());
    const html = await response.text();
    const urls = [new URL('.', scope).href, new URL('manifest.webmanifest', scope).href,
      new URL('icons/icon-192.png', scope).href, new URL('icons/icon-512.png', scope).href];
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const url = new URL(match[1], scope);
      if (url.origin === self.location.origin && !urls.includes(url.href)) urls.push(url.href);
    }
    await cache.addAll(urls);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith('edu-app-contable-shell-') && name !== CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) return response;
      } catch { /* Use the cached SPA shell below. */ }
      return await caches.match(shell) ?? Response.error();
    })());
    return;
  }
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});
