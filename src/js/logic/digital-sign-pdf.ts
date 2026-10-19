import { PdfSigner, type SignOption } from 'zgapdfsigner';
import forge from 'node-forge';
import { CertificateData, SignPdfOptions } from '@/types';
import { isValidTsaRequestUrl } from '../config/timestamp-tsa.js';

function binaryStringToArrayBuffer(binary: string) {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Picks the certificate that belongs to the private key. PFX/PEM files that
 * contain a chain do not always list the end-entity certificate first, and the
 * first certificate is not necessarily the one that matches the key.
 * Falls back to the first certificate if no match can be determined.
 */
function findCertificateForKey(
  certs: forge.pki.Certificate[],
  privateKey: forge.pki.PrivateKey | undefined
): forge.pki.Certificate {
  if (privateKey && certs.length > 1) {
    try {
      const rsaKey = privateKey as forge.pki.rsa.PrivateKey;
      const keyPublicPem = forge.pki.publicKeyToPem(
        forge.pki.rsa.setPublicKey(rsaKey.n, rsaKey.e)
      );
      const match = certs.find(
        (c) => forge.pki.publicKeyToPem(c.publicKey) === keyPublicPem
      );
      if (match) return match;
    } catch {
      // fall through to the first certificate
    }
  }
  return certs[0];
}

function wrapAsPkcs12(
  privateKey: forge.pki.PrivateKey,
  certChain: forge.pki.Certificate[],
  password: string
) {
  const p12Asn1 = forge.pkcs12.toPkcs12Asn1(privateKey, certChain, password, {
    algorithm: '3des',
  });
  return binaryStringToArrayBuffer(forge.asn1.toDer(p12Asn1).getBytes());
}

export function parsePfxFile(
  pfxBytes: ArrayBuffer,
  password: string
): CertificateData {
  const pfxAsn1 = forge.asn1.fromDer(
    forge.util.createBuffer(new Uint8Array(pfxBytes))
  );

  // PKCS#12 distinguishes an empty-string password from "no password".
  // Files exported without a password can use either, so when the caller
  // passes '' and it fails the MAC check, retry with no password at all.
  let pfx: forge.pkcs12.Pkcs12Pfx;
  let usedNullPassword = false;
  try {
    pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);
  } catch (error) {
    if (password !== '') throw error;
    try {
      pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1);
      usedNullPassword = true;
    } catch {
      throw error;
    }
  }

  const certBagArray = pfx.getBags({ bagType: forge.pki.oids.certBag })[
    forge.pki.oids.certBag
  ];
  const shroudedKeyBagArray = pfx.getBags({
    bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
  })[forge.pki.oids.pkcs8ShroudedKeyBag];
  const plainKeyBagArray = pfx.getBags({ bagType: forge.pki.oids.keyBag })[
    forge.pki.oids.keyBag
  ];

  if (!certBagArray || certBagArray.length === 0) {
    throw new Error('No certificate found in PFX file');
  }

  const hasShroudedKey = !!shroudedKeyBagArray?.length;
  if (!hasShroudedKey && !plainKeyBagArray?.length) {
    throw new Error('No private key found in PFX file');
  }

  const privateKey =
    shroudedKeyBagArray?.[0]?.key ?? plainKeyBagArray?.[0]?.key;
  const certs = certBagArray
    .map((bag) => bag.cert)
    .filter((c): c is forge.pki.Certificate => !!c);

  if (certs.length === 0) {
    throw new Error('Failed to extract certificate from PFX file');
  }

  const certificate = findCertificateForKey(certs, privateKey);

  // Only hand the original file to the signer when it is protected by a real,
  // non-empty password and the key is stored encrypted. Otherwise (empty or
  // null password, or an unencrypted key bag) re-wrap the key and certificates
  // into a standard PKCS#12 with a throwaway password, the same approach
  // parsePemFiles uses, so the signer never has to deal with an empty password.
  const needsRewrap = password === '' || usedNullPassword || !hasShroudedKey;
  if (!needsRewrap) {
    return { p12Buffer: pfxBytes, password, certificate };
  }

  if (!privateKey) {
    throw new Error('Failed to extract private key from PFX file');
  }

  const wrappedPassword = crypto.randomUUID();
  const p12Buffer = wrapAsPkcs12(
    privateKey,
    [certificate, ...certs.filter((c) => c !== certificate)],
    wrappedPassword
  );

  return { p12Buffer, password: wrappedPassword, certificate };
}

