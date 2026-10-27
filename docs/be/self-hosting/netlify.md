# Разгортванне на Netlify

[Netlify](https://netlify.com) прапануе выдатны хостынг статычных сайтаў са шчодрым бясплатным тарыфам.

## Разгортванне адным клікам

[![Разгарнуць на Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Ручное разгортванне

### Крок 1: Падключыце рэпазіторый

1. Увайдзіце ў [Netlify](https://app.netlify.com)
2. Націсніце "Add new site" → "Import an existing project"
3. Падключыце свой уліковы запіс GitHub
4. Выберыце свой форк BentoPDF

### Крок 2: Наладзьце параметры зборкі

| Налада            | Значэнне        |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Версія Node       | 18+             |

### Крок 3: Разгортванне

Націсніце "Deploy site" і пачакайце завяршэння зборкі.

## Файл канфігурацыі

Стварыце `netlify.toml` у корані праекта:

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

::: warning Важна
Загалоўкі `Cross-Origin-Embedder-Policy` і `Cross-Origin-Opener-Policy` патрэбныя для пераўтварэнняў Word/ODT/Excel/PowerPoint у PDF. Без іх `SharedArrayBuffer` недаступны, і рухавік LibreOffice WASM не ініцыялізуецца.

Загалоўкі `Content-Encoding: gzip` для файлаў `.wasm.gz` і `.data.gz` кажуць браўзеру распакоўваць іх аўтаматычна. Без іх браўзер атрымлівае сырыя байты gzip, і кампіляцыя WASM завяршаецца памылкай.
:::

## Зменныя асяроддзя

Задайце іх у Site settings → Environment variables:

| Зменная                 | Апісанне                                                             |
| ----------------------- | -------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Задайце `true` для мінімальнай зборкі                                |
| `VITE_BRAND_NAME`       | Уласная назва брэнда (замяняе "BentoPDF")                            |
| `VITE_BRAND_LOGO`       | Шлях да лагатыпа адносна `public/` (напрыклад, `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Уласны тэкст ніжняга калантытула/аўтарскага права                    |
| `VITE_DEFAULT_LANGUAGE` | Мова інтэрфейсу па змаўчанні (напрыклад, `fr`, `de`, `es`)           |

## Уласны дамен

1. Перайдзіце ў Site settings → Domain management
2. Націсніце "Add custom domain"
3. Выконвайце інструкцыі па наладзе DNS

## Вялікія медыяфайлы

Для вялікіх файлаў WASM варта ўключыць [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Выпраўленне непаладак

### Word/ODT/Excel у PDF спыняецца на 55%

Калі пераўтварэнне дакументаў завісае на 55%, адкрыйце кансоль DevTools і праверце:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Калі `crossOriginIsolated` роўна `false`, загалоўкі COEP/COOP з вашага `netlify.toml` не прымяняюцца. Пераканайцеся, што файл ляжыць у корані праекта, і разгарніце нанова.

Калі ў кансолі бачна `expected magic word 00 61 73 6d, found 1f 8b 08 08`, у файлаў `.wasm.gz` няма загалоўкаў `Content-Encoding: gzip`. Пераканайцеся, што блокі `[[headers]]` для `soffice.wasm.gz` і `soffice.data.gz` ёсць у вашым `netlify.toml`.

### Памылка зборкі

Праверце сумяшчальнасць версіі Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Павольная першая загрузка

Уключыце аптымізацыю рэсурсаў у Site settings → Build & deploy → Asset optimization.
