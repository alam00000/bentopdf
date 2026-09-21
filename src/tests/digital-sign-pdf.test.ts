import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

const mockSign = vi.fn();

vi.mock('zgapdfsigner', () => {
  const MockPdfSigner = vi.fn(function (this: { sign: typeof mockSign }) {
    this.sign = mockSign;
  });
  return { PdfSigner: MockPdfSigner };
});

import { PdfSigner } from 'zgapdfsigner';
import { timestampPdf } from '@/js/logic/digital-sign-pdf';

const SAMPLE_PDF_PATH = path.resolve(__dirname, './fixtures/sample.pdf');
const SAMPLE_PDF_SHA256 =
  '229defbb0cee6f02673a5cde290d0673e75a0dc31cec43989c8ab2a4eca7e1bb';

async function sha256(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    new Uint8Array(data)
  );
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

describe('timestampPdf', () => {
  let samplePdfBytes: Uint8Array;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('VITE_CORS_PROXY_URL', '');
    vi.stubEnv('VITE_CORS_PROXY_SECRET', '');
    samplePdfBytes = new Uint8Array(fs.readFileSync(SAMPLE_PDF_PATH));
  });

  it('should load the correct sample PDF', async () => {
    const hash = await sha256(samplePdfBytes);
    expect(hash).toBe(SAMPLE_PDF_SHA256);
  });

  it('should call PdfSigner with signdate option containing the TSA URL', async () => {
    const fakeSigned = new Uint8Array([80, 68, 70, 45, 49, 46, 52]); // "PDF-1.4"
    mockSign.mockResolvedValueOnce(fakeSigned);

    const tsaUrl = 'http://timestamp.digicert.com';
    await timestampPdf(samplePdfBytes, tsaUrl);

    expect(PdfSigner).toHaveBeenCalledWith({
      signdate: { url: tsaUrl },
    });
  });

  it('should pass the PDF bytes to signer.sign()', async () => {
    const fakeSigned = new Uint8Array([1, 2, 3]);
    mockSign.mockResolvedValueOnce(fakeSigned);

    const tsaUrl = 'http://timestamp.digicert.com';
    await timestampPdf(samplePdfBytes, tsaUrl);

    expect(mockSign).toHaveBeenCalledOnce();
    const passedBytes = mockSign.mock.calls[0][0];
    expect(passedBytes).toBeInstanceOf(Uint8Array);
    expect(passedBytes.length).toBe(samplePdfBytes.length);
  });

  it('should return a Uint8Array from the signed result', async () => {
    const fakeSigned = new Uint8Array([10, 20, 30, 40]);
    mockSign.mockResolvedValueOnce(fakeSigned);

    const result = await timestampPdf(samplePdfBytes, 'http://ts.ssl.com');

    expect(result).toBeInstanceOf(Uint8Array);
    expect(result).toEqual(new Uint8Array([10, 20, 30, 40]));
  });

  it('should propagate errors from PdfSigner.sign()', async () => {
    mockSign.mockRejectedValueOnce(new Error('TSA server unreachable'));

    await expect(
      timestampPdf(samplePdfBytes, 'http://invalid-tsa.example.com')
    ).rejects.toThrow('TSA server unreachable');
  });

  it('should work with different TSA URLs', async () => {
    const fakeSigned = new Uint8Array([1]);
    mockSign.mockResolvedValue(fakeSigned);

    const urls = [
      'http://timestamp.digicert.com',
      'http://timestamp.sectigo.com',
      'https://freetsa.org/tsr',
    ];

    for (const url of urls) {
      vi.mocked(PdfSigner).mockClear();
      await timestampPdf(samplePdfBytes, url);

      expect(PdfSigner).toHaveBeenCalledWith({
        signdate: { url },
      });
    }
  });

  it('should not modify the original PDF bytes', async () => {
    const fakeSigned = new Uint8Array([1, 2, 3]);
    mockSign.mockResolvedValueOnce(fakeSigned);

    const originalCopy = new Uint8Array(samplePdfBytes);
    await timestampPdf(samplePdfBytes, 'http://timestamp.digicert.com');

    expect(samplePdfBytes).toEqual(originalCopy);
  });

  it('should pre-proxy the TSA URL when CORS proxy is configured', async () => {
    vi.stubEnv(
      'VITE_CORS_PROXY_URL',
      'https://bentopdf-cors-proxy.bentopdf.workers.dev'
    );
    vi.resetModules();
    const { timestampPdf: freshTimestamp } =
      await import('@/js/logic/digital-sign-pdf');

    mockSign.mockResolvedValueOnce(new Uint8Array([1]));
    await freshTimestamp(samplePdfBytes, 'http://timestamp.digicert.com');

    const callArg = vi.mocked(PdfSigner).mock.calls[0][0] as {
      signdate: { url: string };
    };
    expect(callArg.signdate.url).toMatch(
      /^https:\/\/bentopdf-cors-proxy\.bentopdf\.workers\.dev\?url=/
    );
    expect(callArg.signdate.url).toContain(
      encodeURIComponent('http://timestamp.digicert.com')
    );
  });

  it('should throw a clear error when HTTPS page targets HTTP TSA without proxy', async () => {
    vi.stubEnv('VITE_CORS_PROXY_URL', '');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        protocol: 'https:',
        origin: 'https://selfhost.example.com',
        hostname: 'selfhost.example.com',
      },
    });
    vi.resetModules();
    const { timestampPdf: freshTimestamp } =
      await import('@/js/logic/digital-sign-pdf');

    await expect(
      freshTimestamp(samplePdfBytes, 'http://timestamp.digicert.com')
    ).rejects.toThrow(/HTTPS page|VITE_CORS_PROXY_URL/);
  });

  it('should explain the missing relay when the browser blocks the request', async () => {
    // Regression test for #874: on a self-hosted instance with no relay the
    // RFC 3161 POST never leaves the page (failed CORS preflight, or a
    // connect-src violation), and the browser only says "Failed to fetch".
    vi.stubEnv('VITE_CORS_PROXY_URL', '');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        protocol: 'https:',
        origin: 'https://pdf.example.org',
        hostname: 'pdf.example.org',
      },
    });
    vi.resetModules();
    const { timestampPdf: freshTimestamp, TimestampProxyRequiredError } =
      await import('@/js/logic/digital-sign-pdf');

    const blocked = new TypeError('Failed to fetch');
    mockSign.mockRejectedValueOnce(blocked);

    const rejection = await freshTimestamp(
      samplePdfBytes,
      'https://freetsa.org/tsr'
    ).catch((error: unknown) => error);

    expect(rejection).toBeInstanceOf(TimestampProxyRequiredError);
    const error = rejection as InstanceType<typeof TimestampProxyRequiredError>;
    expect(error.tsaUrl).toBe('https://freetsa.org/tsr');
    expect(error.message).toContain('VITE_CORS_PROXY_URL');
    expect(error.message).toContain('VITE_TSA_ENDPOINTS');
    expect(error.message).toContain('freetsa.org/tsr');
    expect(error.cause).toBe(blocked);
  });

  it('should not rewrite signer failures unrelated to a blocked request', async () => {
    vi.stubEnv('VITE_CORS_PROXY_URL', '');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        protocol: 'https:',
        origin: 'https://pdf.example.org',
        hostname: 'pdf.example.org',
      },
    });
    vi.resetModules();
    const { timestampPdf: freshTimestamp } =
      await import('@/js/logic/digital-sign-pdf');

    mockSign.mockRejectedValueOnce(new Error('TSA returned a bad token'));

    await expect(
      freshTimestamp(samplePdfBytes, 'https://freetsa.org/tsr')
    ).rejects.toThrow('TSA returned a bad token');
  });

  it('should keep the original error when a relay is configured', async () => {
    vi.stubEnv('VITE_CORS_PROXY_URL', 'https://proxy.example.org');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        protocol: 'https:',
        origin: 'https://pdf.example.org',
        hostname: 'pdf.example.org',
      },
    });
    vi.resetModules();
    const { timestampPdf: freshTimestamp, isCorsProxyConfigured } =
      await import('@/js/logic/digital-sign-pdf');

    expect(isCorsProxyConfigured()).toBe(true);
    mockSign.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(
      freshTimestamp(samplePdfBytes, 'https://freetsa.org/tsr')
    ).rejects.toThrow('Failed to fetch');
  });

  it('should fall back to the default proxy on official domains', async () => {
    vi.stubEnv('VITE_CORS_PROXY_URL', '');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        protocol: 'https:',
        origin: 'https://www.bentopdf.com',
        hostname: 'www.bentopdf.com',
      },
    });
    vi.resetModules();
    const { timestampPdf: freshTimestamp } =
      await import('@/js/logic/digital-sign-pdf');

    mockSign.mockResolvedValueOnce(new Uint8Array([1]));
    await freshTimestamp(samplePdfBytes, 'http://timestamp.digicert.com');

    const callArg = vi.mocked(PdfSigner).mock.calls[0][0] as {
      signdate: { url: string };
    };
    expect(callArg.signdate.url).toMatch(
      /^https:\/\/bentopdf-cors-proxy\.bentopdf\.workers\.dev\?url=/
    );
    expect(callArg.signdate.url).toContain(
      encodeURIComponent('http://timestamp.digicert.com')
    );
  });
});
