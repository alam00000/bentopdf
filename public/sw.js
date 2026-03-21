/**
 * BentoPDF Service Worker
 * Caches WASM files and static assets for offline support and faster loading
 * Supports both local and CDN delivery with deduplication
 * Version: 1.1.0
 */

const CACHE_VERSION = 'bentopdf-v10';
const CACHE_NAME = `${CACHE_VERSION}-static`;

const getBasePath = () => {
  const scope = self.registration?.scope || self.location.href;
  const url = new URL(scope);
  return url.pathname.replace(/\/$/, '') || '';
};

const buildCriticalAssets = () => [];

self.addEventListener('install', (event) => {
  const CRITICAL_ASSETS = buildCriticalAssets();
  // console.log('🚀 [ServiceWorker] Installing version:', CACHE_VERSION);
  // console.log('📍 [ServiceWorker] Base path detected:', basePath || '/');
  // console.log('📦 [ServiceWorker] Will cache', CRITICAL_ASSETS.length, 'critical assets');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        // console.log('[ServiceWorker] Caching critical assets...');
        return cacheInBatches(cache, CRITICAL_ASSETS, 5);
      })
      .then(() => {
        // console.log('✅ [ServiceWorker] All critical assets cached successfully!');
        // console.log('⏭️  [ServiceWorker] Skipping waiting, activating immediately...');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[ServiceWorker] Cache installation failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  // console.log('🔄 [ServiceWorker] Activating version:', CACHE_VERSION);

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith('bentopdf-') && cacheName !== CACHE_NAME) {
              // console.log('[ServiceWorker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // console.log('✅ [ServiceWorker] Activated successfully!');
        // console.log('🎯 [ServiceWorker] Taking control of all pages...');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  const isCDN = url.hostname === 'cdn.jsdelivr.net';
  const isLocal = url.origin === location.origin;

  if (!isLocal && !isCDN) {
    return;
  }
  if (
    isLocal &&
    (url.searchParams.has('t') ||
      url.searchParams.has('import') ||
      url.searchParams.has('direct'))
  ) {
    // console.log('🔧 [Dev Mode] Skipping Vite HMR request:', url.pathname);
    return;
  }

  if (
    isLocal &&
    (url.pathname.includes('/@vite') ||
      url.pathname.includes('/@id') ||
      url.pathname.includes('/@fs'))
  ) {
    return;
  }

  if (isLocal && url.pathname.includes('/locales/')) {
    event.respondWith(networkFirstStrategy(event.request));
  } else if (shouldCache(url.pathname, isCDN)) {
    event.respondWith(cacheFirstStrategyWithDedup(event.request, isCDN));
  } else if (
    isLocal &&
    (url.pathname.endsWith('.html') ||
      url.pathname === '/' ||
      /^\/(en|fr|es|de|zh|zh-TW|vi|tr|id|it|pt|ru|nl|be)(\/|$)/.test(
        url.pathname
      ))
  ) {
    event.respondWith(networkFirstStrategy(event.request));
  }
});

/**
 * Cache-first strategy with deduplication
 * Ensures we only cache CDN OR local version, never both
 */
async function cacheFirstStrategyWithDedup(request, isCDN) {
  const url = new URL(request.url);
  const fileName = url.pathname.split('/').pop();

  try {
    const cachedResponse = await findCachedFile(fileName, request.url);
    if (cachedResponse) {
      // console.log('⚡ [Cache HIT] Instant load:', fileName);
      return cachedResponse;
    }

    // console.log(`📥 [Cache MISS] Downloading from ${isCDN ? 'CDN' : 'local'}:`, fileName);

    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const clone = networkResponse.clone();
      const buffer = await clone.arrayBuffer();
      if (buffer.byteLength > 0) {
        const cache = await caches.open(CACHE_NAME);
        await removeDuplicateCache(cache, fileName, isCDN);
        await cache.put(
          request,
          new Response(buffer, {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers: networkResponse.headers,
          })
        );
      }
    }

    return networkResponse;
  } catch (error) {
    if (isCDN) {
      console.warn(`⚠️ [CDN Failed] Trying local fallback for: ${fileName}`);
      const basePath = getBasePath();
      const localPath = getLocalPathForCDNUrl(url.pathname);

      if (localPath) {
        const localUrl = `${basePath}${localPath}${fileName}`;
        try {
          const fallbackResponse = await fetch(localUrl);
          if (fallbackResponse && fallbackResponse.status === 200) {
            const fbClone = fallbackResponse.clone();
            const fbBuffer = await fbClone.arrayBuffer();
            if (fbBuffer.byteLength > 0) {
              const cache = await caches.open(CACHE_NAME);
              await cache.put(
                localUrl,
                new Response(fbBuffer, {
                  status: fallbackResponse.status,
                  statusText: fallbackResponse.statusText,
                  headers: fallbackResponse.headers,
                })
              );
            }
            return fallbackResponse;
          }
        } catch (fallbackError) {
          console.error(
            '[ServiceWorker] Both CDN and local failed for:',
            fileName
          );
        }
      }
    }
    throw error;
  }
}

