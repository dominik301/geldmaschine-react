self.addEventListener('install', (e) => {
    e.waitUntil(
      caches.open('geldmaschine-store').then((cache) => cache.addAll([
        'client/index.html'
      ])),
    );
  });
  
  self.addEventListener('fetch', (e) => {
    //console.log(e.request.url);
    e.respondWith(
      caches.match(e.request).then((response) => response || fetch(e.request)),
    );
  });
  