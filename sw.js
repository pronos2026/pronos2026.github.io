/* Service Worker – Les Pronostiqueurs CM 2026 */
var CACHE = 'pronostiqueurs-v2';

/* Installation : on ne pré-cache rien pour éviter les blocages */
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

/* Activation : suppression des anciens caches */
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

/* Fetch : réseau EN PRIORITÉ, cache uniquement en fallback */
self.addEventListener('fetch', function(e) {
  /* On ignore les requêtes non-GET (formulaires, etc.) */
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        /* On met en cache uniquement les réponses valides */
        if (response && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      })
      .catch(function() {
        /* Hors connexion : on essaie le cache */
        return caches.match(e.request);
      })
  );
});
