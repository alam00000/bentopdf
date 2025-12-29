/**
 * BentoPDF Service Worker
 * Caches WASM files and static assets for offline support and faster loading
 * Version: 1.0.1
 */

const CACHE_VERSION = 'bentopdf-v6';
const CACHE_NAME = `${CACHE_VERSION}-static`;


const getBasePath = () => {
    const scope = self.registration?.scope || self.location.href;
    const url = new URL(scope);
    return url.pathname.replace(/\/$/, '') || '';
};

const buildCriticalAssets = (basePath) => [
    `${basePath}/pymupdf-wasm/pyodide.js`,
    `${basePath}/pymupdf-wasm/pyodide.asm.js`,
    `${basePath}/pymupdf-wasm/pyodide.asm.wasm`,
    `${basePath}/pymupdf-wasm/python_stdlib.zip`,
    `${basePath}/pymupdf-wasm/pyodide-lock.json`,

    `${basePath}/pymupdf-wasm/pymupdf-1.26.3-cp313-none-pyodide_2025_0_wasm32.whl`,
    `${basePath}/pymupdf-wasm/numpy-2.2.5-cp313-cp313-pyodide_2025_0_wasm32.whl`,
    `${basePath}/pymupdf-wasm/opencv_python-4.11.0.86-cp313-cp313-pyodide_2025_0_wasm32.whl`,
    `${basePath}/pymupdf-wasm/lxml-5.4.0-cp313-cp313-pyodide_2025_0_wasm32.whl`,
    `${basePath}/pymupdf-wasm/python_docx-1.2.0-py3-none-any.whl`,
    `${basePath}/pymupdf-wasm/pdf2docx-0.5.8-py3-none-any.whl`,
    `${basePath}/pymupdf-wasm/fonttools-4.56.0-py3-none-any.whl`,
    `${basePath}/pymupdf-wasm/typing_extensions-4.12.2-py3-none-any.whl`,
    `${basePath}/pymupdf-wasm/pymupdf4llm-0.0.27-py3-none-any.whl`,

    `${basePath}/ghostscript-wasm/gs.js`,
    `${basePath}/ghostscript-wasm/gs.wasm`,
];

self.addEventListener('install', (event) => {
    const basePath = getBasePath();
    const CRITICAL_ASSETS = buildCriticalAssets(basePath);
    console.log('🚀 [ServiceWorker] Installing version:', CACHE_VERSION);
    console.log('📍 [ServiceWorker] Base path detected:', basePath || '/');
    console.log('📦 [ServiceWorker] Will cache', CRITICAL_ASSETS.length, 'critical assets');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching critical assets...');
                return cacheInBatches(cache, CRITICAL_ASSETS, 5);
            })
            .then(() => {
                console.log('✅ [ServiceWorker] All critical assets cached successfully!');
                console.log('⏭️  [ServiceWorker] Skipping waiting, activating immediately...');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Cache installation failed:', error);
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('🔄 [ServiceWorker] Activating version:', CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName.startsWith('bentopdf-') && cacheName !== CACHE_NAME) {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ [ServiceWorker] Activated successfully!');
                console.log('🎯 [ServiceWorker] Taking control of all pages...');
                return self.clients.claim();
            })
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (url.origin !== location.origin) {
        return;
    }

    if (url.searchParams.has('t') || url.searchParams.has('import') || url.searchParams.has('direct')) {
        console.log('🔧 [Dev Mode] Skipping Vite HMR request:', url.pathname);
        return;
    }

    if (url.pathname.includes('/@vite') || url.pathname.includes('/@id') || url.pathname.includes('/@fs')) {
        return;
    }

    if (shouldCache(url.pathname)) {
        event.respondWith(cacheFirstStrategy(event.request));
    } else if (url.pathname.endsWith('.html') || url.pathname === '/') {
        event.respondWith(networkFirstStrategy(event.request));
    }
});

/**
 * Cache-first strategy: Check cache first, fallback to network
 * Perfect for WASM files and static assets that rarely change
 */
async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request, {
            ignoreVary: true,
            ignoreSearch: true
        });
        if (cachedResponse) {
            console.log('⚡ [Cache HIT] Instant load:', request.url.split('/').pop());
            return cachedResponse;
        }

        console.log('📥 [Cache MISS] Downloading:', request.url.split('/').pop());

        const networkResponse = await fetch(request);

        if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            console.log('💾 [Cached] Saved for next time:', request.url.split('/').pop());
        }

        return networkResponse;
    } catch (error) {
        console.error('[ServiceWorker] Fetch failed for:', request.url, error);
        throw error;
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
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('📴 [Offline Mode] Serving from cache:', request.url.split('/').pop());
            return cachedResponse;
        }
        throw error;
    }
}

/**
 * Determine if a URL should be cached
 * Handles both root (/) and subdirectory (/test/) deployments
 */
function shouldCache(pathname) {
    return (
        pathname.includes('/libreoffice-wasm/') ||
        pathname.includes('/pymupdf-wasm/') ||
        pathname.includes('/ghostscript-wasm/') ||
        pathname.includes('/embedpdf/') ||
        pathname.includes('/assets/') ||
        pathname.match(/\.(js|mjs|css|wasm|whl|zip|json|png|jpg|jpeg|gif|svg|woff|woff2|ttf|gz|br)$/)
    );
}

/**
 * Cache assets in batches to avoid overwhelming the browser
 */
async function cacheInBatches(cache, urls, batchSize = 5) {
    for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        console.log(`[ServiceWorker] Caching batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)}`);

        await Promise.all(
            batch.map(async (url) => {
                try {
                    await cache.add(url);
                    const fileName = url.split('/').pop();
                    const fileSize = fileName.includes('.wasm') || fileName.includes('.whl') ? '(large file)' : '';
                    console.log(`  ✓ Cached: ${fileName} ${fileSize}`);
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

console.log('🎉 [ServiceWorker] Script loaded successfully! Ready to cache assets.');
console.log('📊 [ServiceWorker] Cache version:', CACHE_VERSION);
