# Wdrożenie na Netlify

[Netlify](https://netlify.com) zapewnia świetny hosting statycznych stron z hojnym darmowym planem.

## Wdrożenie jednym kliknięciem

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Wdrożenie ręczne

### Krok 1: Połącz repozytorium

1. Zaloguj się do [Netlify](https://app.netlify.com)
2. Kliknij "Add new site" → "Import an existing project"
3. Połącz swoje konto GitHub
4. Wybierz swój fork BentoPDF

### Krok 2: Skonfiguruj ustawienia budowania

| Ustawienie        | Wartość         |
| ----------------- | --------------- |
| Build command     | `npm run build` |
| Publish directory | `dist`          |
| Node version      | 18+             |

### Krok 3: Wdróż

Kliknij "Deploy site" i poczekaj na zakończenie budowania.

## Plik konfiguracyjny

Utwórz `netlify.toml` w katalogu głównym projektu:

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

::: warning Ważne
Nagłówki `Cross-Origin-Embedder-Policy` i `Cross-Origin-Opener-Policy` są wymagane do konwersji Word/ODT/Excel/PowerPoint na PDF. Bez nich `SharedArrayBuffer` jest niedostępny, a silnik LibreOffice WASM nie uruchomi się.

Nagłówki `Content-Encoding: gzip` przy plikach `.wasm.gz` i `.data.gz` informują przeglądarkę, że ma je automatycznie rozpakować. Bez nich przeglądarka otrzymuje surowe bajty gzip, a kompilacja WASM kończy się błędem.
:::

## Zmienne środowiskowe

Ustaw je w Site settings → Environment variables:

| Zmienna                 | Opis                                                          |
| ----------------------- | ------------------------------------------------------------- |
| `SIMPLE_MODE`           | Ustaw na `true` dla minimalnego builda                        |
| `VITE_BRAND_NAME`       | Własna nazwa marki (zastępuje "BentoPDF")                     |
| `VITE_BRAND_LOGO`       | Ścieżka do logo względem `public/` (np. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Własny tekst stopki/praw autorskich                           |
| `VITE_DEFAULT_LANGUAGE` | Domyślny język interfejsu (np. `fr`, `de`, `es`)              |

## Własna domena

1. Przejdź do Site settings → Domain management
2. Kliknij "Add custom domain"
3. Postępuj zgodnie z instrukcjami konfiguracji DNS

## Duże pliki multimedialne

Dla dużych plików WASM rozważ włączenie [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Rozwiązywanie problemów

### Konwersja Word/ODT/Excel na PDF zawiesza się na 55%

Jeśli konwersje dokumentów zawieszają się na 55%, otwórz konsolę DevTools i sprawdź:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Jeśli `crossOriginIsolated` ma wartość `false`, nagłówki COEP/COOP z Twojego `netlify.toml` nie są stosowane. Upewnij się, że plik jest w katalogu głównym projektu, i wdróż ponownie.

Jeśli w konsoli widzisz `expected magic word 00 61 73 6d, found 1f 8b 08 08`, pliki `.wasm.gz` nie mają nagłówków `Content-Encoding: gzip`. Upewnij się, że bloki `[[headers]]` dla `soffice.wasm.gz` i `soffice.data.gz` znajdują się w Twoim `netlify.toml`.

### Budowanie kończy się błędem

Sprawdź zgodność wersji Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Wolne pierwsze ładowanie

Włącz optymalizację zasobów w Site settings → Build & deploy → Asset optimization.
