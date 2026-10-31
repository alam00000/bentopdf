# Развёртывание на Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) предлагает быстрый глобальный хостинг статических сайтов с неограниченным трафиком.

## Быстрое развёртывание

1. Откройте [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Нажмите "Create a project"
3. Подключите свой репозиторий GitHub

## Настройка сборки

| Параметр               | Значение        |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Переменные окружения

Добавьте их в Settings → Environment variables:

| Переменная              | Значение                                                    |
| ----------------------- | ----------------------------------------------------------- |
| `NODE_VERSION`          | `18`                                                        |
| `SIMPLE_MODE`           | `false` (необязательно)                                     |
| `VITE_BRAND_NAME`       | Своё название бренда (необязательно)                        |
| `VITE_BRAND_LOGO`       | Путь к логотипу относительно `public/` (необязательно)      |
| `VITE_FOOTER_TEXT`      | Свой текст подвала/копирайта (необязательно)                |
| `VITE_DEFAULT_LANGUAGE` | Язык интерфейса по умолчанию, например `fr` (необязательно) |

## Файл конфигурации

Создайте `_headers` в папке `public`:

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

::: warning Важно
Заголовки `Cross-Origin-Embedder-Policy` и `Cross-Origin-Opener-Policy` обязательны для конвертации Word/ODT/Excel/PowerPoint в PDF. Без них `SharedArrayBuffer` недоступен, и движок LibreOffice WASM не сможет инициализироваться.
:::

Создайте `_redirects` для маршрутизации SPA:

```
/*    /index.html   200
```

## Собственный домен

1. Откройте свой проект Pages
2. Нажмите "Custom domains"
3. Добавьте свой домен
4. Cloudflare автоматически настроит DNS, если домен находится в Cloudflare

## Преимущества

- **Бесплатный неограниченный трафик**
- **Глобальная CDN** с более чем 300 узлами
- **Автоматический HTTPS**
- **Предпросмотр развёртываний** для pull request
- **Быстрые сборки**

## Устранение неполадок

### Загрузка больших файлов

Cloudflare Pages поддерживает файлы размером до 25 МБ. Модули WASM должны проходить, но если вы упрётесь в лимит, попробуйте:

```bash
# Split large files during build
npm run build
```

### Ограничения размера Worker

Если вы используете Cloudflare Workers для сложной маршрутизации, учтите лимит 1 МБ на бесплатных тарифах.

## CORS-прокси Worker (для цифровых подписей)

Инструменту цифровой подписи нужен CORS-прокси для получения цепочек сертификатов. Разверните входящий в комплект worker:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Функции безопасности

| Функция                   | Описание                            |
| ------------------------- | ----------------------------------- |
| **Ограничение URL**       | Разрешены только URL сертификатов   |
| **Лимит размера файла**   | Максимум 10 МБ на запрос            |
| **Ограничение частоты**   | 60 запросов/IP/мин (нужен KV)       |
| **Блокировка частных IP** | Блокирует localhost и внутренние IP |

### Включение ограничения частоты

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Сборка с URL прокси

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Или с Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Примечание:** настройку подписи HMAC смотрите в [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required).
