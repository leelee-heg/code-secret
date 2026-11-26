'use strict';
// Changer cette version à chaque modification d’un fichier de l’application.
const CACHE_PREFIX = `code-secret:${self.registration.scope}:`;
const CACHE_NAME = `${CACHE_PREFIX}0.3.0`;
const SHELL = [
  './', './index.html', './style.css?v=0.3.0',
  './engine.js?v=0.2.0', './api.js?v=0.2.0', './game.js?v=0.2.0-accords',
  './pwa.js?v=0.3.0', './manifest.webmanifest',
  './assets/icon.svg', './assets/icon-192.png', './assets/icon-512.png',
  './assets/icon-maskable-512.png', './assets/apple-touch-icon.png',
  './assets/qr-code-secret.png', './assets/qr-code-secret.svg'
];
const absolute = path => new URL(path, self.registration.scope).href;
const shellURLs = new Set(SHELL.map(absolute));
const indexURL = absolute('./index.html');
const rootURL = absolute('./');

self.addEventListener('install', event => {
  // Installation atomique : le worker attend que toutes les ressources existent.
  // Pas de skipWaiting : une nouvelle version ne remplace pas une partie en cours.
  event.waitUntil(caches.open(CACHE_NAME).then(cache =>
    cache.addAll(SHELL.map(path => new Request(absolute(path), { cache: 'reload' })))));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  const canonical = `${url.origin}${url.pathname}`;
  const isPage = event.request.mode === 'navigate' && (canonical === indexURL || canonical === rootURL);
  // Le mode enseignant et son banc restent sur le réseau, sans copie de page en cache.
  if (url.searchParams.get('test') === '1' || (!isPage && !shellURLs.has(url.href))) return;
  event.respondWith((async () => {
    const client = event.clientId ? await self.clients.get(event.clientId) : null;
    if (client) {
      const clientURL = new URL(client.url);
      if (clientURL.searchParams.get('test') === '1' || clientURL.pathname.endsWith('/tests-api.html')) {
        return fetch(event.request, { cache: 'no-store' });
      }
    }
    const cache = await caches.open(CACHE_NAME);
    const key = isPage ? indexURL : event.request;
    try {
      const response = await fetch(event.request, { cache: 'no-cache' });
      if (response.ok) await cache.put(key, response.clone()).catch(() => {});
      return response;
    } catch (error) {
      const cached = await cache.match(key);
      if (cached) return cached;
      throw error;
    }
  })());
});
