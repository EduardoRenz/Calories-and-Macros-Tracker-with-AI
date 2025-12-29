import { NextResponse } from 'next/server';

export async function GET() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || 'v1';
  const swCode = `
const CACHE_NAME = 'calorie-counter-${version}';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map(async (url) => {
          try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            
            // If the response is redirected, we MUST clean it.
            // Chrome fails top-level navigation if the SW returns a redirected response.
            if (response.redirected) {
              const cleanResponse = new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
              });
              return cache.put(url, cleanResponse);
            }
            
            return cache.put(url, response);
          } catch (error) {
            console.error('Failed to cache:', url, error);
          }
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
  `;

  return new NextResponse(swCode, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  });
}
