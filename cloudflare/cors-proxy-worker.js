/**
 * BentoPDF CORS Proxy Worker
 * 
 * This Cloudflare Worker proxies certificate requests for the digital signing tool.
 * It fetches certificates from external CAs that don't have CORS headers enabled
 * and returns them with proper CORS headers.
 * 
 * Security: Only allows fetching certificate-related URLs
 * 
 * Deploy: npx wrangler deploy
 */

const ALLOWED_PATTERNS = [
    /\.crt$/i,
    /\.cer$/i,
    /\.pem$/i,
    /\/certs\//i,
    /\/ocsp/i,
    /\/crl/i,
    /caIssuers/i,
];

const ALLOWED_ORIGINS = [
    'https://www.bentopdf.com',
    'https://bentopdf.com',
];

const BLOCKED_DOMAINS = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
];

function isAllowedOrigin(origin) {
    if (!origin) return false;
    return ALLOWED_ORIGINS.some(allowed => origin.startsWith(allowed.replace(/\/$/, '')));
}

function isValidCertificateUrl(urlString) {
    try {
        const url = new URL(urlString);

        if (!['http:', 'https:'].includes(url.protocol)) {
            return false;
        }

        if (BLOCKED_DOMAINS.some(domain => url.hostname.includes(domain))) {
            return false;
        }

        const hostname = url.hostname;
        if (/^10\./.test(hostname) ||
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
            /^192\.168\./.test(hostname)) {
            return false;
        }

        return ALLOWED_PATTERNS.some(pattern => pattern.test(urlString));
    } catch {
        return false;
    }
}

function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
    };
}

function handleOptions(request) {
    const origin = request.headers.get('Origin');
    return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
    });
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin');

        if (request.method === 'OPTIONS') {
            return handleOptions(request);
        }
        
        // NOTE: If you are selfhosting this proxy, you can remove this check, or can set it to only accept requests from your own domain
        if (!isAllowedOrigin(origin)) {
            return new Response(JSON.stringify({
                error: 'Forbidden',
                message: 'This proxy only accepts requests from bentopdf.com',
            }), {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        if (request.method !== 'GET') {
            return new Response('Method not allowed', {
                status: 405,
                headers: corsHeaders(origin),
            });
        }

        const targetUrl = url.searchParams.get('url');

        if (!targetUrl) {
            return new Response(JSON.stringify({
                error: 'Missing url parameter',
                usage: 'GET /?url=<certificate_url>',
            }), {
                status: 400,
                headers: {
                    ...corsHeaders(origin),
                    'Content-Type': 'application/json',
                },
            });
        }

        if (!isValidCertificateUrl(targetUrl)) {
            return new Response(JSON.stringify({
                error: 'Invalid or disallowed URL',
                message: 'Only certificate-related URLs are allowed (*.crt, *.cer, *.pem, /certs/, /ocsp, /crl)',
            }), {
                status: 403,
                headers: {
                    ...corsHeaders(origin),
                    'Content-Type': 'application/json',
                },
            });
        }

        try {
            const response = await fetch(targetUrl, {
                headers: {
                    'User-Agent': 'BentoPDF-CertProxy/1.0',
                },
            });

            if (!response.ok) {
                return new Response(JSON.stringify({
                    error: 'Failed to fetch certificate',
                    status: response.status,
                    statusText: response.statusText,
                }), {
                    status: response.status,
                    headers: {
                        ...corsHeaders(origin),
                        'Content-Type': 'application/json',
                    },
                });
            }

            const certData = await response.arrayBuffer();

            return new Response(certData, {
                status: 200,
                headers: {
                    ...corsHeaders(origin),
                    'Content-Type': response.headers.get('Content-Type') || 'application/x-x509-ca-cert',
                    'Content-Length': certData.byteLength.toString(),
                    'Cache-Control': 'public, max-age=86400',
                },
            });
        } catch (error) {
            return new Response(JSON.stringify({
                error: 'Proxy error',
                message: error.message,
            }), {
                status: 500,
                headers: {
                    ...corsHeaders(origin),
                    'Content-Type': 'application/json',
                },
            });
        }
    },
};
