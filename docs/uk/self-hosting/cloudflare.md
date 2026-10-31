# Розгортання на Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) пропонує швидкий глобальний хостинг статичних сайтів з необмеженим трафіком.

## Швидке розгортання

1. Перейдіть до [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Натисніть "Create a project"
3. Підключіть свій репозиторій GitHub

## Конфігурація збірки

| Параметр               | Значення        |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Змінні середовища

Додайте їх у Settings → Environment variables:

| Змінна                  | Значення                                             |
| ----------------------- | ---------------------------------------------------- |
| `NODE_VERSION`          | `18`                                                 |
| `SIMPLE_MODE`           | `false` (необов'язково)                              |
| `VITE_BRAND_NAME`       | Власна назва бренду (необов'язково)                  |
| `VITE_BRAND_LOGO`       | Шлях до логотипа відносно `public/` (необов'язково)  |
| `VITE_FOOTER_TEXT`      | Власний текст футера/авторських прав (необов'язково) |
| `VITE_DEFAULT_LANGUAGE` | Типова мова інтерфейсу, напр. `fr` (необов'язково)   |

## Файл конфігурації

Створіть `_headers` у папці `public`:

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

::: warning Важливо
Заголовки `Cross-Origin-Embedder-Policy` і `Cross-Origin-Opener-Policy` обов'язкові для конвертації Word/ODT/Excel/PowerPoint у PDF. Без них `SharedArrayBuffer` недоступний, і рушій LibreOffice WASM не зможе ініціалізуватися.
:::

Створіть `_redirects` для маршрутизації SPA:

```
/*    /index.html   200
```

## Власний домен

1. Перейдіть до свого проєкту Pages
2. Натисніть "Custom domains"
3. Додайте свій домен
4. Cloudflare автоматично налаштує DNS, якщо домен розміщено на Cloudflare

## Переваги

- **Безкоштовний необмежений трафік**
- **Глобальна CDN** з понад 300 вузлами
- **Автоматичний HTTPS**
- **Попередні розгортання** для pull request
- **Швидкі збірки**

## Усунення несправностей

### Завантаження великих файлів

Cloudflare Pages підтримує файли до 25 MB. Модулі WASM мають вміститися, але якщо ви впираєтеся в ліміти, розгляньте:

```bash
# Split large files during build
npm run build
```

### Ліміти розміру Worker

Якщо ви використовуєте Cloudflare Workers для складної маршрутизації, зверніть увагу на ліміт 1 MB для безкоштовних планів.

## Worker CORS-проксі (для цифрових підписів)

Інструмент цифрового підпису потребує CORS-проксі для отримання ланцюжків сертифікатів. Розгорніть вбудований worker:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Функції безпеки

| Функція                     | Опис                            |
| --------------------------- | ------------------------------- |
| **Обмеження URL**           | Дозволено лише URL сертифікатів |
| **Ліміт розміру файлу**     | Макс. 10MB на запит             |
| **Обмеження частоти**       | 60 запитів/IP/хв (потрібен KV)  |
| **Блокування приватних IP** | Блокує localhost і внутрішні IP |

### Увімкнення обмеження частоти

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Збірка з URL проксі

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

> **Примітка:** Налаштування підпису HMAC дивіться в [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required).
