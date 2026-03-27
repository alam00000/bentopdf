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
});