export function parsePemFiles(
  certPem: string,
  keyPem: string,
  keyPassword?: string
): CertificateData {
  const certPems =
    certPem.match(
      /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g
    ) ?? [];
  if (certPems.length === 0) {
    throw new Error('No certificate found in PEM file');
  }
  const certs = certPems.map((pem) => forge.pki.certificateFromPem(pem));

  let privateKey: forge.pki.PrivateKey;
  if (keyPem.includes('ENCRYPTED')) {
    if (!keyPassword) {
      throw new Error('Password required for encrypted private key');
    }
    let decrypted: forge.pki.PrivateKey | null;
    try {
      decrypted = forge.pki.decryptRsaPrivateKey(keyPem, keyPassword);
    } catch {
      decrypted = null;
    }
    if (!decrypted) {
      throw new Error(
        'Failed to decrypt private key. Incorrect password or unsupported encryption.'
      );
    }
    privateKey = decrypted;
  } else {
    try {
      privateKey = forge.pki.privateKeyFromPem(keyPem);
    } catch (error) {
      const detail = error instanceof Error ? `: ${error.message}` : '';
      throw new Error(
        `Could not read the private key. Only RSA keys are supported in PEM files${detail}`,
        { cause: error }
      );
    }
  }

  const certificate = findCertificateForKey(certs, privateKey);
  const p12Password = keyPassword || crypto.randomUUID();
  const p12Buffer = wrapAsPkcs12(
    privateKey,
    [certificate, ...certs.filter((c) => c !== certificate)],
    p12Password
  );

  return { p12Buffer, password: p12Password, certificate };
}

export function parseCombinedPem(
  pemContent: string,
  password?: string
): CertificateData {
  const certMatches = pemContent.match(
    /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g
  );
  const keyMatch = pemContent.match(
    /-----BEGIN (RSA |EC |ENCRYPTED )?PRIVATE KEY-----[\s\S]*?-----END (RSA |EC |ENCRYPTED )?PRIVATE KEY-----/
  );
  const blockTypes = Array.from(
    pemContent.matchAll(/-----BEGIN ([^-\r\n]+)-----/g),
    (m) => m[1]
  );

  if (!certMatches) {
    throw new Error(
      `No certificate found in PEM file (found: ${blockTypes.join(', ') || 'no PEM blocks'})`
    );
  }

  if (!keyMatch) {
    const unsupportedKey = blockTypes.find((type) =>
      type.includes('PRIVATE KEY')
    );
    if (unsupportedKey) {
      throw new Error(
        `Unsupported private key format "${unsupportedKey}". Convert it to an RSA PEM/PKCS#8 key or use a .pfx/.p12 file`
      );
    }
    throw new Error(
      `No private key found in PEM file (found: ${blockTypes.join(', ') || 'no PEM blocks'}). ` +
        'The PEM must contain both the certificate and its private key, e.g. cat cert.pem key.pem > combined.pem'
    );
  }

  return parsePemFiles(certMatches.join('\n'), keyMatch[0], password);
}

/**
 * CORS Proxy URL for fetching external certificates.
 * The zgapdfsigner library tries to fetch issuer certificates from external URLs,
 * but those servers often don't have CORS headers. This proxy adds the necessary
 * CORS headers to allow the requests from the browser.
 *
 * If you are self-hosting, you MUST deploy your own proxy using cloudflare/cors-proxy-worker.js or any other way of your choice
 * and set VITE_CORS_PROXY_URL environment variable.
 *
 * If not set, certificates requiring external chain fetching will fail.
 *
 * On the official BentoPDF domains we fall back to the project-operated proxy.
 * The generated CSP already allows that origin by default (see
 * scripts/generate-security-headers.mjs), but the runtime never used it, which
 * left the timestamp tool broken on the official HTTPS site. The fallback is
 * deliberately scoped to the official domains so self-hosted instances keep
 * requiring their own proxy.
 */
const DEFAULT_CORS_PROXY_URL =
  'https://bentopdf-cors-proxy.bentopdf.workers.dev';

const OFFICIAL_HOSTNAMES = new Set(['bentopdf.com', 'www.bentopdf.com']);

function resolveCorsProxyUrl(): string {
  const configured = import.meta.env.VITE_CORS_PROXY_URL || '';
  if (configured) {
    return configured;
  }

  if (typeof window === 'undefined') {
    return '';
  }

  const hostname = window.location?.hostname?.toLowerCase() ?? '';
  return OFFICIAL_HOSTNAMES.has(hostname) ? DEFAULT_CORS_PROXY_URL : '';
}

