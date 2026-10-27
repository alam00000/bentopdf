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
  /\.(crt|cer|pem|der|p7c|p7b)$/i,
  /(^|\/)certs(\/|$)/i,
  /(^|\/)ocsp(\/|$)/i,
  /(^|\/)crl(\/|$)/i,
  /(^|\/)caissuers(\/|$)/i,
];

const ALLOWED_TSA_HOSTS = new Set([
  'timestamp.digicert.com',
  'timestamp.sectigo.com',
  'ts.ssl.com',
  'freetsa.org',
  'tsa.mesign.com',
]);

const ALLOWED_ORIGINS = ['https://www.bentopdf.com', 'https://bentopdf.com'];

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

function isAllowedOrigin(origin) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

function parseIPv4(address) {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(address);
  if (!match) return null;
  const octets = match.slice(1).map(Number);
  if (octets.some((octet) => octet > 255)) return null;
  return octets.reduce((value, octet) => value * 256 + octet, 0);
}

function parseIPv6(address) {
  let text = address.toLowerCase();
  const embedded = /^(.*:)(\d+\.\d+\.\d+\.\d+)$/.exec(text);
  if (embedded) {
    const ipv4 = parseIPv4(embedded[2]);
    if (ipv4 === null) return null;
    text = `${embedded[1]}${Math.floor(ipv4 / 65536).toString(16)}:${(ipv4 % 65536).toString(16)}`;
  }
  const sections = text.split('::');
  if (sections.length > 2) return null;
  const head = sections[0] ? sections[0].split(':') : [];
  const tail =
    sections.length === 2 && sections[1] ? sections[1].split(':') : [];
  const missing = 8 - head.length - tail.length;
  if (sections.length === 1 ? missing !== 0 : missing < 1) return null;
  const groups = [...head, ...Array(missing).fill('0'), ...tail];
  if (!groups.every((group) => /^[0-9a-f]{1,4}$/.test(group))) return null;
  return groups.map((group) => parseInt(group, 16));
}

const BLOCKED_IPV4_RANGES = [
  '0.0.0.0/8',
  '10.0.0.0/8',
  '100.64.0.0/10',
  '127.0.0.0/8',
  '169.254.0.0/16',
  '172.16.0.0/12',
  '192.0.0.0/24',
  '192.0.2.0/24',
  '192.168.0.0/16',
  '198.18.0.0/15',
  '198.51.100.0/24',
  '203.0.113.0/24',
  '224.0.0.0/4',
  '240.0.0.0/4',
].map((cidr) => {
  const [address, prefixLength] = cidr.split('/');
  return { base: parseIPv4(address), size: 2 ** (32 - Number(prefixLength)) };
});

const BLOCKED_IPV6_RANGES = [
  '::/128',
  '::1/128',
  '::/96',
  '::ffff:0:0/96',
  '64:ff9b::/96',
  '64:ff9b:1::/48',
  '100::/64',
  '2001::/32',
  '2001:db8::/32',
  '2002::/16',
  'fc00::/7',
  'fe80::/10',
  'fec0::/10',
  'ff00::/8',
].map((cidr) => {
  const [address, prefixLength] = cidr.split('/');
  return { groups: parseIPv6(address), prefixLength: Number(prefixLength) };
});

function isBlockedIPv4(value) {
  return BLOCKED_IPV4_RANGES.some(
    ({ base, size }) => value >= base && value < base + size
  );
}

function isBlockedIPv6(groups) {
  return BLOCKED_IPV6_RANGES.some((range) =>
    range.groups.every((group, index) => {
      const bitsInGroup = Math.min(
        16,
        Math.max(0, range.prefixLength - index * 16)
      );
      const groupMask = (0xffff << (16 - bitsInGroup)) & 0xffff;
      return (groups[index] & groupMask) === (group & groupMask);
    })
  );
}

function isBlockedIp(address) {
  const ipv4 = parseIPv4(address);
  if (ipv4 !== null) return isBlockedIPv4(ipv4);
  const ipv6Groups = parseIPv6(address);
  if (ipv6Groups !== null) return isBlockedIPv6(ipv6Groups);
  return true;
}

function isIpLiteral(host) {
  return /^[\d.]+$/.test(host) || host.includes(':');
}

function getRateLimitKey(ip) {
  const ipv6Groups = ip.includes(':') ? parseIPv6(ip) : null;
  if (!ipv6Groups) return ip;
  return `${ipv6Groups
    .slice(0, 4)
    .map((group) => group.toString(16))
    .join(':')}::/64`;
}

function isPrivateOrReservedHost(hostname) {
  const host = hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '');

  if (['localhost', 'localhost.localdomain'].includes(host)) {
    return true;
  }

  return isIpLiteral(host) && isBlockedIp(host);
}

async function hostnameResolvesToPrivate(hostname) {
  const clean = hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
    .replace(/\.$/, '');
  if (isPrivateOrReservedHost(clean)) return true;
  if (isIpLiteral(clean)) return false;
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
        if (ans && (ans.type === 1 || ans.type === 28) && ans.data) {
          ips.push(String(ans.data));
        }
      }
    } catch {
      return true;
    }
  }
  if (ips.length === 0) return true;
  return ips.some((ip) => isBlockedIp(ip));
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

function isValidTsaUrl(urlString) {
  try {
    const url = new URL(urlString);
    if (!['http:', 'https:'].includes(url.protocol)) return false;
    if (isPrivateOrReservedHost(url.hostname)) return false;
    return ALLOWED_TSA_HOSTS.has(url.hostname);
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
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');

    if (request.method === 'OPTIONS') {
      return handleOptions(request);
    }

    // NOTE: If you are selfhosting this proxy, you can remove this check, or can set it to only accept requests from your own domain
    // SECURITY: The Origin allow-list and the optional PROXY_SECRET HMAC are anti-abuse controls, NOT a security boundary — the Origin
    // header is forgeable by non-browser clients and the HMAC secret ships in the public client bundle. The real SSRF defense is the
    // private/reserved-IP resolution check (hostnameResolvesToPrivate). Deployments running this off Cloudflare cannot fully close the
    // DNS-rebinding gap in code and MUST add network egress filtering (see docs/self-hosting/cors-proxy.md).
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
      if (!isValidTsaUrl(targetUrl)) {
        return new Response(
          JSON.stringify({
            error: 'Disallowed TSA host',
            message: `Only known RFC 3161 TSA hosts are accepted: ${[...ALLOWED_TSA_HOSTS].join(', ')}`,
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
    const rateLimitKey = `ratelimit:${getRateLimitKey(clientIP)}`;
    const now = Date.now();

    if (env.RATE_LIMIT_KV) {
      try {
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
      } catch (error) {
        console.error(
          '[CORS Proxy] Rate limit KV error, allowing request:',
          error
        );
      }
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
