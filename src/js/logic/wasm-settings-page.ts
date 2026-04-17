import { createIcons, icons } from 'lucide';
import { showAlert, showLoader, hideLoader } from '../ui.js';
import { WasmProvider, type WasmPackage } from '../utils/wasm-provider.js';
import { clearPyMuPDFCache } from '../utils/pymupdf-loader.js';
import { clearGhostscriptCache } from '../utils/ghostscript-dynamic-loader.js';
import { initI18n, t } from '../i18n/index.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  initializePage();
}

async function initializePage() {
  createIcons({ icons });

  try {
    await initI18n();
  } catch (error) {
    console.warn('WASM settings i18n initialization failed:', error);
  }

  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const url = btn.getAttribute('data-copy');
      if (url) {
        await navigator.clipboard.writeText(url);
        const svg = btn.querySelector('svg');
        if (svg) {
          const checkIcon = document.createElement('i');
          checkIcon.setAttribute('data-lucide', 'check');
          checkIcon.className = 'w-3.5 h-3.5';
          svg.replaceWith(checkIcon);
          createIcons({ icons });

          setTimeout(() => {
            const newSvg = btn.querySelector('svg');
            if (newSvg) {
              const copyIcon = document.createElement('i');
              copyIcon.setAttribute('data-lucide', 'copy');
              copyIcon.className = 'w-3.5 h-3.5';
              newSvg.replaceWith(copyIcon);
              createIcons({ icons });
            }
          }, 1500);
        }
      }
    });
  });

  const pymupdfUrl = document.getElementById('pymupdf-url') as HTMLInputElement;
  const pymupdfTest = document.getElementById(
    'pymupdf-test'
  ) as HTMLButtonElement;
  const pymupdfStatus = document.getElementById(
    'pymupdf-status'
  ) as HTMLSpanElement;

  const ghostscriptUrl = document.getElementById(
    'ghostscript-url'
  ) as HTMLInputElement;
  const ghostscriptTest = document.getElementById(
    'ghostscript-test'
  ) as HTMLButtonElement;
  const ghostscriptStatus = document.getElementById(
    'ghostscript-status'
  ) as HTMLSpanElement;

  const cpdfUrl = document.getElementById('cpdf-url') as HTMLInputElement;
  const cpdfTest = document.getElementById('cpdf-test') as HTMLButtonElement;
  const cpdfStatus = document.getElementById('cpdf-status') as HTMLSpanElement;

  const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
  const clearBtn = document.getElementById('clear-btn') as HTMLButtonElement;
  const backBtn = document.getElementById('back-to-tools');

  backBtn?.addEventListener('click', () => {
    window.location.href = import.meta.env.BASE_URL;
  });

  loadConfiguration();

  function loadConfiguration() {
    const packages: { name: WasmPackage; input: HTMLInputElement }[] = [
      { name: 'pymupdf', input: pymupdfUrl },
      { name: 'ghostscript', input: ghostscriptUrl },
      { name: 'cpdf', input: cpdfUrl },
    ];

    const config = WasmProvider.getAllProviders();

    for (const { name, input } of packages) {
      const url = config[name];
      if (!url) continue;

      if (WasmProvider.isUserConfigured(name)) {
        input.value = url;
      } else {
        input.value = '';
        input.placeholder = t('tools:wasmSettings.usingDefault', { url });
      }
      updateStatus(name, true);
    }
  }

  function updateStatus(
    packageName: WasmPackage,
    configured: boolean,
    testing = false
  ) {
    const statusMap: Record<WasmPackage, HTMLSpanElement> = {
      pymupdf: pymupdfStatus,
      ghostscript: ghostscriptStatus,
      cpdf: cpdfStatus,
    };

    const statusEl = statusMap[packageName];
    if (!statusEl) return;

    if (testing) {
      statusEl.textContent = t('tools:wasmSettings.status.testing');
      statusEl.className =
        'text-xs px-2 py-1 rounded-full bg-yellow-600/30 text-yellow-300';
    } else if (configured && WasmProvider.isUserConfigured(packageName)) {
      statusEl.textContent = t('tools:wasmSettings.status.customOverride');
      statusEl.className =
        'text-xs px-2 py-1 rounded-full bg-blue-600/30 text-blue-300';
    } else if (configured || WasmProvider.hasEnvDefault(packageName)) {
      statusEl.textContent = t('tools:wasmSettings.status.preConfigured');
      statusEl.className =
        'text-xs px-2 py-1 rounded-full bg-green-600/30 text-green-300';
    } else {
      statusEl.textContent = t('tools:wasmSettings.status.notConfigured');
      statusEl.className =
        'text-xs px-2 py-1 rounded-full bg-gray-600 text-gray-300';
    }
  }

  async function testConnection(packageName: WasmPackage, url: string) {
    if (!url.trim()) {
      showAlert(
        t('tools:wasmSettings.emptyUrlTitle'),
        t('tools:wasmSettings.emptyUrlMessage')
      );
      return;
    }

    updateStatus(packageName, false, true);

    const result = await WasmProvider.validateUrl(packageName, url);

    if (result.valid) {
      updateStatus(packageName, true);
      showAlert(
        t('tools:wasmSettings.testSuccessTitle'),
        t('tools:wasmSettings.connectionSuccess', {
          package: WasmProvider.getPackageDisplayName(packageName),
        }),
        'success'
      );
    } else {
      updateStatus(packageName, false);
      showAlert(
        t('tools:wasmSettings.connectionFailedTitle'),
        result.error || t('tools:wasmSettings.connectionFailedMessage')
      );
    }
  }

  pymupdfTest?.addEventListener('click', () => {
    testConnection('pymupdf', pymupdfUrl.value);
  });

  ghostscriptTest?.addEventListener('click', () => {
    testConnection('ghostscript', ghostscriptUrl.value);
  });

  cpdfTest?.addEventListener('click', () => {
    testConnection('cpdf', cpdfUrl.value);
  });

  saveBtn?.addEventListener('click', async () => {
    showLoader(t('tools:wasmSettings.savingConfiguration'));

    try {
      if (pymupdfUrl.value.trim()) {
        WasmProvider.setUrl('pymupdf', pymupdfUrl.value.trim());
        updateStatus('pymupdf', true);
      } else {
        WasmProvider.removeUrl('pymupdf');
        updateStatus('pymupdf', false);
      }

      if (ghostscriptUrl.value.trim()) {
        WasmProvider.setUrl('ghostscript', ghostscriptUrl.value.trim());
        updateStatus('ghostscript', true);
      } else {
        WasmProvider.removeUrl('ghostscript');
        updateStatus('ghostscript', false);
      }

      if (cpdfUrl.value.trim()) {
        WasmProvider.setUrl('cpdf', cpdfUrl.value.trim());
        updateStatus('cpdf', true);
      } else {
        WasmProvider.removeUrl('cpdf');
        updateStatus('cpdf', false);
      }

      hideLoader();
      showAlert(
        t('tools:wasmSettings.savedTitle'),
        t('tools:wasmSettings.savedMessage'),
        'success'
      );
    } catch (e: unknown) {
      hideLoader();
      const errorMessage =
        e instanceof Error ? e.message : t('tools:wasmSettings.unknownError');
      showAlert(
        t('tools:wasmSettings.errorTitle'),
        t('tools:wasmSettings.failedSave', { message: errorMessage })
      );
    }
  });

  clearBtn?.addEventListener('click', () => {
    WasmProvider.clearAll();

    clearPyMuPDFCache();
    clearGhostscriptCache();

    const defaults = WasmProvider.getAllProviders();
    pymupdfUrl.value = defaults.pymupdf || '';
    ghostscriptUrl.value = defaults.ghostscript || '';
    cpdfUrl.value = defaults.cpdf || '';

    updateStatus('pymupdf', WasmProvider.isConfigured('pymupdf'));
    updateStatus('ghostscript', WasmProvider.isConfigured('ghostscript'));
    updateStatus('cpdf', WasmProvider.isConfigured('cpdf'));

    const hasDefaults =
      WasmProvider.hasEnvDefault('pymupdf') ||
      WasmProvider.hasEnvDefault('ghostscript') ||
      WasmProvider.hasEnvDefault('cpdf');

    showAlert(
      t('tools:wasmSettings.resetTitle'),
      hasDefaults
        ? t('tools:wasmSettings.resetWithDefaults')
        : t('tools:wasmSettings.resetNoDefaults'),
      'success'
    );
  });
}