async function findCachedFile(fileName, requestUrl) {
  const cache = await caches.open(CACHE_NAME);

  const exactMatch = await cache.match(requestUrl);
  if (exactMatch) {
    const clone = exactMatch.clone();
    const buffer = await clone.arrayBuffer();
    if (buffer.byteLength > 0) {
      return exactMatch;
    }
    await cache.delete(requestUrl);
  }

  const requests = await cache.keys();
  for (const req of requests) {
    const reqUrl = new URL(req.url);
    if (reqUrl.pathname.endsWith(fileName)) {
      const response = await cache.match(req);
      if (response) {
        const clone = response.clone();
        const buffer = await clone.arrayBuffer();
        if (buffer.byteLength > 0) {
          return response;
        }
        await cache.delete(req);
      }
    }
  }
  return null;
}

async function removeDuplicateCache(cache, fileName, isCDN) {
  const requests = await cache.keys();

  for (const req of requests) {
    const reqUrl = new URL(req.url);
    if (reqUrl.pathname.endsWith(fileName)) {
      // If caching CDN version, remove local version (and vice versa)
      const reqIsCDN = reqUrl.hostname === 'cdn.jsdelivr.net';
      if (reqIsCDN !== isCDN) {
        await cache.delete(req);
        // console.log(`[Dedup] Removed ${reqIsCDN ? 'CDN' : 'local'} version of:`, fileName);
      }
    }
  }
}

/**
 * Network-first strategy: Try network first, fallback to cache
 * Perfect for HTML files that might update
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const clone = networkResponse.clone();
      const buffer = await clone.arrayBuffer();
      if (buffer.byteLength > 0) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(
          request,
          new Response(buffer, {
            status: networkResponse.status,
            statusText: networkResponse.statusText,
            headers: networkResponse.headers,
          })
        );
      }
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // console.log('[Offline Mode] Serving from cache:', request.url.split('/').pop());
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Map CDN URL path to local path
 * Returns the local directory path for a given CDN package
 */
function getLocalPathForCDNUrl(pathname) {
  if (pathname.includes('/@matbee/libreoffice-converter')) {
    return '/libreoffice-wasm/';
  }
  return null;
}

/**
 * Determine if a URL should be cached
 * Handles both local and CDN URLs
 */
function shouldCache(pathname, isCDN = false) {
  if (isCDN) {
    return (
      pathname.includes('/@bentopdf/pymupdf-wasm') ||
      pathname.includes('/@bentopdf/gs-wasm') ||
      pathname.includes('/@matbee/libreoffice-converter') ||
      pathname.match(/\.(wasm|whl|zip|json|js|gz)$/)
    );
  }

  return (
    pathname.includes('/libreoffice-wasm/') ||
    pathname.includes('/embedpdf/') ||
    pathname.includes('/assets/') ||
    pathname.match(
      /\.(js|mjs|css|wasm|whl|zip|json|png|jpg|jpeg|gif|svg|woff|woff2|ttf|gz|br)$/
    )
  );
}

/**
 * Cache assets in batches to avoid overwhelming the browser
 */
async function cacheInBatches(cache, urls, batchSize = 5) {
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);

    await Promise.all(
      batch.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok && response.status === 200) {
            const clone = response.clone();
            const buffer = await clone.arrayBuffer();
            if (buffer.byteLength > 0) {
              await cache.put(url, response);
            }
          }
        } catch (error) {
          console.warn('[ServiceWorker] Failed to cache:', url, error.message);
        }
      })
    );
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('[ServiceWorker] Cache cleared');
      })
    );
  }
});

// console.log('🎉 [ServiceWorker] Script loaded successfully! Ready to cache assets.');
// console.log('📊 [ServiceWorker] Cache version:', CACHE_VERSION);