const CORS_PROXY_URL = resolveCorsProxyUrl();

/**
 * Shared secret for signing proxy requests (HMAC-SHA256).
 *
 * SECURITY NOTE FOR PRODUCTION:
 * Client-side secrets are NEVER truly hidden and they can be extracted from
 * bundled JavaScript.
 *
 * For production deployments with sensitive requirements, you should:
 * 1. Use your own backend server to proxy certificate requests
 * 2. Keep the HMAC secret on your server ONLY (never in frontend code)
 * 3. Have your frontend call your server, which then calls the CORS proxy
 *
 * This client-side HMAC provides limited protection (deters casual abuse)
 * but should NOT be considered secure against determined attackers. BentoPDF
 * accepts this tradeoff because of its client-side architecture.
 *
 * To enable (optional):
 * 1. Generate a secret: openssl rand -hex 32
 * 2. Set PROXY_SECRET on your Cloudflare Worker: npx wrangler secret put PROXY_SECRET
 * 3. Set VITE_CORS_PROXY_SECRET in your build environment (must match PROXY_SECRET)
 */
const CORS_PROXY_SECRET = import.meta.env.VITE_CORS_PROXY_SECRET || '';

async function generateProxySignature(
  url: string,
  timestamp: number
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(CORS_PROXY_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const message = `${url}${timestamp}`;
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function resolveProxyBase(): string {
  if (
    CORS_PROXY_URL.startsWith('http://') ||
    CORS_PROXY_URL.startsWith('https://')
  ) {
    return CORS_PROXY_URL;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return new URL(CORS_PROXY_URL, window.location.origin).toString();
  }
  return CORS_PROXY_URL;
}

async function buildCorsProxyUrl(url: string): Promise<string> {
  let proxyUrl = `${resolveProxyBase()}?url=${encodeURIComponent(url)}`;

  if (!CORS_PROXY_SECRET) {
    return proxyUrl;
  }

  const timestamp = Date.now();
  const signature = await generateProxySignature(url, timestamp);
  proxyUrl += `&t=${timestamp}&sig=${signature}`;

  return proxyUrl;
}

/**
 * Custom fetch wrapper that routes external certificate requests through a CORS proxy.
 * The zgapdfsigner library tries to fetch issuer certificates from URLs embedded in the
 * certificate's AIA extension. When those servers don't have CORS enabled (like www.cert.fnmt.es),
 * the fetch fails. This wrapper routes such requests through our CORS proxy.
 *
 * If VITE_CORS_PROXY_SECRET is configured, requests include HMAC signatures for anti-spoofing.
 *
 */
let fetchWrapRefCount = 0;
let savedOriginalFetch: typeof fetch | null = null;

function createCorsAwareFetch(): {
  wrappedFetch: typeof fetch;
  restore: () => void;
} {
  if (fetchWrapRefCount === 0) {
    savedOriginalFetch = window.fetch.bind(window);

    const originalFetch = savedOriginalFetch;

    window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      const isAlreadyProxied =
        CORS_PROXY_URL.length > 0 && url.startsWith(CORS_PROXY_URL);

      const isExternalCertificateUrl =
        (url.includes('.crt') ||
          url.includes('.cer') ||
          url.includes('.pem') ||
          url.includes('/certs/') ||
          url.includes('/ocsp') ||
          url.includes('/crl') ||
          url.includes('caIssuers')) &&
        !url.startsWith(window.location.origin);

      const isTsaRequest =
        (init?.headers &&
          (init.headers instanceof Headers
            ? init.headers.get('Content-Type') === 'application/timestamp-query'
            : typeof init.headers === 'object' &&
              !Array.isArray(init.headers) &&
              (init.headers as Record<string, string>)['Content-Type'] ===
                'application/timestamp-query')) ||
        url.includes('timestamp') ||
        url.includes('/tsa') ||
        url.includes('/tsr') ||
        url.includes('/ts01') ||
        url.includes('RFC3161');

      const shouldProxy =
        !isAlreadyProxied &&
        (isExternalCertificateUrl || isTsaRequest) &&
        !url.startsWith(window.location.origin);

      if (shouldProxy && CORS_PROXY_URL) {
        const proxyUrl = await buildCorsProxyUrl(url);
        if (CORS_PROXY_SECRET) {
          console.log(
            `[CORS Proxy] Routing signed request through proxy: ${url}`
          );
        } else {
          console.log(`[CORS Proxy] Routing request through proxy: ${url}`);
        }

        return originalFetch(proxyUrl, init);
      }

      return originalFetch(input, init);
    }) as typeof fetch;
  }

  fetchWrapRefCount++;

  return {
    wrappedFetch: window.fetch,
    restore: () => {
      fetchWrapRefCount--;
      if (fetchWrapRefCount === 0 && savedOriginalFetch) {
        window.fetch = savedOriginalFetch;
        savedOriginalFetch = null;
      }
    },
  };
}

