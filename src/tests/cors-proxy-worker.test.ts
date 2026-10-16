import { describe, it, expect, afterEach, vi } from 'vitest';
import worker from '../../cloudflare/cors-proxy-worker.js';

const PROXY_URL = 'https://proxy.example.workers.dev/';
const SELF_HOSTED_ORIGIN = 'https://pdf.example.org';

function preflight(origin: string): Request {
  return new Request(PROXY_URL, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
}

function timestampQuery(origin: string, tsaUrl: string): Request {
  return new Request(`${PROXY_URL}?url=${encodeURIComponent(tsaUrl)}`, {
    method: 'POST',
    headers: {
      Origin: origin,
      'Content-Type': 'application/timestamp-query',
    },
    body: new Uint8Array([0x30, 0x00]),
  });
}

describe('CORS proxy worker: allowed origins', () => {
  it('rejects a self-hosted origin by default', async () => {
    const response = await worker.fetch(preflight(SELF_HOSTED_ORIGIN), {});
    expect(response.status).toBe(403);
  });

  it('accepts the official origins by default', async () => {
    const response = await worker.fetch(
      preflight('https://www.bentopdf.com'),
      {}
    );
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      'https://www.bentopdf.com'
    );
  });

  it('accepts an origin configured through ALLOWED_ORIGINS', async () => {
    const response = await worker.fetch(preflight(SELF_HOSTED_ORIGIN), {
      ALLOWED_ORIGINS: `${SELF_HOSTED_ORIGIN},https://pdf.example.net`,
    });
    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      SELF_HOSTED_ORIGIN
    );
  });

  it('still rejects origins outside a configured ALLOWED_ORIGINS', async () => {
    const response = await worker.fetch(preflight('https://evil.example'), {
      ALLOWED_ORIGINS: SELF_HOSTED_ORIGIN,
    });
    expect(response.status).toBe(403);
  });

  it('keeps the defaults when ALLOWED_ORIGINS is blank rather than allowing all', async () => {
    const response = await worker.fetch(preflight(SELF_HOSTED_ORIGIN), {
      ALLOWED_ORIGINS: '  ,  ',
    });
    expect(response.status).toBe(403);
  });
});

describe('CORS proxy worker: allowed TSA destinations', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('refuses a TSA host that is not on the allow-list', async () => {
    const response = await worker.fetch(
      timestampQuery(SELF_HOSTED_ORIGIN, 'https://tsa.example.org/tsr'),
      { ALLOWED_ORIGINS: SELF_HOSTED_ORIGIN }
    );

    expect(response.status).toBe(403);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe('Disallowed TSA host');
  });

  it('refuses a private destination even when its host is allow-listed', async () => {
    const response = await worker.fetch(
      timestampQuery(SELF_HOSTED_ORIGIN, 'http://192.168.1.10/tsr'),
      {
        ALLOWED_ORIGINS: SELF_HOSTED_ORIGIN,
        ALLOWED_TSA_HOSTS: '192.168.1.10',
      }
    );

    expect(response.status).toBe(403);
  });

  it('relays a TSA host added through ALLOWED_TSA_HOSTS', async () => {
    const upstreamBody = new Uint8Array([0x30, 0x03, 0x02, 0x01, 0x00]);
    const fetchMock = vi.fn(async (input: Request | URL | string) => {
      const requestUrl = String(input instanceof Request ? input.url : input);
      // The worker resolves the destination over DNS-over-HTTPS before
      // relaying, to keep internal addresses out of reach.
      if (requestUrl.startsWith('https://1.1.1.1/dns-query')) {
        return new Response(
          JSON.stringify({ Answer: [{ data: '203.0.113.7' }] }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/dns-json' },
          }
        );
      }
      return new Response(upstreamBody, {
        status: 200,
        headers: { 'Content-Type': 'application/timestamp-reply' },
      });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const response = await worker.fetch(
      timestampQuery(SELF_HOSTED_ORIGIN, 'https://tsa.example.org/tsr'),
      {
        ALLOWED_ORIGINS: SELF_HOSTED_ORIGIN,
        ALLOWED_TSA_HOSTS: 'tsa.example.org',
      }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe(
      SELF_HOSTED_ORIGIN
    );
    expect(response.headers.get('Content-Type')).toBe(
      'application/timestamp-reply'
    );
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(upstreamBody);

    const relayed = fetchMock.mock.calls.find(
      ([input]) => !String(input).startsWith('https://1.1.1.1/dns-query')
    );
    expect(relayed?.[0]).toBe('https://tsa.example.org/tsr');
  });
});
