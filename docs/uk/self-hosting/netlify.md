# Розгортання у Netlify

[Netlify](https://netlify.com) пропонує чудовий хостинг статичних сайтів із щедрим безкоштовним тарифом.

## Розгортання в один клік

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Ручне розгортання

### Крок 1: Підключіть репозиторій

1. Увійдіть у [Netlify](https://app.netlify.com)
2. Натисніть "Add new site" → "Import an existing project"
3. Підключіть свій акаунт GitHub
4. Виберіть свій форк BentoPDF

### Крок 2: Налаштуйте параметри збірки

| Параметр          | Значення        |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### Крок 3: Розгортання

Натисніть "Deploy site" і дочекайтеся збірки.

## Файл конфігурації

Створіть `netlify.toml` у корені проєкту:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Resource-Policy = "cross-origin"

# Pre-compressed LibreOffice WASM binary - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.wasm.gz"
  [headers.values]
    Content-Type = "application/wasm"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Pre-compressed LibreOffice WASM data - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.data.gz"
  [headers.values]
    Content-Type = "application/octet-stream"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Cache other WASM files
[[headers]]
  for = "*.wasm"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "application/wasm"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

::: warning Важливо
Заголовки `Cross-Origin-Embedder-Policy` і `Cross-Origin-Opener-Policy` потрібні для перетворення Word/ODT/Excel/PowerPoint у PDF. Без них `SharedArrayBuffer` недоступний, і рушій LibreOffice WASM не зможе ініціалізуватися.

Заголовки `Content-Encoding: gzip` для файлів `.wasm.gz` і `.data.gz` наказують браузеру автоматично їх розпакувати. Без них браузер отримує сирі байти gzip, і компіляція WASM завершується помилкою.
:::

## Змінні середовища

Задайте їх у Site settings → Environment variables:

| Змінна                  | Опис                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Встановіть `true` для мінімальної збірки                              |
| `VITE_BRAND_NAME`       | Власна назва бренду (замінює "BentoPDF")                              |
| `VITE_BRAND_LOGO`       | Шлях до логотипа відносно `public/` (наприклад, `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Власний текст футера/авторських прав                                  |
| `VITE_DEFAULT_LANGUAGE` | Мова інтерфейсу за замовчуванням (наприклад, `fr`, `de`, `es`)        |

## Власний домен

1. Перейдіть до Site settings → Domain management
2. Натисніть "Add custom domain"
3. Дотримуйтеся інструкцій із налаштування DNS

## Великі медіафайли

Для великих файлів WASM розгляньте можливість увімкнути [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Усунення неполадок

### Перетворення Word/ODT/Excel у PDF зависає на 55%

Якщо перетворення документів зависає на 55%, відкрийте консоль DevTools і перевірте:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Якщо `crossOriginIsolated` дорівнює `false`, заголовки COEP/COOP з вашого `netlify.toml` не застосовуються. Переконайтеся, що файл лежить у корені проєкту, і розгорніть заново.

Якщо в консолі з’являється `expected magic word 00 61 73 6d, found 1f 8b 08 08`, у файлів `.wasm.gz` відсутні заголовки `Content-Encoding: gzip`. Переконайтеся, що блоки `[[headers]]` для `soffice.wasm.gz` і `soffice.data.gz` є у вашому `netlify.toml`.

### Збірка завершується помилкою

Перевірте сумісність версії Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Повільне початкове завантаження

Увімкніть оптимізацію ресурсів у Site settings → Build & deploy → Asset optimization.
