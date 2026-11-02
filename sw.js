/* Service worker de la app "Tarjeta AIC".
   Solo lo registran quienes abren la app (carpeta /app/). Quien escanea un QR
   no lo instala. Estrategia: red primero (siempre la versión más reciente) y,
   si no hay señal, la última copia guardada. Así el QR funciona sin internet. */
const CACHE = 'tarjeta-aic-v1';
const BASE = [
  'app/app.css', 'app/app.js', 'app/personas.js', 'app/vendor/qrcode.min.js',
  'app/img/logo-aic-blanco.png', 'app/img/icono-192.png', 'app/img/icono-512.png',
  'app/img/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k.startsWith('tarjeta-aic-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Tipografía Inter (Google Fonts): copia guardada primero
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); return res;
    })));
    return;
  }
  if (url.origin !== location.origin) return;

  // Mismo sitio: red primero (máx. 4 s), si no, copia guardada
  e.respondWith(new Promise(resolve => {
    let listo = false;
    const desdeCache = () => caches.match(req, { ignoreSearch: true });
    const t = setTimeout(() => desdeCache().then(r => { if (r && !listo) { listo = true; resolve(r); } }), 4000);
    fetch(req).then(res => {
      if (res.ok) { const copia = res.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      if (!listo) { listo = true; clearTimeout(t); resolve(res); }
    }).catch(() => desdeCache().then(r => {
      if (!listo) { listo = true; clearTimeout(t); resolve(r || Response.error()); }
    }));
  }));
});
