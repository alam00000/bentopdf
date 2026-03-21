export type WasmPackage = 'pymupdf' | 'ghostscript' | 'cpdf';

interface WasmProviderConfig {
  pymupdf?: string;
  ghostscript?: string;
  cpdf?: string;
}

const STORAGE_KEY = 'bentopdf:wasm-providers';

const CDN_DEFAULTS: Record<WasmPackage, string> = {
  pymupdf: 'https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/',
  ghostscript: 'https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm/assets/',
  cpdf: 'https://cdn.jsdelivr.net/npm/coherentpdf/dist/',
};

function envOrDefault(envVar: string | undefined, fallback: string): string {
  return envVar || fallback;
}

const ENV_DEFAULTS: Record<WasmPackage, string> = {
  pymupdf: envOrDefault(
    import.meta.env.VITE_WASM_PYMUPDF_URL,
    CDN_DEFAULTS.pymupdf
  ),
  ghostscript: envOrDefault(
    import.meta.env.VITE_WASM_GS_URL,
    CDN_DEFAULTS.ghostscript
  ),
  cpdf: envOrDefault(import.meta.env.VITE_WASM_CPDF_URL, CDN_DEFAULTS.cpdf),
};

class WasmProviderManager {
  private config: WasmProviderConfig;
  private validationCache: Map<WasmPackage, boolean> = new Map();

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): WasmProviderConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(
        '[WasmProvider] Failed to load config from localStorage:',
        e
      );
    }
    return {};
  }

  private getEnvDefault(packageName: WasmPackage): string | undefined {
    return ENV_DEFAULTS[packageName];
  }

  private saveConfig(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error('[WasmProvider] Failed to save config to localStorage:', e);
    }
  }

  getUrl(packageName: WasmPackage): string | undefined {
    return this.config[packageName] || this.getEnvDefault(packageName);
  }

  setUrl(packageName: WasmPackage, url: string): void {
    const normalizedUrl = url.endsWith('/') ? url : `${url}/`;
    this.config[packageName] = normalizedUrl;
    this.validationCache.delete(packageName);
    this.saveConfig();
  }

  removeUrl(packageName: WasmPackage): void {
    delete this.config[packageName];
    this.validationCache.delete(packageName);
    this.saveConfig();
  }

  isConfigured(packageName: WasmPackage): boolean {
    return !!(this.config[packageName] || this.getEnvDefault(packageName));
  }

  isUserConfigured(packageName: WasmPackage): boolean {
    return !!this.config[packageName];
  }

  hasEnvDefault(packageName: WasmPackage): boolean {
    return !!this.getEnvDefault(packageName);
  }

  hasAnyProvider(): boolean {
    return (
      Object.keys(this.config).length > 0 ||
      Object.values(ENV_DEFAULTS).some(Boolean)
    );
  }

  async validateUrl(
    packageName: WasmPackage,
    url?: string
  ): Promise<{ valid: boolean; error?: string }> {
    const testUrl = url || this.config[packageName];
    if (!testUrl) {
      return { valid: false, error: 'No URL configured' };
    }

    try {
      const parsedUrl = new URL(testUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return {
          valid: false,
          error: 'URL must start with http:// or https://',
        };
      }
    } catch {
      return {
        valid: false,
        error:
          'Invalid URL format. Please enter a valid URL (e.g., https://example.com/wasm/)',
      };
    }

    const normalizedUrl = testUrl.endsWith('/') ? testUrl : `${testUrl}/`;

    try {
      const testFiles: Record<WasmPackage, string> = {
        pymupdf: 'dist/index.js',
        ghostscript: 'gs.js',
        cpdf: 'coherentpdf.browser.min.js',
      };

      const testFile = testFiles[packageName];
      const fullUrl = `${normalizedUrl}${testFile}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

      const response = await fetch(fullUrl, {
        method: 'GET',
        mode: 'cors',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          valid: false,
          error: `Could not find ${testFile} at the specified URL (HTTP ${response.status}). Make sure the file exists.`,
        };
      }

      const reader = response.body?.getReader();
      if (reader) {
        try {
          await reader.read();
          reader.cancel();
        } catch {
          return {
            valid: false,
            error: `File exists but could not be read. Check CORS configuration.`,
          };
        }
      }

      const contentType = response.headers.get('content-type');
      if (
        contentType &&
        !contentType.includes('javascript') &&
        !contentType.includes('application/octet-stream') &&
        !contentType.includes('text/')
      ) {
        return {
          valid: false,
          error: `The URL returned unexpected content type: ${contentType}. Expected a JavaScript file.`,
        };
      }

      if (!url || url === this.config[packageName]) {
        this.validationCache.set(packageName, true);
      }

      return { valid: true };
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';

      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError')
      ) {
        return {
          valid: false,
          error:
            'Network error: Could not connect to the URL. Check that the URL is correct and the server allows CORS requests.',
        };
      }

      return {
        valid: false,
        error: `Network error: ${errorMessage}`,
      };
    }
  }

  getAllProviders(): WasmProviderConfig {
    return {
      pymupdf: this.config.pymupdf || ENV_DEFAULTS.pymupdf,
      ghostscript: this.config.ghostscript || ENV_DEFAULTS.ghostscript,
      cpdf: this.config.cpdf || ENV_DEFAULTS.cpdf,
    };
  }

  clearAll(): void {
    this.config = {};
    this.validationCache.clear();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('[WasmProvider] Failed to clear localStorage:', e);
    }
  }

  resetToDefaults(): void {
    this.clearAll();
  }

  getPackageDisplayName(packageName: WasmPackage): string {
    const names: Record<WasmPackage, string> = {
      pymupdf: 'PyMuPDF (Document Processing)',
      ghostscript: 'Ghostscript (PDF/A Conversion)',
      cpdf: 'CoherentPDF (Bookmarks & Metadata)',
    };
    return names[packageName];
  }

  getPackageFeatures(packageName: WasmPackage): string[] {
    const features: Record<WasmPackage, string[]> = {
      pymupdf: [
        'PDF to Text',
        'PDF to Markdown',
        'PDF to SVG',
        'PDF to Images (High Quality)',
        'PDF to DOCX',
        'PDF to Excel/CSV',
        'Extract Images',
        'Extract Tables',
        'EPUB/MOBI/FB2/XPS/CBZ to PDF',
        'Image Compression',
        'Deskew PDF',
        'PDF Layers',
      ],
      ghostscript: ['PDF/A Conversion', 'Font to Outline'],
      cpdf: [
        'Merge PDF',
        'Alternate Merge',
        'Split by Bookmarks',
        'Table of Contents',
        'PDF to JSON',
        'JSON to PDF',
        'Add/Edit/Extract Attachments',
        'Edit Bookmarks',
        'PDF Metadata',
      ],
    };
    return features[packageName];
  }
}

export const WasmProvider = new WasmProviderManager();

export function showWasmRequiredDialog(
  packageName: WasmPackage,
  onConfigure?: () => void
): void {
  const displayName = WasmProvider.getPackageDisplayName(packageName);
  const features = WasmProvider.getPackageFeatures(packageName);

  // Create modal
  const overlay = document.createElement('div');
  overlay.className =
    'fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4';
  overlay.id = 'wasm-required-modal';

  const modal = document.createElement('div');
  modal.className =
    'bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl border border-gray-700';

  modal.innerHTML = `
    <div class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
          <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-white">Advanced Feature Required</h3>
          <p class="text-sm text-gray-400">External processing module needed</p>
        </div>
      </div>

      <p class="text-gray-300 mb-4">
        This feature requires <strong class="text-white">${displayName}</strong> to be configured.
      </p>

      <div class="bg-gray-700/50 rounded-lg p-4 mb-4">
        <p class="text-sm text-gray-400 mb-2">Features enabled by this module:</p>
        <ul class="text-sm text-gray-300 space-y-1">
          ${features
            .slice(0, 4)
            .map(
              (f) =>
                `<li class="flex items-center gap-2"><span class="text-green-400">✓</span> ${f}</li>`
            )
            .join('')}
          ${features.length > 4 ? `<li class="text-gray-500">+ ${features.length - 4} more...</li>` : ''}
        </ul>
      </div>

      <p class="text-xs text-gray-500 mb-4">
        This module is licensed under AGPL-3.0. By configuring it, you agree to its license terms.
      </p>
    </div>

    <div class="border-t border-gray-700 p-4 flex gap-3">
      <button id="wasm-modal-cancel" class="flex-1 px-4 py-2.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors font-medium">
        Cancel
      </button>
      <button id="wasm-modal-configure" class="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 transition-all font-medium">
        Configure
      </button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const cancelBtn = modal.querySelector('#wasm-modal-cancel');
  const configureBtn = modal.querySelector('#wasm-modal-configure');

  const closeModal = () => {
    overlay.remove();
  };

  cancelBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  configureBtn?.addEventListener('click', () => {
    closeModal();
    if (onConfigure) {
      onConfigure();
    } else {
      window.location.href = `${import.meta.env.BASE_URL}wasm-settings.html`;
    }
  });
}

export function requireWasm(
  packageName: WasmPackage,
  onAvailable?: () => void
): boolean {
  if (WasmProvider.isConfigured(packageName)) {
    onAvailable?.();
    return true;
  }

  showWasmRequiredDialog(packageName);
  return false;
}
