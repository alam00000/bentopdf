/**
 * Cloudflare Worker entry point for BentoPDF
 * Serves static assets with proper CORS headers for SharedArrayBuffer support
 */

export default {
  async fetch(request, env, ctx) {
    // Get the asset from the static assets
    const url = new URL(request.url);

    // Handle the request using the static assets
    // In production, env.ASSETS is available. In local dev, it might not be.
    let response;

    if (env.ASSETS) {
      // Production environment with ASSETS binding
      response = await env.ASSETS.fetch(request);
    } else {
      // Local development fallback - return a helpful message
      return new Response(
        'Local development mode: Please use "npm run dev" for local development instead of "npm run cf:dev".\n\n' +
        'The Cloudflare Workers local dev server is primarily for testing Worker logic.\n' +
        'For BentoPDF development, use the Vite dev server: npm run dev',
        {
          status: 200,
          headers: {
            'Content-Type': 'text/plain',
          },
        }
      );
    }

    // Clone the response so we can modify headers
    const newResponse = new Response(response.body, response);

    // Add CORS headers required for SharedArrayBuffer
    // These headers are essential for BentoPDF's PDF processing functionality
    newResponse.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
    newResponse.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');

    // Add security headers
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Add caching headers for static assets
    if (url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico|webp)$/)) {
      newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (url.pathname.match(/\.html$/)) {
      newResponse.headers.set('Cache-Control', 'public, max-age=3600, must-revalidate');
    }

    return newResponse;
  },
};
