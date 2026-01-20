import { PdfSigner, type SignOption } from 'zgapdfsigner';
import forge from 'node-forge';
import { CertificateData, SignPdfOptions } from '@/types';

export function parsePfxFile(pfxBytes: ArrayBuffer, password: string): CertificateData {
    const pfxAsn1 = forge.asn1.fromDer(forge.util.createBuffer(new Uint8Array(pfxBytes)));
    const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, password);

    const certBags = pfx.getBags({ bagType: forge.pki.oids.certBag });
    const keyBags = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });

    const certBagArray = certBags[forge.pki.oids.certBag];
    const keyBagArray = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];

    if (!certBagArray || certBagArray.length === 0) {
        throw new Error('No certificate found in PFX file');
    }

    if (!keyBagArray || keyBagArray.length === 0) {
        throw new Error('No private key found in PFX file');
    }

    const certificate = certBagArray[0].cert;

    if (!certificate) {
        throw new Error('Failed to extract certificate from PFX file');
    }

    return { p12Buffer: pfxBytes, password, certificate };
}

export function parsePemFiles(
    certPem: string,
    keyPem: string,
    keyPassword?: string
): CertificateData {
    const certificate = forge.pki.certificateFromPem(certPem);

    let privateKey: forge.pki.PrivateKey;
    if (keyPem.includes('ENCRYPTED')) {
        if (!keyPassword) {
            throw new Error('Password required for encrypted private key');
        }
        privateKey = forge.pki.decryptRsaPrivateKey(keyPem, keyPassword);
        if (!privateKey) {
            throw new Error('Failed to decrypt private key');
        }
    } else {
        privateKey = forge.pki.privateKeyFromPem(keyPem);
    }

    const p12Password = keyPassword || 'temp-password';
    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
        privateKey,
        [certificate],
        p12Password,
        { algorithm: '3des' }
    );
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    const p12Buffer = new Uint8Array(p12Der.length);
    for (let i = 0; i < p12Der.length; i++) {
        p12Buffer[i] = p12Der.charCodeAt(i);
    }

    return { p12Buffer: p12Buffer.buffer, password: p12Password, certificate };
}

export function parseCombinedPem(pemContent: string, password?: string): CertificateData {
    const certMatch = pemContent.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/);
    const keyMatch = pemContent.match(/-----BEGIN (RSA |EC |ENCRYPTED )?PRIVATE KEY-----[\s\S]*?-----END (RSA |EC |ENCRYPTED )?PRIVATE KEY-----/);

    if (!certMatch) {
        throw new Error('No certificate found in PEM file');
    }

    if (!keyMatch) {
        throw new Error('No private key found in PEM file');
    }

    return parsePemFiles(certMatch[0], keyMatch[0], password);
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
 */
const CORS_PROXY_URL = import.meta.env.VITE_CORS_PROXY_URL || '';

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
 * accepts this tradeoff because of it's client side architecture.
 * 
 * To enable (optional):
 * 1. Generate a secret: openssl rand -hex 32
 * 2. Set PROXY_SECRET on your Cloudflare Worker: npx wrangler secret put PROXY_SECRET
 * 3. Set VITE_CORS_PROXY_SECRET in your build environment (must match PROXY_SECRET)
 */
const CORS_PROXY_SECRET = import.meta.env.VITE_CORS_PROXY_SECRET || '';

async function generateProxySignature(url: string, timestamp: number): Promise<string> {
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
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/**
 * Custom fetch wrapper that routes external certificate requests through a CORS proxy.
 * The zgapdfsigner library tries to fetch issuer certificates from URLs embedded in the
 * certificate's AIA extension. When those servers don't have CORS enabled (like www.cert.fnmt.es),
 * the fetch fails. This wrapper routes such requests through our CORS proxy.
 * 
 * If VITE_CORS_PROXY_SECRET is configured, requests include HMAC signatures for anti-spoofing.
 */
function createCorsAwareFetch(): {
    wrappedFetch: typeof fetch;
    restore: () => void;
} {
    const originalFetch = window.fetch.bind(window);

    const wrappedFetch: typeof fetch = async (input, init) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

        const isExternalCertificateUrl = (
            url.includes('.crt') ||
            url.includes('.cer') ||
            url.includes('.pem') ||
            url.includes('/certs/') ||
            url.includes('/ocsp') ||
            url.includes('/crl') ||
            url.includes('caIssuers')
        ) && !url.startsWith(window.location.origin);

        if (isExternalCertificateUrl && CORS_PROXY_URL) {
            let proxyUrl = `${CORS_PROXY_URL}?url=${encodeURIComponent(url)}`;

            if (CORS_PROXY_SECRET) {
                const timestamp = Date.now();
                const signature = await generateProxySignature(url, timestamp);
                proxyUrl += `&t=${timestamp}&sig=${signature}`;
                console.log(`[CORS Proxy] Routing signed certificate request through proxy: ${url}`);
            } else {
                console.log(`[CORS Proxy] Routing certificate request through proxy: ${url}`);
            }

            return originalFetch(proxyUrl, init);
        }

        return originalFetch(input, init);
    };

    window.fetch = wrappedFetch;

    return {
        wrappedFetch,
        restore: () => {
            window.fetch = originalFetch;
        }
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
            imgInfo: undefined as { imgData: ArrayBuffer; imgType: string } | undefined,
            textInfo: undefined as { text: string; size: number; color: string } | undefined,
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
        subject: subjectCN?.value as string ?? 'Unknown',
        issuer: issuerCN?.value as string ?? 'Unknown',
        validFrom: certificate.validity.notBefore,
        validTo: certificate.validity.notAfter,
        serialNumber: certificate.serialNumber,
    };
}
