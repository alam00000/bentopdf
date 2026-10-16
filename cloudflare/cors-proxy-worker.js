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
 *
 * Optional Environment Variables (see cloudflare/wrangler.toml):
 * - ALLOWED_ORIGINS: comma-separated list of origins allowed to call this
 *   proxy. Self-hosters set this to their own origin(s) so they can deploy the
 *   worker as-is instead of editing this file. Defaults to the official
 *   BentoPDF origins.
 * - ALLOWED_TSA_HOSTS: comma-separated list of RFC 3161 timestamp hosts this
 *   proxy may POST to. Defaults to the built-in providers. Anything not on the
 *   list is refused, so a misconfigured value fails closed.
 */

const ALLOWED_PATH_PATTERNS = [
  /\.(crt|cer|pem|der|p7c|p7b)$/i,
  /(^|\/)certs(\/|$)/i,
  /(^|\/)ocsp(\/|$)/i,
  /(^|\/)crl(\/|$)/i,
  /(^|\/)caissuers(\/|$)/i,
];

const DEFAULT_ALLOWED_TSA_HOSTS = [
  'timestamp.digicert.com',
  'timestamp.sectigo.com',
  'ts.ssl.com',
  'freetsa.org',
  'tsa.mesign.com',
];

const DEFAULT_ALLOWED_ORIGINS = [
  'https://www.bentopdf.com',
  'https://bentopdf.com',
];

/**
 * Splits a comma-separated environment variable into trimmed entries.
 * Returns null when nothing usable was configured, so callers keep their
 * defaults rather than ending up with an empty allow-list.
 */
function parseListVar(value) {
  if (typeof value !== 'string') return null;
  const entries = value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  return entries.length > 0 ? entries : null;
}

function resolveAllowedOrigins(env) {
  return parseListVar(env?.ALLOWED_ORIGINS) || DEFAULT_ALLOWED_ORIGINS;
}

function resolveAllowedTsaHosts(env) {
  return new Set(
    parseListVar(env?.ALLOWED_TSA_HOSTS) || DEFAULT_ALLOWED_TSA_HOSTS
  );
}

const SAFE_CONTENT_TYPES = [
  'application/x-x509-ca-cert',
  'application/pkix-cert',
  'application/x-pem-file',
  'application/pkcs7-mime',
  'application/octet-stream',
  'application/timestamp-reply',
  'text/plain',
];

const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000;

const RATE_LIMIT_MAX_REQUESTS = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

let warnedNoProxySecret = false;

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
      signature.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
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