export async function signPdf(
  pdfBytes: Uint8Array,
  certificateData: CertificateData,
  options: SignPdfOptions = {}
): Promise<Uint8Array> {
  const signatureInfo = options.signatureInfo ?? {};

  const signOptions: SignOption = {
    p12cert: certificateData.p12Buffer,
    pwd: certificateData.password,
  };

  if (signatureInfo.reason) {
    signOptions.reason = signatureInfo.reason;
  }

  if (signatureInfo.location) {
    signOptions.location = signatureInfo.location;
  }

  if (signatureInfo.contactInfo) {
    signOptions.contact = signatureInfo.contactInfo;
  }

  if (options.visibleSignature?.enabled) {
    const vs = options.visibleSignature;

    const drawinf = {
      area: {
        x: vs.x,
        y: vs.y,
        w: vs.width,
        h: vs.height,
      },
      pageidx: vs.page,
      imgInfo: undefined as
        | { imgData: ArrayBuffer; imgType: string }
        | undefined,
      textInfo: undefined as
        | { text: string; size: number; color: string }
        | undefined,
    };

    if (vs.imageData && vs.imageType) {
      drawinf.imgInfo = {
        imgData: vs.imageData,
        imgType: vs.imageType,
      };
    }

    if (vs.text) {
      drawinf.textInfo = {
        text: vs.text,
        size: vs.textSize ?? 12,
        color: vs.textColor ?? '#000000',
      };
    }

    signOptions.drawinf = drawinf as SignOption['drawinf'];
  }

  const signer = new PdfSigner(signOptions);

  const { restore } = createCorsAwareFetch();

  try {
    const signedPdfBytes = await signer.sign(pdfBytes);
    return new Uint8Array(signedPdfBytes);
  } finally {
    restore();
  }
}

export async function timestampPdf(
  pdfBytes: Uint8Array,
  tsaUrl: string
): Promise<Uint8Array> {
  if (!isValidTsaRequestUrl(tsaUrl)) {
    throw new Error(
      `Invalid TSA URL. The timestamp authority must be a valid http:// or https:// URL.`
    );
  }

  const pageIsHttps =
    typeof window !== 'undefined' && window.location?.protocol === 'https:';
  const tsaIsHttp = /^http:\/\//i.test(tsaUrl);

  if (pageIsHttps && tsaIsHttp && !CORS_PROXY_URL) {
    throw new Error(
      `This TSA endpoint uses HTTP (${tsaUrl}). The browser blocks insecure ` +
        `requests from this HTTPS page. Either choose a TSA with an HTTPS ` +
        `endpoint or configure VITE_CORS_PROXY_URL at build time so the ` +
        `request can be relayed through your proxy.`
    );
  }

  let effectiveUrl = tsaUrl;

  if (CORS_PROXY_URL) {
    effectiveUrl = await buildCorsProxyUrl(tsaUrl);

    if (CORS_PROXY_SECRET) {
      console.log(
        `[Timestamp] Routing signed TSA request through proxy: ${tsaUrl}`
      );
    } else {
      console.log(`[Timestamp] Routing TSA request through proxy: ${tsaUrl}`);
    }
  }

  const signOptions: SignOption = {
    signdate: { url: effectiveUrl },
  };

  const signer = new PdfSigner(signOptions);

  const { restore } = createCorsAwareFetch();

  try {
    const timestampedPdfBytes = await signer.sign(pdfBytes);
    return new Uint8Array(timestampedPdfBytes);
  } finally {
    restore();
  }
}

export function getCertificateInfo(certificate: forge.pki.Certificate): {
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
} {
  const subjectCN = certificate.subject.getField('CN');
  const issuerCN = certificate.issuer.getField('CN');

  return {
    subject: (subjectCN?.value as string) ?? 'Unknown',
    issuer: (issuerCN?.value as string) ?? 'Unknown',
    validFrom: certificate.validity.notBefore,
    validTo: certificate.validity.notAfter,
    serialNumber: certificate.serialNumber,
  };
}
