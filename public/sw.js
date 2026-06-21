const CACHE = 'inmoxil-v1'
const URLS = ['/', '/dashboard', '/login', '/register', '/forgot-password', '/icon.svg', '/manifest']

self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(URLS))
  )
})

self.addEventListener('fetch', (event: any) => {
  const { request } = event
  if (request.url.includes('/api/') || request.url.includes('/_next/')) {
    event.respondWith(fetch(request).catch(() => caches.match(request)))
    return
  }
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  )
})
