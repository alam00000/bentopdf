import { spawnSync } from 'node:child_process';

const defaults = {
  SITE_URL: 'https://pdf.hiiire.com',
  VITE_BRAND_NAME: 'hiiire PDF',
  VITE_BRAND_LOGO: 'images/hiiire-pdf-mark.svg',
  VITE_FOOTER_TEXT:
    '© 2026 hiiire. PDF-инструменты работают локально в браузере.',
  VITE_DEFAULT_LANGUAGE: 'ru',
  VITE_USE_CDN: 'true',
  VITE_SOURCE_REPOSITORY_URL: 'https://github.com/vladkolchik/bentopdf',
  VITE_SOURCE_REPOSITORY_API_URL:
    'https://api.github.com/repos/vladkolchik/bentopdf',
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

run(npm, ['exec', 'tsc', '--']);
run(npm, ['exec', 'vite', '--', 'build']);
run(process.execPath, ['scripts/generate-i18n-pages.mjs']);
run(process.execPath, ['scripts/generate-sitemap.mjs']);
run(process.execPath, ['scripts/apply-branding.mjs']);
run(process.execPath, ['scripts/generate-security-headers.mjs']);
run(process.execPath, ['scripts/seo-audit.mjs']);
