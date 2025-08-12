const CACHE_NAME = 'cosmicrafts-v1';
const STATIC_CACHE = 'cosmicrafts-static-v1';
const DYNAMIC_CACHE = 'cosmicrafts-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/favicon.svg',
  '/logo.svg',
  '/src/style.css',
  '/src/main.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests except for critical resources
  if (!url.origin.includes(location.origin) && 
      !url.href.includes('ic0.app') && 
      !url.href.includes('fonts.googleapis.com') &&
      !url.href.includes('fonts.gstatic.com')) {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      // Return cached version if available
      if (response) {
        return response;
      }

      // Fetch from network
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Cache the response
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      }).catch(() => {
        // Return offline page for navigation requests
        if (request.destination === 'document') {
          return caches.match('/');
        }
      });
    })
  );
});