function isAllowedOrigin(origin, allowedOrigins) {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

function isPrivateOrReservedHost(hostname) {
  if (
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^169\.254\./.test(hostname) || // link-local (cloud metadata)
    /^100\.(6[4-9]|[7-9]\d|1[0-1]\d|12[0-7])\./.test(hostname) || // CGNAT
    /^127\./.test(hostname) ||
    /^0\./.test(hostname)
  ) {
    return true;
  }

  if (/^\d+$/.test(hostname)) {
    return true;
  }

  const lower = hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (
    lower === '::1' ||
    lower.startsWith('::ffff:') ||
    lower.startsWith('fe80') ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('ff')
  ) {
    return true;
  }

  const blockedNames = [
    'localhost',
    'localhost.localdomain',
    '0.0.0.0',
    '[::1]',
  ];
  if (blockedNames.includes(hostname.toLowerCase())) {
    return true;
  }

  return false;
}

async function hostnameResolvesToPrivate(hostname) {
  const clean = hostname.replace(/^\[|\]$/g, '');
  if (/^\d+\.\d+\.\d+\.\d+$/.test(clean) || clean.includes(':')) {
    return isPrivateOrReservedHost(clean);
  }
  const ips = [];
  for (const type of ['A', 'AAAA']) {
    try {
      const res = await fetch(
        `https://1.1.1.1/dns-query?name=${encodeURIComponent(clean)}&type=${type}`,
        { headers: { accept: 'application/dns-json' } }
      );
      if (!res.ok) return true;
      const data = await res.json();
      for (const ans of data.Answer || []) {
        if (ans && ans.data) ips.push(String(ans.data).replace(/\.$/, ''));
      }
    } catch {
      return true;
    }
  }
  if (ips.length === 0) return true;
  return ips.some((ip) => isPrivateOrReservedHost(ip));
}

function isValidCertificateUrl(urlString) {
  try {
    const url = new URL(urlString);

    if (!['http:', 'https:'].includes(url.protocol)) {
      return false;
    }

    if (isPrivateOrReservedHost(url.hostname)) {
      return false;
    }

    return ALLOWED_PATH_PATTERNS.some((pattern) => pattern.test(url.pathname));
  } catch {
    return false;
  }
}

function isValidTsaUrl(urlString, allowedTsaHosts) {
  try {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    if (isPrivateOrReservedHost(url.hostname)) return false;
    return allowedTsaHosts.has(url.hostname);
  } catch {
    return false;
  }
}

function getSafeContentType(upstreamContentType) {
  if (!upstreamContentType) return 'application/octet-stream';
  const match = SAFE_CONTENT_TYPES.find((ct) =>
    upstreamContentType.startsWith(ct)
  );
  return match || 'application/octet-stream';
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function handleOptions(request, allowedOrigins) {
  const origin = request.headers.get('Origin');
  if (!isAllowedOrigin(origin, allowedOrigins)) {
    return new Response(null, { status: 403 });
  }
  return new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const allowedOrigins = resolveAllowedOrigins(env);
    const allowedTsaHosts = resolveAllowedTsaHosts(env);

    if (request.method === 'OPTIONS') {
      return handleOptions(request, allowedOrigins);
    }

    // NOTE: If you are selfhosting this proxy, set the ALLOWED_ORIGINS variable to your own origin(s) in wrangler.toml
    // SECURITY: The Origin allow-list and the optional PROXY_SECRET HMAC are anti-abuse controls, NOT a security boundary — the Origin
    // header is forgeable by non-browser clients and the HMAC secret ships in the public client bundle. The real SSRF defense is the
    // private/reserved-IP resolution check (hostnameResolvesToPrivate). Deployments running this off Cloudflare cannot fully close the
    // DNS-rebinding gap in code and MUST add network egress filtering (see docs/self-hosting/cors-proxy.md).
    if (!isAllowedOrigin(origin, allowedOrigins)) {
      return new Response(
        JSON.stringify({
          error: 'Forbidden',
          message: 'This proxy only accepts requests from allowed origins',
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (request.method !== 'GET' && request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders(origin),
      });
    }

    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response(
        JSON.stringify({
          error: 'Missing url parameter',
          usage: 'GET /?url=<certificate_url> or POST /?url=<tsa_url>',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const requestContentType = request.headers.get('Content-Type') || '';
    const isTsaQuery =
      request.method === 'POST' &&
      requestContentType === 'application/timestamp-query';

    if (isTsaQuery) {
      if (!isValidTsaUrl(targetUrl, allowedTsaHosts)) {
        return new Response(
          JSON.stringify({
            error: 'Disallowed TSA host',
            message: `Only known RFC 3161 TSA hosts are accepted: ${[...allowedTsaHosts].join(', ')}`,
          }),
          {
            status: 403,
            headers: {
              ...corsHeaders(origin),
              'Content-Type': 'application/json',
            },
          }
        );
      }
    } else if (!isValidCertificateUrl(targetUrl)) {
      return new Response(
        JSON.stringify({
          error: 'Invalid or disallowed URL',
          message:
            'Only certificate-related URLs are allowed (*.crt, *.cer, *.pem, /certs/, /ocsp, /crl)',
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (env.PROXY_SECRET) {
      const timestamp = url.searchParams.get('t');
      const signature = url.searchParams.get('sig');

      if (!timestamp || !signature) {
        return new Response(
          JSON.stringify({
            error: 'Missing authentication parameters',
            message:
              'Request must include timestamp (t) and signature (sig) parameters',
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders(origin),
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const requestTime = parseInt(timestamp, 10);
      const now = Date.now();
      if (
        isNaN(requestTime) ||
        requestTime > now + 60000 ||
        now - requestTime > MAX_TIMESTAMP_AGE_MS
      ) {
        return new Response(
          JSON.stringify({
            error: 'Request expired or invalid timestamp',
            message: 'Timestamp must be within 5 minutes of current time',
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders(origin),
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const message = `${targetUrl}${timestamp}`;
      const isValid = await verifySignature(
        message,
        signature,
        env.PROXY_SECRET
      );

      if (!isValid) {
        return new Response(
          JSON.stringify({
            error: 'Invalid signature',
            message: 'Request signature verification failed',
          }),
          {
            status: 401,
            headers: {
              ...corsHeaders(origin),
              'Content-Type': 'application/json',
            },
          }
        );
      }
    } else if (!warnedNoProxySecret) {
      warnedNoProxySecret = true;
      console.warn(
        '[CORS Proxy] PROXY_SECRET is not set — request signatures are not verified, so the proxy is callable by any client that can ' +
          'send an allowed Origin header. Set PROXY_SECRET to deter casual abuse (note: it ships in the public client bundle, so it is ' +
          'not a real authentication boundary), and add network egress filtering if running off Cloudflare.'
      );
    }

    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rateLimitKey = `ratelimit:${clientIP}`;
    const now = Date.now();

    if (env.RATE_LIMIT_KV) {
      const rateLimitData = await env.RATE_LIMIT_KV.get(rateLimitKey, {
        type: 'json',
      });
      const requests = rateLimitData?.requests || [];

      const recentRequests = requests.filter(
        (t) => now - t < RATE_LIMIT_WINDOW_MS
      );

      if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
        return new Response(
          JSON.stringify({
            error: 'Rate limit exceeded',
            message: `Maximum ${RATE_LIMIT_MAX_REQUESTS} requests per minute. Please try again later.`,
            retryAfter: Math.ceil(
              (recentRequests[0] + RATE_LIMIT_WINDOW_MS - now) / 1000
            ),
          }),
          {
            status: 429,
            headers: {
              ...corsHeaders(origin),
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil(
                (recentRequests[0] + RATE_LIMIT_WINDOW_MS - now) / 1000
              ).toString(),
            },
          }
        );
      }

      recentRequests.push(now);
      await env.RATE_LIMIT_KV.put(
        rateLimitKey,
        JSON.stringify({ requests: recentRequests }),
        {
          expirationTtl: 120,
        }
      );
    } else {
      console.warn(
        '[CORS Proxy] RATE_LIMIT_KV not configured — rate limiting is disabled'
      );
    }

    let targetHostname;
    try {
      targetHostname = new URL(targetUrl).hostname;
    } catch {
      targetHostname = '';
    }
    if (!targetHostname || (await hostnameResolvesToPrivate(targetHostname))) {
      return new Response(
        JSON.stringify({
          error: 'Forbidden destination',
          message: 'The requested host is not permitted',
        }),
        {
          status: 403,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    try {
      const upstreamInit = {
        method: request.method,
        redirect: 'manual',
        signal: AbortSignal.timeout(10000),
        headers: {
          'User-Agent': 'BentoPDF-CertProxy/1.0',
        },
      };

      if (isTsaQuery) {
        upstreamInit.headers['Content-Type'] = 'application/timestamp-query';
        upstreamInit.body = await request.arrayBuffer();
      }

      const response = await fetch(targetUrl, upstreamInit);

      if (response.status >= 300 && response.status < 400) {
        return new Response(
          JSON.stringify({
            error: 'Redirect blocked',
            message: 'Upstream redirects are not allowed',
          }),
          {
            status: 502,
            headers: {
              ...corsHeaders(origin),
              'Content-Type': 'application/json',
            },
          }
        );
      }

      if (!response.ok) {
        return new Response(
          JSON.stringify({
            error: 'Failed to fetch certificate',
            status: response.status,
          }),
          {
            status: response.status,
            headers: {
              ...corsHeaders(origin),
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Check Content-Length header first (fast reject for known-large responses)
      const contentLength = parseInt(
        response.headers.get('Content-Length') || '0',
        10
      );
      if (contentLength > MAX_FILE_SIZE_BYTES) {
        return new Response(
          JSON.stringify({
            error: 'File too large',
            message: `Certificate file exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024}KB`,
          }),
          {
            status: 413,
            headers: {
              ...corsHeaders(origin),
              'Content-Type': 'application/json',
            },
          }
        );
      }

      const reader = response.body.getReader();
      const chunks = [];
      let totalSize = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        totalSize += value.byteLength;
        if (totalSize > MAX_FILE_SIZE_BYTES) {
          reader.cancel();
          return new Response(
            JSON.stringify({
              error: 'File too large',
              message: `Certificate file exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024}KB`,
            }),
            {
              status: 413,
              headers: {
                ...corsHeaders(origin),
                'Content-Type': 'application/json',
              },
            }
          );
        }

        chunks.push(value);
      }

      const certData = new Uint8Array(totalSize);
      let offset = 0;
      for (const chunk of chunks) {
        certData.set(chunk, offset);
        offset += chunk.byteLength;
      }

      return new Response(certData, {
        status: 200,
        headers: {
          ...corsHeaders(origin),
          'Content-Type': getSafeContentType(
            response.headers.get('Content-Type')
          ),
          'Content-Length': totalSize.toString(),
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    } catch (error) {
      console.error('Proxy fetch error:', error);
      return new Response(
        JSON.stringify({
          error: 'Proxy error',
          message: 'Failed to fetch the requested certificate',
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }
  },
};
