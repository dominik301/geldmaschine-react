const cacheName = 'geldmaschine-v3';
const appShellFiles = [
  'client/',
  'client/myscript.js',
  'client/styles.css',
  'client/favicon.ico',
  'client/short-dice-roll.wav',
  'client/dice-roll.mp3',
  'client/images/ereignisfeld.png',
  'client/images/hori-bar.png',
  'client/images/vert-bar.png',
  'client/images/icons/icon-192x192.png',
  'client/images/icons/icon-512x512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    console.log('[Service Worker] Caching all: app shell and content');
    await cache.addAll(appShellFiles);
  })());
});

self.addEventListener('fetch', (e) => {

  e.respondWith((async () => {
    const r = await caches.match(e.request);
    console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
    if (r) { return r; }
    const response = await fetch(e.request);
    const cache = await caches.open(cacheName);
    console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
    cache.put(e.request, response.clone());
    return response;
  })());

});
  
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keyList) => {
    return Promise.all(keyList.map((key) => {
      if (key === cacheName) { return; }
      return caches.delete(key);
    }))
  }));
});