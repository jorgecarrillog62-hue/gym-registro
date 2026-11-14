// Service worker: guarda la app en el teléfono para que abra sin internet.
// ⚠ Sube VERSION en cada cambio (gym-v2, gym-v3, …) para que la actualización llegue al teléfono.
const VERSION = 'gym-v1';

const ARCHIVOS = [
  './', './index.html', './manifest.webmanifest', './progresion.json',
  './css/tema.css', './css/app.css',
  './js/app.js', './js/db.js', './js/datos-iniciales.js', './js/formato.js', './js/grafica.js',
  './js/calc/pesos.js', './js/calc/e1rm.js', './js/calc/meta.js',
  './icons/icon-192.png', './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Primero lo guardado; si no está, la red.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
