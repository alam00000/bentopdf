# Развертывание в Netlify

[Netlify](https://netlify.com) предлагает отличный хостинг статических сайтов с щедрым бесплатным тарифом.

## Развертывание в один клик

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Ручное развертывание

### Шаг 1: Подключите репозиторий

1. Войдите в [Netlify](https://app.netlify.com)
2. Нажмите «Add new site» → «Import an existing project»
3. Подключите свой аккаунт GitHub
4. Выберите свой форк BentoPDF

### Шаг 2: Настройте параметры сборки

| Параметр          | Значение        |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### Шаг 3: Разверните

Нажмите «Deploy site» и дождитесь завершения сборки.

## Файл конфигурации

Создайте `netlify.toml` в корне проекта:

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

::: warning Важно
Заголовки `Cross-Origin-Embedder-Policy` и `Cross-Origin-Opener-Policy` необходимы для конвертации Word/ODT/Excel/PowerPoint в PDF. Без них `SharedArrayBuffer` недоступен, и движок LibreOffice WASM не сможет запуститься.

Заголовки `Content-Encoding: gzip` для файлов `.wasm.gz` и `.data.gz` указывают браузеру распаковывать их автоматически. Без них браузер получает необработанные байты gzip, и компиляция WASM завершается ошибкой.
:::

## Переменные окружения

Задайте их в Site settings → Environment variables:

| Переменная              | Описание                                                                |
| ----------------------- | ----------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Укажите `true` для минимальной сборки                                   |
| `VITE_BRAND_NAME`       | Свое название бренда (заменяет «BentoPDF»)                              |
| `VITE_BRAND_LOGO`       | Путь к логотипу относительно `public/` (например, `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Свой текст подвала и авторских прав                                     |
| `VITE_DEFAULT_LANGUAGE` | Язык интерфейса по умолчанию (например, `fr`, `de`, `es`)               |

## Собственный домен

1. Перейдите в Site settings → Domain management
2. Нажмите «Add custom domain»
3. Следуйте инструкциям по настройке DNS

## Большие медиафайлы

Для больших файлов WASM рассмотрите включение [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Устранение неполадок

### Конвертация Word/ODT/Excel в PDF зависает на 55%

Если конвертация документов зависает на 55%, откройте консоль DevTools и проверьте:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Если `crossOriginIsolated` равно `false`, заголовки COEP/COOP из вашего `netlify.toml` не применяются. Убедитесь, что файл лежит в корне проекта, и разверните сайт заново.

Если в консоли появляется `expected magic word 00 61 73 6d, found 1f 8b 08 08`, у файлов `.wasm.gz` нет заголовков `Content-Encoding: gzip`. Убедитесь, что блоки `[[headers]]` для `soffice.wasm.gz` и `soffice.data.gz` есть в вашем `netlify.toml`.

### Сборка завершается ошибкой

Проверьте совместимость версии Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Медленная первая загрузка

Включите оптимизацию ресурсов в Site settings → Build & deploy → Asset optimization.
