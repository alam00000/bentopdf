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

const ALLOWED_PATH_PATTERNS = [
  /\.crt$/i,
  /\.cer$/i,
  /\.pem$/i,
  /\/certs\//i,
  /\/ocsp/i,
  /\/crl/i,
  /caIssuers/i,
];

const ALLOWED_ORIGINS = ['https://www.bentopdf.com', 'https://bentopdf.com'];

const SAFE_CONTENT_TYPES = [
  'application/x-x509-ca-cert',
  'application/pkix-cert',
  'application/x-pem-file',
  'application/pkcs7-mime',
  'application/octet-stream',
  'text/plain',
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

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function handleOptions(request) {
  const origin = request.headers.get('Origin');
  if (!isAllowedOrigin(origin)) {
    return new Response(null, { status: 403 });
  }
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

    if (request.method !== 'GET') {
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
          usage: 'GET /?url=<certificate_url>',
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

    if (!isValidCertificateUrl(targetUrl)) {
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
        Math.abs(now - requestTime) > MAX_TIMESTAMP_AGE_MS
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

    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'BentoPDF-CertProxy/1.0',
        },
      });

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
          'Cache-Control': 'public, max-age=86400',
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
