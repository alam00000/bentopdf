/**
 * WASM CDN Configuration
 * 
 * Centralized configuration for loading WASM files from jsDelivr CDN or local paths.
 * Supports environment-based toggling and automatic fallback mechanism.
 */

const USE_CDN = import.meta.env.VITE_USE_CDN === 'true';
import { CDN_URLS, PACKAGE_VERSIONS } from '../const/cdn-version';

const LOCAL_PATHS = {
    ghostscript: import.meta.env.BASE_URL + 'ghostscript-wasm/',
    pymupdf: import.meta.env.BASE_URL + 'pymupdf-wasm/',
} as const;

export type WasmPackage = 'ghostscript' | 'pymupdf';

export function getWasmBaseUrl(packageName: WasmPackage): string {
    if (USE_CDN) {
        return CDN_URLS[packageName];
    }
    return LOCAL_PATHS[packageName];
}

export function getWasmFallbackUrl(packageName: WasmPackage): string {
    return LOCAL_PATHS[packageName];
}


export function isCdnEnabled(): boolean {
    return USE_CDN;
}

/**
 * Fetch a file with automatic CDN → local fallback
 * @param packageName - WASM package name
 * @param fileName - File name relative to package base
 * @returns Response object
 */
export async function fetchWasmFile(
    packageName: WasmPackage,
    fileName: string
): Promise<Response> {
    const cdnUrl = CDN_URLS[packageName] + fileName;
    const localUrl = LOCAL_PATHS[packageName] + fileName;

    if (USE_CDN) {
        try {
            console.log(`[WASM CDN] Fetching from CDN: ${cdnUrl}`);
            const response = await fetch(cdnUrl);
            if (response.ok) {
                return response;
            }
            console.warn(`[WASM CDN] CDN fetch failed with status ${response.status}, trying local fallback...`);
        } catch (error) {
            console.warn(`[WASM CDN] CDN fetch error:`, error, `- trying local fallback...`);
        }
    }

    const response = await fetch(localUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${fileName}: HTTP ${response.status}`);
    }
    return response;
}

// use this to debug
export function getWasmConfigInfo() {
    return {
        cdnEnabled: USE_CDN,
        packageVersions: PACKAGE_VERSIONS,
        cdnUrls: CDN_URLS,
        localPaths: LOCAL_PATHS,
    };
}
