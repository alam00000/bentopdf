# Wdrożenie na Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) oferuje szybki, globalny hosting stron statycznych z nielimitowaną przepustowością.

## Szybkie wdrożenie

1. Przejdź do [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Kliknij „Create a project”
3. Połącz swoje repozytorium GitHub

## Konfiguracja budowania

| Ustawienie          | Wartość         |
| ------------------- | --------------- |
| Framework preset    | Brak            |
| Polecenie budowania | `npm run build` |
| Katalog wyjściowy   | `dist`          |
| Katalog główny      | `/`             |

## Zmienne środowiskowe

Dodaj je w Settings → Environment variables:

| Zmienna                 | Wartość                                           |
| ----------------------- | ------------------------------------------------- |
| `NODE_VERSION`          | `18`                                              |
| `SIMPLE_MODE`           | `false` (opcjonalnie)                             |
| `VITE_BRAND_NAME`       | Własna nazwa marki (opcjonalnie)                  |
| `VITE_BRAND_LOGO`       | Ścieżka logo względem `public/` (opcjonalnie)     |
| `VITE_FOOTER_TEXT`      | Własny tekst stopki/praw autorskich (opcjonalnie) |
| `VITE_DEFAULT_LANGUAGE` | Domyślny język interfejsu, np. `fr` (opcjonalnie) |

## Plik konfiguracji

Utwórz `_headers` w folderze `public`:

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

::: warning Ważne
Nagłówki `Cross-Origin-Embedder-Policy` i `Cross-Origin-Opener-Policy` są wymagane do konwersji Word/ODT/Excel/PowerPoint do PDF. Bez nich `SharedArrayBuffer` jest niedostępny, a silnik LibreOffice WASM nie zainicjuje się.
:::

Utwórz `_redirects` na potrzeby routingu SPA:

```
/*    /index.html   200
```

## Własna domena

1. Przejdź do swojego projektu Pages
2. Kliknij „Custom domains”
3. Dodaj swoją domenę
4. Cloudflare automatycznie skonfiguruje DNS, jeśli domena jest w Cloudflare

## Zalety

- **Darmowa, nielimitowana przepustowość**
- **Globalny CDN** z ponad 300 lokalizacjami brzegowymi
- **Automatyczne HTTPS**
- **Wdrożenia podglądowe** dla pull requestów
- **Szybkie budowanie**

## Rozwiązywanie problemów

### Wysyłanie dużych plików

Cloudflare Pages obsługuje pliki do 25 MB. Moduły WASM powinny się zmieścić, ale jeśli natrafisz na limity, rozważ:

```bash
# Split large files during build
npm run build
```

### Limity rozmiaru Workera

Jeśli używasz Cloudflare Workers do zaawansowanego routingu, pamiętaj o limicie 1 MB w planach darmowych.

## Worker proxy CORS (dla podpisów cyfrowych)

Narzędzie podpisu cyfrowego wymaga proxy CORS do pobierania łańcuchów certyfikatów. Wdróż dołączony worker:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Funkcje bezpieczeństwa

| Funkcja                   | Opis                                  |
| ------------------------- | ------------------------------------- |
| **Ograniczenia URL**      | Dozwolone tylko adresy certyfikatów   |
| **Limit rozmiaru pliku**  | Maks. 10MB na żądanie                 |
| **Limit żądań**           | 60 żądań/IP/min (wymaga KV)           |
| **Blokada prywatnych IP** | Blokuje localhost i adresy wewnętrzne |

### Włącz limit żądań

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Zbuduj z adresem URL proxy

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Albo z Dockerem:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Uwaga:** Konfigurację podpisu HMAC znajdziesz w [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required).
