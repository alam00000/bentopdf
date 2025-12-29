/**
 * Service Worker Registration
 * Registers the service worker to enable offline caching
 * 
 * Note: Service Worker is disabled in development mode to prevent
 * conflicts with Vite's HMR (Hot Module Replacement)
 */

// Skip service worker registration in development mode
const isDevelopment = window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port !== '';

if (isDevelopment) {
    console.log('[Dev Mode] Service Worker registration skipped in development');
    console.log('Service Worker will be active in production builds');
} else if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        const swPath = `${import.meta.env.BASE_URL}sw.js`;
        console.log('[SW] Registering Service Worker at:', swPath);
        navigator.serviceWorker
            .register(swPath)
            .then((registration) => {
                console.log('[SW] Service Worker registered successfully:', registration.scope);

                setInterval(() => {
                    registration.update();
                }, 24 * 60 * 60 * 1000);

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('[SW] New version available! Reload to update.');

                                if (confirm('A new version of BentoPDF is available. Reload to update?')) {
                                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                                    window.location.reload();
                                }
                            }
                        });
                    }
                });
            })
            .catch((error) => {
                console.error('[SW] Service Worker registration failed:', error);
            });

        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[SW] New service worker activated, reloading...');
            window.location.reload();
        });
    });
}
