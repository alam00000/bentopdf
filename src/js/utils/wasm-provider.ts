import { trHtml, trText } from '../i18n/i18n.js';
export type WasmPackage = 'pymupdf' | 'ghostscript' | 'cpdf';

interface WasmProviderConfig {
  pymupdf?: string;
  ghostscript?: string;
  cpdf?: string;
}

const STORAGE_KEY = 'pixelpdf:wasm-providers';

const CDN_DEFAULTS: Record<WasmPackage, string> = {
  pymupdf: 'https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/',
  ghostscript: 'https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/',
  cpdf: 'https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/',
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

function hostnameOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function collectBuiltinTrustedHosts(): Set<string> {
  const hosts = new Set<string>();
  if (typeof location !== 'undefined' && location.hostname) {
    hosts.add(location.hostname);
  }
  for (const url of Object.values(CDN_DEFAULTS)) {
    const h = hostnameOf(url);
    if (h) hosts.add(h);
  }
  for (const url of Object.values(ENV_DEFAULTS)) {
    const h = hostnameOf(url);
    if (h) hosts.add(h);
  }
  return hosts;
}

const BUILTIN_TRUSTED_HOSTS = collectBuiltinTrustedHosts();

function isOutdatedCdnPin(packageName: WasmPackage, url: string): boolean {
  const current = CDN_DEFAULTS[packageName];
  const packageUrl = current.slice(0, current.lastIndexOf('@'));
  return (
    url !== current &&
    (url.startsWith(`${packageUrl}@`) || url.startsWith(`${packageUrl}/`))
  );
}

function withTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`;
}

class WasmProviderManager {
  private config: WasmProviderConfig;
  private validationCache: Map<WasmPackage, boolean> = new Map();
  private trustedHosts: Set<string> = new Set<string>(BUILTIN_TRUSTED_HOSTS);

  constructor() {
    this.config = this.loadConfig();
  }

  private isTrustedUrl(url: string): boolean {
    const host = hostnameOf(url);
    return !!host && this.trustedHosts.has(host);
  }

  private loadConfig(): WasmProviderConfig {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return {};
      const parsed = JSON.parse(stored) as WasmProviderConfig;
      const safe: WasmProviderConfig = {};
      let dropped = false;
      for (const key of ['pymupdf', 'ghostscript', 'cpdf'] as WasmPackage[]) {
        const url = parsed[key];
        if (typeof url !== 'string') continue;
        if (isOutdatedCdnPin(key, url)) {
          dropped = true;
          console.warn(
            `[WasmProvider] Ignoring outdated stored URL for ${key}: ${url}. Using the current default instead.`
          );
        } else if (this.isTrustedUrl(url)) {
          safe[key] = url;
        } else {
          dropped = true;
          console.warn(
            `[WasmProvider] Ignoring untrusted stored URL for ${key}: ${url}. ` +
              'Reconfigure via Advanced Settings to re-enable.'
          );
        }
      }
      if (dropped) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
        } catch (e) {
          console.error(
            '[WasmProvider] Failed to scrub untrusted config from localStorage:',
            e
          );
        }
      }
      return safe;
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
    const stored = this.config[packageName];
    if (stored) {
      if (this.isTrustedUrl(stored)) return stored;
      console.warn(
        `[WasmProvider] Refusing to use untrusted URL for ${packageName}; falling back to env default.`
      );
    }
    return this.getEnvDefault(packageName);
  }

  setUrl(packageName: WasmPackage, url: string): void {
    const normalizedUrl = withTrailingSlash(url);
    const host = hostnameOf(normalizedUrl);
    if (!host) {
      throw new Error(trText("رابط غير صالح"));
    }
    const envDefault = this.getEnvDefault(packageName);
    if (envDefault && normalizedUrl === withTrailingSlash(envDefault)) {
      this.removeUrl(packageName);
      return;
    }
    this.trustedHosts.add(host);
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
      return { valid: false, error: trText("لم يتم تكوين رابط") };
    }

    try {
      const parsedUrl = new URL(testUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return {
          valid: false,
          error: trText("يجب أن يبدأ الرابط بـ http:// أو https://"),
        };
      }
    } catch {
      return {
        valid: false,
        error: trText(
          "صيغة الرابط غير صالحة. يرجى إدخال رابط صالح (مثل https://example.com/wasm/)"
        ),
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
          error: trText(
            "تعذر العثور على {{testFile}} في الرابط المحدد (HTTP {{status}}). تأكد من وجود الملف.",
            { testFile, status: response.status }
          ),
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
            error: trText(
              "الملف موجود لكن تعذرت قراءته. تحقق من إعدادات CORS."
            ),
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
          error: trText(
            "أعاد الرابط نوع محتوى غير متوقع: {{contentType}}. المتوقع ملف JavaScript.",
            { contentType }
          ),
        };
      }

      if (!url || url === this.config[packageName]) {
        this.validationCache.set(packageName, true);
      }

      return { valid: true };
    } catch (e: unknown) {
      const errorMessage =
        e instanceof Error ? e.message : trText("خطأ غير معروف");

      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError')
      ) {
        return {
          valid: false,
          error: trText(
            "خطأ في الشبكة: تعذر الاتصال بالرابط. تحقق من صحة الرابط وأن الخادم يسمح بطلبات CORS."
          ),
        };
      }

      return {
        valid: false,
        error: trText("خطأ في الشبكة: {{error}}", { error: errorMessage }),
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
    this.trustedHosts = new Set<string>(BUILTIN_TRUSTED_HOSTS);
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
      pymupdf: trText("PyMuPDF (معالجة المستندات)"),
      ghostscript: trText("Ghostscript (تحويل PDF/A)"),
      cpdf: trText("CoherentPDF (الإشارات المرجعية والبيانات الوصفية)"),
    };
    return names[packageName];
  }

  getPackageFeatures(packageName: WasmPackage): string[] {
    const features: Record<WasmPackage, string[]> = {
      pymupdf: [
        trText("PDF إلى نص"),
        trText("PDF إلى Markdown"),
        trText("PDF إلى SVG"),
        trText("PDF إلى صور (جودة عالية)"),
        trText("PDF إلى DOCX"),
        trText("PDF إلى Excel/CSV"),
        trText("استخراج الصور"),
        trText("استخراج الجداول"),
        trText("EPUB/MOBI/FB2/XPS/CBZ إلى PDF"),
        trText("تقويم ميل PDF"),
        trText("طبقات PDF"),
      ],
      ghostscript: [trText("تحويل PDF/A"), trText("تحويل الخط إلى مخطط")],
      cpdf: [
        trText("دمج PDF"),
        trText("دمج بالتناوب"),
        trText("التقسيم حسب الإشارات المرجعية"),
        trText("جدول المحتويات"),
        trText("PDF إلى JSON"),
        trText("JSON إلى PDF"),
        trText("إضافة/تعديل/استخراج المرفقات"),
        trText("تعديل الإشارات المرجعية"),
        trText("البيانات الوصفية لـ PDF"),
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
          <h3 class="text-lg font-semibold text-white">${trHtml("ميزة متقدمة مطلوبة")}</h3>
          <p class="text-sm text-gray-400">${trHtml("مطلوب وحدة معالجة خارجية")}</p>
        </div>
      </div>

      <p class="text-gray-300 mb-4">
        ${trHtml("تتطلب هذه الميزة تهيئة {{name}}.", { name: '\u0000' }).replace('\u0000', `<strong class="text-white">${displayName}</strong>`)}
      </p>

      <div class="bg-gray-700/50 rounded-lg p-4 mb-4">
        <p class="text-sm text-gray-400 mb-2">${trHtml("الميزات التي تفعّلها هذه الوحدة:")}</p>
        <ul class="text-sm text-gray-300 space-y-1">
          ${features
            .slice(0, 4)
            .map(
              (f) =>
                `<li class="flex items-center gap-2"><span class="text-green-400">✓</span> ${f}</li>`
            )
            .join('')}
          ${features.length > 4 ? `<li class="text-gray-500">${trHtml("+ {{n}} أخرى...", { n: features.length - 4 })}</li>` : ''}
        </ul>
      </div>

      <p class="text-xs text-gray-500 mb-4">
        ${trHtml("هذه الوحدة مرخّصة بموجب AGPL-3.0. بتهيئتها فإنك توافق على شروط ترخيصها.")}
      </p>
    </div>

    <div class="border-t border-gray-700 p-4 flex gap-3">
      <button id="wasm-modal-cancel" class="flex-1 px-4 py-2.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors font-medium">
        ${trHtml("إلغاء")}
      </button>
      <button id="wasm-modal-configure" class="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 transition-all font-medium">
        ${trHtml("ضبط")}
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
