export const PACKAGE_VERSIONS = {
    ghostscript: '0.1.0',
    pymupdf: '0.1.9',
} as const;

export const CDN_URLS = {
    ghostscript: `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@${PACKAGE_VERSIONS.ghostscript}/assets/`,
    pymupdf: `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@${PACKAGE_VERSIONS.pymupdf}/assets/`,
} as const;