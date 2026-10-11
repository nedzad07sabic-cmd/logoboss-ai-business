/* Only the public offline screen and fixed icons are cached. No customer data. */
'use strict';
const CACHE_PREFIX = 'logoboss-app-public-';
const CACHE_NAME = CACHE_PREFIX + '20261011-v1';
const OFFLINE_PAGE = '/app-offline.html';
const PUBLIC_ASSETS = [OFFLINE_PAGE, '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PUBLIC_ASSETS.map(path => new Request(path, { cache: 'reload', credentials: 'omit' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Leave API routes and authentication/payment callbacks entirely to the browser.
  if (/^\/(?:api|auth|rest|functions|storage)(?:\/|$)/.test(url.pathname)) return;
  if (['code', 'token', 'token_hash', 'access_token', 'refresh_token', 'session_id', 'lb_auth'].some(key => url.searchParams.has(key))) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try { return await fetch(new Request(request, { cache: 'no-store' })); }
      catch (_) {
        const cache = await caches.open(CACHE_NAME);
        return await cache.match(OFFLINE_PAGE) || new Response('LogoBoss AI is offline. Please reconnect and try again.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' } });
      }
    })());
    return;
  }
  if (url.search || !PUBLIC_ASSETS.includes(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match(url.pathname) || fetch(new Request(request, { cache: 'no-store' }));
  })());
});
