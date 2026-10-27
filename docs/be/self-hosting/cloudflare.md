# Разгортванне на Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) прапануе хуткі глабальны хостынг статычных сайтаў з неабмежаванай прапускной здольнасцю.

## Хуткае разгортванне

1. Перайдзіце ў [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Націсніце "Create a project"
3. Падключыце ваш рэпазіторый GitHub

## Канфігурацыя зборкі

| Параметр              | Значэнне        |
| --------------------- | --------------- |
| Framework preset      | None            |
| Каманда зборкі        | `npm run build` |
| Каталог вываду зборкі | `dist`          |
| Каранёвы каталог      | `/`             |

## Зменныя асяроддзя

Дадайце іх у Settings → Environment variables:

| Зменная                 | Значэнне                                                    |
| ----------------------- | ----------------------------------------------------------- |
| `NODE_VERSION`          | `18`                                                        |
| `SIMPLE_MODE`           | `false` (неабавязкова)                                      |
| `VITE_BRAND_NAME`       | Уласная назва брэнда (неабавязкова)                         |
| `VITE_BRAND_LOGO`       | Шлях да лагатыпа адносна `public/` (неабавязкова)           |
| `VITE_FOOTER_TEXT`      | Уласны тэкст футэра/аўтарскіх правоў (неабавязкова)         |
| `VITE_DEFAULT_LANGUAGE` | Мова інтэрфейсу па змаўчанні, напрыклад `fr` (неабавязкова) |

## Файл канфігурацыі

Стварыце `_headers` у тэчцы `public`:

```
# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin

# Pre-compressed LibreOffice WASM binary
/libreoffice-wasm/soffice.wasm.gz
  Content-Type: application/wasm
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Pre-compressed LibreOffice WASM data
/libreoffice-wasm/soffice.data.gz
  Content-Type: application/octet-stream
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Cache WASM files aggressively
/*.wasm
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/wasm

# Service worker
/sw.js
  Cache-Control: no-cache
```

::: warning Важна
Загалоўкі `Cross-Origin-Embedder-Policy` і `Cross-Origin-Opener-Policy` абавязковыя для канвертацыі Word/ODT/Excel/PowerPoint у PDF. Без іх `SharedArrayBuffer` недаступны, і рухавік LibreOffice WASM не здолее ініцыялізавацца.
:::

Стварыце `_redirects` для SPA-маршрутызацыі:

```
/*    /index.html   200
```

## Уласны дамен

1. Перайдзіце ў ваш праект Pages
2. Націсніце "Custom domains"
3. Дадайце ваш дамен
4. Cloudflare аўтаматычна наладзіць DNS, калі дамен знаходзіцца ў Cloudflare

## Перавагі

- **Бясплатная неабмежаваная прапускная здольнасць**
- **Глабальны CDN** з 300+ пагранічнымі вузламі
- **Аўтаматычны HTTPS**
- **Папярэднія разгортванні** для pull request
- **Хуткія зборкі**

## Вырашэнне праблем

### Загрузка вялікіх файлаў

Cloudflare Pages падтрымлівае файлы да 25 MB. З модулямі WASM праблем быць не павінна, але калі вы ўпраецеся ў ліміты, паспрабуйце:

```bash
# Split large files during build
npm run build
```

### Ліміты памеру Worker

Калі вы выкарыстоўваеце Cloudflare Workers для пашыранай маршрутызацыі, улічвайце ліміт 1 MB на бясплатных планах.

## CORS-проксі Worker (для лічбавых подпісаў)

Інструменту лічбавага подпісу патрэбны CORS-проксі, каб атрымліваць ланцужкі сертыфікатаў. Разгарніце ўключаны worker:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Функцыі бяспекі

| Функцыя                     | Апісанне                          |
| --------------------------- | --------------------------------- |
| **Абмежаванні URL**         | Дазволены толькі URL сертыфікатаў |
| **Ліміт памеру файла**      | Максімум 10MB на запыт            |
| **Абмежаванне частаты**     | 60 запытаў/IP/хв (патрабуе KV)    |
| **Блакіроўка прыватных IP** | Блакіруе localhost і ўнутраныя IP |

### Уключэнне абмежавання частаты

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Зборка з URL проксі

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Або з Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Заўвага:** наладка подпісу HMAC апісана ў [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required).
