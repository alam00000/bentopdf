import { PACKAGE_VERSIONS } from '../const/cdn-version';
import { WasmProvider } from '../utils/wasm-provider';

export type WasmPackage = 'ghostscript' | 'pymupdf' | 'cpdf';

export function getWasmBaseUrl(packageName: WasmPackage): string | undefined {
  const userUrl = WasmProvider.getUrl(packageName);
  if (userUrl) {
    console.log(
      `[WASM Config] Using configured URL for ${packageName}: ${userUrl}`
    );
    return userUrl;
  }

  console.warn(
    `[WASM Config] No URL configured for ${packageName}. Feature unavailable.`
  );
  return undefined;
}

export function isWasmAvailable(packageName: WasmPackage): boolean {
  return WasmProvider.isConfigured(packageName);
}

export async function fetchWasmFile(
  packageName: WasmPackage,
  fileName: string
): Promise<Response> {
  const baseUrl = getWasmBaseUrl(packageName);

  if (!baseUrl) {
    throw new Error(
      `No URL configured for ${packageName}. Please configure it in WASM Settings.`
    );
  }

  const url = baseUrl + fileName;
  console.log(`[WASM] Fetching: ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${fileName}: HTTP ${response.status}`);
  }
  return response;
}

export function getWasmConfigInfo() {
  return {
    packageVersions: PACKAGE_VERSIONS,
    configuredProviders: WasmProvider.getAllProviders(),
  };
}
