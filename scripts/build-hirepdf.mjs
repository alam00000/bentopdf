import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const defaults = {
  SITE_URL: 'https://pdf.hiiire.com',
  VITE_BRAND_NAME: 'hiiirePDF',
  VITE_BRAND_LOGO: 'images/favicon.svg',
  VITE_FOOTER_TEXT:
    '© 2026 hiiirePDF. PDF-инструменты работают локально в браузере.',
  VITE_DEFAULT_LANGUAGE: 'ru',
  VITE_ENABLED_LANGUAGES: 'ru',
  VITE_EXCLUDED_PAGES:
    'about,contact,licensing,faq,privacy,terms,tools,pdf-converter,pdf-editor,pdf-security,pdf-merge-split,wasm-settings',
  HIREPDF_RU_ONLY: 'true',
  VITE_USE_CDN: 'true',
  VITE_SOURCE_REPOSITORY_URL: '',
  VITE_SOURCE_REPOSITORY_API_URL: '',
  VITE_WASM_PYMUPDF_URL: '/wasm/pymupdf/',
  VITE_WASM_GS_URL: '/wasm/gs/',
  VITE_WASM_CPDF_URL: '/wasm/cpdf/',
  NODE_OPTIONS: '--max-old-space-size=6144',
};

for (const [key, value] of Object.entries(defaults)) {
  process.env[key] ||= value;
}

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32' && command.endsWith('.cmd'),
    env: process.env,
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function pruneUnusedLocales() {
  if (process.env.HIREPDF_RU_ONLY !== 'true') return;

  const localesDir = join(process.cwd(), 'dist', 'locales');
  if (!existsSync(localesDir)) return;

  for (const entry of readdirSync(localesDir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== 'ru') {
      rmSync(join(localesDir, entry.name), { recursive: true, force: true });
    }
  }
}

function pruneUnusedPublicFiles() {
  if (process.env.HIREPDF_RU_ONLY !== 'true') return;

  const obsoleteFiles = ['CHANGELOG.md'];
  for (const relativePath of obsoleteFiles) {
    rmSync(join(process.cwd(), 'dist', relativePath), {
      recursive: true,
      force: true,
    });
  }
}

run(npm, ['exec', 'tsc', '--']);
run(npm, ['exec', 'vite', '--', 'build']);
pruneUnusedLocales();
pruneUnusedPublicFiles();
run(process.execPath, ['scripts/generate-i18n-pages.mjs']);
run(process.execPath, ['scripts/generate-sitemap.mjs']);
run(process.execPath, ['scripts/apply-branding.mjs']);
run(process.execPath, ['scripts/generate-security-headers.mjs']);
run(process.execPath, ['scripts/seo-audit.mjs']);
