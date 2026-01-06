/**
 * BentoPDF CORS Proxy Worker
 * 
 * This Cloudflare Worker proxies certificate requests for the digital signing tool.
 * It fetches certificates from external CAs that don't have CORS headers enabled
 * and returns them with proper CORS headers.
 * 
 * 
 * Deploy: npx wrangler deploy
 * 
 * Required Environment Variables (set in wrangler.toml or Cloudflare dashboard):
 * - PROXY_SECRET: Shared secret for HMAC signature verification
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


const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000;

const RATE_LIMIT_MAX_REQUESTS = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

async function verifySignature(message, signature, secret) {
    try {
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
            'raw',
            encoder.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const signatureBytes = new Uint8Array(
            signature.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );

        return await crypto.subtle.verify(
            'HMAC',
            key,
            signatureBytes,
            encoder.encode(message)
        );
    } catch (e) {
        console.error('Signature verification error:', e);
        return false;
    }
}

async function generateSignature(message, secret) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(message)
    );

    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

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
        const timestamp = url.searchParams.get('t');
        const signature = url.searchParams.get('sig');

        if (env.PROXY_SECRET) {
            if (!timestamp || !signature) {
                return new Response(JSON.stringify({
                    error: 'Missing authentication parameters',
                    message: 'Request must include timestamp (t) and signature (sig) parameters',
                }), {
                    status: 401,
                    headers: {
                        ...corsHeaders(origin),
                        'Content-Type': 'application/json',
                    },
                });
            }

            const requestTime = parseInt(timestamp, 10);
            const now = Date.now();
            if (isNaN(requestTime) || Math.abs(now - requestTime) > MAX_TIMESTAMP_AGE_MS) {
                return new Response(JSON.stringify({
                    error: 'Request expired or invalid timestamp',
                    message: 'Timestamp must be within 5 minutes of current time',
                }), {
                    status: 401,
                    headers: {
                        ...corsHeaders(origin),
                        'Content-Type': 'application/json',
                    },
                });
            }

            const message = `${targetUrl}${timestamp}`;
            const isValid = await verifySignature(message, signature, env.PROXY_SECRET);

            if (!isValid) {
                return new Response(JSON.stringify({
                    error: 'Invalid signature',
                    message: 'Request signature verification failed',
                }), {
                    status: 401,
                    headers: {
                        ...corsHeaders(origin),
                        'Content-Type': 'application/json',
                    },
                });
            }
        }

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

        const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
        const rateLimitKey = `ratelimit:${clientIP}`;
        const now = Date.now();

        if (env.RATE_LIMIT_KV) {
            const rateLimitData = await env.RATE_LIMIT_KV.get(rateLimitKey, { type: 'json' });
            const requests = rateLimitData?.requests || [];

            const recentRequests = requests.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

            if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
                return new Response(JSON.stringify({
                    error: 'Rate limit exceeded',
                    message: `Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per minute. Please try again later.`,
                    retryAfter: Math.ceil((recentRequests[0] + RATE_LIMIT_WINDOW_MS - now) / 1000),
                }), {
                    status: 429,
                    headers: {
                        ...corsHeaders(origin),
                        'Content-Type': 'application/json',
                        'Retry-After': Math.ceil((recentRequests[0] + RATE_LIMIT_WINDOW_MS - now) / 1000).toString(),
                    },
                });
            }

            recentRequests.push(now);
            await env.RATE_LIMIT_KV.put(rateLimitKey, JSON.stringify({ requests: recentRequests }), {
                expirationTtl: 120,
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

            const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
            if (contentLength > MAX_FILE_SIZE_BYTES) {
                return new Response(JSON.stringify({
                    error: 'File too large',
                    message: `Certificate file exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024}KB`,
                    size: contentLength,
                    maxSize: MAX_FILE_SIZE_BYTES,
                }), {
                    status: 413,
                    headers: {
                        ...corsHeaders(origin),
                        'Content-Type': 'application/json',
                    },
                });
            }

            const certData = await response.arrayBuffer();

            if (certData.byteLength > MAX_FILE_SIZE_BYTES) {
                return new Response(JSON.stringify({
                    error: 'File too large',
                    message: `Certificate file exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024}KB`,
                    size: certData.byteLength,
                    maxSize: MAX_FILE_SIZE_BYTES,
                }), {
                    status: 413,
                    headers: {
                        ...corsHeaders(origin),
                        'Content-Type': 'application/json',
                    },
                });
            }

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
