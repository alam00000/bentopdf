# Wdrożenie na Vercel

[Vercel](https://vercel.com) oferuje najprostszy sposób wdrażania statycznych stron.

## Wdrożenie jednym kliknięciem

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Wdrożenie ręczne

### Krok 1: Zrób fork repozytorium

Zrób fork [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) na swoje konto GitHub.

### Krok 2: Zaimportuj do Vercel

1. Przejdź do [vercel.com/new](https://vercel.com/new)
2. Wybierz swój fork repozytorium
3. Skonfiguruj projekt:

| Ustawienie       | Wartość         |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Krok 3: Zmienne środowiskowe (opcjonalnie)

Dodaj je, jeśli są potrzebne:

| Zmienna                 | Opis                                                          |
| ----------------------- | ------------------------------------------------------------- |
| `SIMPLE_MODE`           | Ustaw na `true` dla minimalnego interfejsu                    |
| `VITE_BRAND_NAME`       | Własna nazwa marki (zastępuje "BentoPDF")                     |
| `VITE_BRAND_LOGO`       | Ścieżka do logo względem `public/` (np. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Własny tekst stopki/praw autorskich                           |
| `VITE_DEFAULT_LANGUAGE` | Domyślny język interfejsu (np. `fr`, `de`, `es`)              |

### Krok 4: Wdróż

Kliknij "Deploy" i poczekaj na zakończenie budowania.

## Własna domena

1. Przejdź do ustawień projektu
2. Otwórz "Domains"
3. Dodaj swoją domenę
4. Skonfiguruj DNS zgodnie z instrukcjami

## Ograniczenia

::: warning Duże pliki
Funkcje serverless Vercel mają limit 50 MB. Ponieważ BentoPDF jest statyczną stroną, nie powinno to na Ciebie wpłynąć, ale moduły WASM są duże (łącznie ok. 100 MB). Upewnij się, że są serwowane z folderu `/public`.
:::

## Rozwiązywanie problemów

### Przekroczenie czasu budowania

Jeśli budowanie przekracza limit czasu, spróbuj:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Błąd 404 po odświeżeniu

Dodaj plik `vercel.json` dla routingu SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Konwersja Word/ODT/Excel na PDF nie działa

Konwersje LibreOffice WASM wymagają `SharedArrayBuffer`, a to wymaga tych nagłówków odpowiedzi na wszystkich stronach:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Wstępnie skompresowane pliki `.wasm.gz` i `.data.gz` potrzebują też nagłówka `Content-Encoding: gzip`, aby przeglądarka je rozpakowała.

Dodaj je do swojego `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.wasm.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/wasm" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.data.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/octet-stream" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    }
  ]
}
```

Aby to zweryfikować, otwórz konsolę DevTools i uruchom `console.log(window.crossOriginIsolated)`. Powinno zwrócić `true`.
