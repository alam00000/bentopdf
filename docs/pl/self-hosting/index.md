# Przewodnik self-hostingu

BentoPDF można hostować na własnej infrastrukturze. Ten przewodnik omawia różne opcje wdrożenia.

## Szybki start z Docker / Podman

Najszybszy sposób na self-hosting BentoPDF:

> [!TIP]
> BentoPDF jest dostępny w dwóch wersjach:
>
> - **Wersja Self-Hosted**: `ghcr.io/alam00000/bentopdf-simple:latest`. Wszystkie narzędzia PDF, **bez** elementów marketingowych (bez hero, FAQ, opinii, stopki). Użyj jej do wdrożeń wewnętrznych, zespołowych i w organizacjach. To **nie** jest okrojona wersja "lite".
> - **Wersja komercyjna**: `ghcr.io/alam00000/bentopdf:latest`. Pełna strona marketingowa, używana przez samo bentopdf.com i przez posiadaczy licencji komercyjnej uruchamiających publiczne wdrożenia.
>
> W razie wątpliwości: pobierz wersję Self-Hosted.

> [!IMPORTANT]
> Konwersja plików Office wymaga `SharedArrayBuffer`, co oznacza, że aplikacja musi być jednocześnie odizolowana cross-origin i serwowana z bezpiecznego kontekstu. Oficjalny obraz już wysyła wymagane nagłówki COOP/COEP, ale przeglądarki nadal wyłączają `SharedArrayBuffer` na zwykłych adresach HTTP w sieci lokalnej, takich jak `http://192.168.x.x`.
>
> Używaj `http://localhost` tylko do testów na tym samym urządzeniu. Jeśli użytkownicy łączą się z BentoPDF przez adres IP w sieci LAN lub nazwę hosta, zakończ połączenie przez HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Lub z Docker Compose / Podman Compose:

```yaml
# docker-compose.yml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    restart: unless-stopped
```

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Podman Quadlet (Linux Systemd)

Uruchom BentoPDF jako usługę systemd. Utwórz `~/.config/containers/systemd/bentopdf.container`:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always

[Install]
WantedBy=default.target
```

```bash
systemctl --user daemon-reload
systemctl --user enable --now bentopdf
```

Pełną dokumentację Quadlet znajdziesz w [przewodniku wdrożenia Docker](/pl/self-hosting/docker).

## Budowanie ze źródeł

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Opcje konfiguracji

### Wersja Self-Hosted (Simple Mode)

Wersja Self-Hosted (obraz `bentopdf-simple`, zwana też Simple Mode) jest **funkcjonalnie identyczna** z wersją komercyjną: każde narzędzie PDF jest obecne i działa tak samo. Ukrywa tylko elementy marketingowe, które mają sens wyłącznie na samym bentopdf.com lub w komercyjnym, publicznym wdrożeniu. **To nie jest okrojona wersja "lite".**

**Co ukrywa wersja Self-Hosted** (tylko kosmetycznie, żadne funkcje PDF nie są usuwane):

- Pasek nawigacji, sekcja hero, sekcja funkcji, FAQ, opinie, stopka
- Zmienia tytuł strony na "Narzędzia PDF"

**Co zachowuje wersja Self-Hosted** (wszystko, co faktycznie pracuje na PDF):

- Każde narzędzie PDF (łączenie, dzielenie, edycja, podpisywanie, OCR, konwersja Office itd.)
- Obsługa własnego brandingu, cała konfiguracja czasu budowania i działania

Wersja komercyjna (`ghcr.io/alam00000/bentopdf:latest`) napędza samo bentopdf.com i jest używana przez posiadaczy licencji komercyjnej uruchamiających publiczne wdrożenia. Dodaje hero, FAQ, opinie i stopkę, które nie miałyby sensu w narzędziu wewnętrznym.

Jeśli hostujesz BentoPDF dla swojego zespołu, organizacji lub jako narzędzie wewnętrzne, pobierz wersję Self-Hosted:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Szczegóły znajdziesz w [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md).

### Wersja komercyjna (publiczne wdrożenia z własną marką)

Wersja komercyjna (obraz `bentopdf`, bez sufiksu `-simple`) napędza samo bentopdf.com. Zawiera pełną stronę marketingową (hero, funkcje, FAQ, opinie, stopka) oraz każde narzędzie PDF. Użyj tej wersji, gdy chcesz **wdrożyć BentoPDF jako publiczną usługę PDF pod własną marką**, na przykład:

- Uruchamiasz BentoPDF jako hostowaną usługę SaaS dla użytkowników końcowych na własnej domenie
- Chcesz doświadczenia strony docelowej (sekcje marketingowe + narzędzia), a nie samą powierzchnię narzędzi
- Jesteś posiadaczem licencji komercyjnej i osadzasz BentoPDF w komercyjnym produkcie

**Uruchom bez zmian** (z brandingiem BentoPDF, przydatne do podglądu buildu):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Zbuduj z własną marką** (typowy przepływ komercyjny):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Każda inna opcja czasu budowania (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, nadpisania adresów WASM itd.) działa tak samo jak w wersji Self-Hosted.

::: warning Licencjonowanie
Uruchamianie wersji komercyjnej jest dozwolone w ramach jednej z dwóch opcji licencyjnych BentoPDF:

- **AGPL-3.0** (darmowa): dozwolone, jeśli Twoje wdrożenie publikuje cały kod źródłowy na licencji AGPL, w tym modyfikacje brandingu i otaczającą logikę biznesową.
- **Licencja komercyjna** (79 USD dożywotnio): wymagana dla wdrożeń z zamkniętym kodem / własnościowych, w których nie udostępniasz otwarcie forka brandingu ani kodu biznesowego.

Pełne porównanie znajdziesz na [stronie Licencjonowanie](https://www.bentopdf.com/licensing). Moduły WASM na licencji AGPL (PyMuPDF, Ghostscript, CoherentPDF) ładują się z CDN w czasie działania, więc nie trafiają do Twojego obrazu i nie zmieniają Twojej sytuacji licencyjnej.
:::

### Base URL

Wdrożenie w podkatalogu:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Własny branding

Zastąp domyślne logo BentoPDF, nazwę i tekst stopki własnymi podczas budowania:

| Zmienna            | Opis                                | Domyślnie                               |
| ------------------ | ----------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Nazwa marki w nagłówku i stopce     | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Ścieżka do logo względem `public/`  | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Własny tekst stopki/praw autorskich | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Lub przez Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Branding działa zarówno w trybie pełnym, jak i Simple Mode, i można go łączyć ze wszystkimi innymi opcjami czasu budowania (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Wyłączanie wybranych narzędzi

Ukryj wybrane narzędzia ze względów zgodności lub bezpieczeństwa. Wyłączone narzędzia są usuwane ze strony głównej, wyszukiwarki, skrótów, kreatora przepływów i bezpośredniego dostępu przez URL.

Identyfikatory narzędzi to adres strony bez `.html`. Otwórz dowolne narzędzie i spójrz na adres URL (np. `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Czas budowania** (wbudowane w bundle):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Czas działania** (bez przebudowywania, zamontuj `config.json`):

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf"]
}
```

```bash
docker run -d -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

Obie metody można łączyć, a listy są scalane.

Możesz też wyłączyć wybrane funkcje w Edytorze PDF (np. redakcję) bez wyłączania całego narzędzia, dodając `editorDisabledCategories` do `config.json`. Pełną listę kategorii znajdziesz w [przewodniku Docker](/pl/self-hosting/docker#wyłaczanie-funkcji-edytora).

## Przewodniki wdrożenia

Wybierz swoją platformę:

- [Vercel](/pl/self-hosting/vercel)
- [Netlify](/pl/self-hosting/netlify)
- [Cloudflare Pages](/pl/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/pl/self-hosting/aws)
- [Hostinger](/pl/self-hosting/hostinger)
- [Nginx](/pl/self-hosting/nginx)
- [Apache](/pl/self-hosting/apache)
- [Docker](/pl/self-hosting/docker)
- [Kubernetes](/pl/self-hosting/kubernetes)
- [CORS Proxy](/pl/self-hosting/cors-proxy) - wymagany dla podpisów cyfrowych

## Typowe problemy

### Konwersja Word / ODT / Excel / PowerPoint na PDF zawiesza się (SharedArrayBuffer niedostępny)

**Objaw**: konwersje dokumentów oparte na LibreOffice (Word, ODT, Excel, PowerPoint na PDF) zawieszają się na ok. 55% lub nie startują. Konsola przeglądarki może pokazywać:

> `ReferenceError: SharedArrayBuffer is not defined`

…albo `window.crossOriginIsolated` zwraca `false`, albo kompilacja WASM zgłasza `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Przyczyna**: LibreOffice WASM wymaga `SharedArrayBuffer`, który przeglądarka włącza tylko wtedy, gdy strona jest **odizolowana cross-origin** ORAZ serwowana z **bezpiecznego kontekstu**. Oznacza to, że muszą być spełnione dwa warunki:

1. Każda odpowiedź zawiera oba nagłówki:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. Strona jest serwowana z `https://...` lub `http://localhost`. Zwykły HTTP na adresie IP w sieci LAN (np. `http://192.168.x.x`) NIE jest uznawany za bezpieczny, a przeglądarki wyłączają tam `SharedArrayBuffer`.

Niezgodność `00 61 73 6d / 1f 8b 08 08` to osobny podobjaw: wstępnie skompresowane pliki `.wasm.gz` / `.data.gz` nie mają nagłówka odpowiedzi `Content-Encoding: gzip`, więc przeglądarka dostaje surowe bajty gzip zamiast rozpakowanego WASM.

**Rozwiązanie**: dokładną konfigurację znajdziesz w przewodniku dla swojej platformy:

- [Nginx →](/pl/self-hosting/nginx#podpisz-pdf-lub-wypełnianie-formularzy-pdf-pokazuje-pusty-podglad-bład-mime-mjs)
- [Apache →](/pl/self-hosting/apache#podpisywanie-pdf-lub-wypełnianie-formularzy-pokazuje-pusta-przegladarke-bład-mime-mjs)
- [AWS S3 + CloudFront →](/pl/self-hosting/aws#krok-3b-polityka-nagłowkow-odpowiedzi-wymagana-dla-libreoffice-wasm)
- [Cloudflare Pages →](/pl/self-hosting/cloudflare#plik-konfiguracji) (plik `_headers`)
- [Netlify →](/pl/self-hosting/netlify#konwersja-word-odt-excel-na-pdf-zawiesza-sie-na-55) (`netlify.toml`)
- [Vercel →](/pl/self-hosting/vercel#konwersja-word-odt-excel-na-pdf-nie-działa) (`vercel.json`)
- [Hostinger →](/pl/self-hosting/hostinger#narzedzia-libreoffice-nie-działaja) (`.htaccess`)
- [Kubernetes →](/pl/self-hosting/kubernetes#błedy-typu-mime-dla-mjs-pusty-iframe-podpisz-pdf-wypełnianie-formularzy-pdf)
- **Docker**: obsługiwane automatycznie przez wbudowaną konfigurację nginx, nie trzeba nic robić.

**Weryfikacja**: otwórz konsolę DevTools na dowolnej stronie BentoPDF i uruchom:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Jeśli strona działa przez HTTPS lub `http://localhost` ORAZ oba nagłówki COEP/COOP są obecne w każdej odpowiedzi, oba testy przejdą. Jeśli jesteś na `http://192.168.x.x` lub innym adresie HTTP spoza pętli zwrotnej, zakończ połączenie przez HTTPS. Nie ma rozwiązania opartego wyłącznie na nagłówkach.

### Pliki `.mjs` serwowane jako `application/octet-stream`

**Objaw**: Podpisz PDF / Wypełnianie formularzy PDF / niektóre inne narzędzia pokazują pusty podgląd lub nie ładują się. Konsola przeglądarki zgłasza:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Przyczyna**: Twój serwer WWW lub reverse proxy nie ma mapowania typu MIME dla plików `.mjs` (wbudowana przeglądarka PDF dostarcza moduły ES z tym rozszerzeniem). Wiele standardowych konfiguracji serwerów domyślnie używa `application/octet-stream` dla nierozpoznanych rozszerzeń, a przeglądarki odmawiają wykonania takich plików jako modułów ES.

**Rozwiązanie**: dokładny fragment znajdziesz w przewodniku dla swojej platformy:

- [Nginx →](/pl/self-hosting/nginx#podpisz-pdf-lub-wypełnianie-formularzy-pdf-pokazuje-pusty-podglad-bład-mime-mjs)
- [Apache →](/pl/self-hosting/apache#podpisywanie-pdf-lub-wypełnianie-formularzy-pokazuje-pusta-przegladarke-bład-mime-mjs)
- [AWS S3 + CloudFront →](/pl/self-hosting/aws#krok-2-zbuduj-i-wyslij) (zobacz `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/pl/self-hosting/kubernetes#błedy-typu-mime-dla-mjs-pusty-iframe-podpisz-pdf-wypełnianie-formularzy-pdf)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: obsługiwane automatycznie, nie trzeba nic robić.

**Weryfikacja**: otwórz DevTools → karta Network, znajdź nieudane żądanie `.mjs` i sprawdź nagłówek odpowiedzi `Content-Type`. Powinien mieć wartość `application/javascript`. Jeśli nadal jest `application/octet-stream`, zewnętrzny reverse proxy lub CDN może ponownie wykrywać typ, więc sprawdź każdą warstwę w łańcuchu serwowania.

## Konfiguracja WASM (komponenty AGPL)

BentoPDF **nie dołącza** bibliotek przetwarzania na licencji AGPL do swojego kodu źródłowego, ale **wstępnie konfiguruje adresy CDN**, więc wszystkie funkcje działają od razu, bez ręcznej konfiguracji.

::: tip Domyślnie bez konfiguracji
Od wersji v2.0.0 moduły WASM są wstępnie skonfigurowane do ładowania z CDN jsDelivr przez zmienne środowiskowe. Wszystkie zaawansowane funkcje działają od razu, bez żadnej konfiguracji użytkownika.
:::

| Komponent       | Licencja | Funkcje                                                         |
| --------------- | -------- | --------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | Konwersja EPUB/MOBI/FB2/XPS, wyodrębnianie obrazów i tabel      |
| **Ghostscript** | AGPL-3.0 | Konwersja do PDF/A, kompresja, prostowanie skanów, rasteryzacja |
| **CoherentPDF** | AGPL-3.0 | Spis treści, załączniki, łączenie PDF z zakładkami              |

### Domyślne zmienne środowiskowe

Są ustawione w `.env.production` i wbudowane w build:

```bash
VITE_WASM_PYMUPDF_URL=https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/
VITE_WASM_GS_URL=https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/
VITE_WASM_CPDF_URL=https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/
VITE_TESSERACT_WORKER_URL=
VITE_TESSERACT_CORE_URL=
VITE_TESSERACT_LANG_URL=
VITE_TESSERACT_AVAILABLE_LANGUAGES=
VITE_OCR_FONT_BASE_URL=
```

### Nadpisywanie adresów WASM

Możesz nadpisać wartości domyślne podczas budowania dla własnych wdrożeń:

```bash
# Via Docker build args
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://your-server.com/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://your-server.com/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://your-server.com/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://your-server.com/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://your-server.com/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://your-server.com/ocr/fonts \
  -t bentopdf .

# Or via .env.production before building from source
VITE_WASM_PYMUPDF_URL=https://your-server.com/pymupdf/ npm run build
```

Aby całkowicie wyłączyć moduł (wymagając ręcznej konfiguracji przez użytkownika w Ustawieniach zaawansowanych), ustaw jego zmienną na pusty ciąg.

Dla OCR albo zostaw wszystkie zmienne `VITE_TESSERACT_*` puste i korzystaj z domyślnych zasobów online, albo ustaw razem adresy worker/core/lang dla self-hostowanego/offline OCR. Jeśli dołączasz tylko wybrane języki OCR, ustaw też `VITE_TESSERACT_AVAILABLE_LANGUAGES` na te same kody oddzielone przecinkami, aby interfejs oferował tylko zainstalowane języki, a nieobsługiwane wybory kończyły się opisowym błędem. Dla w pełni offline'owego wyniku przeszukiwalnego PDF ustaw też `VITE_OCR_FONT_BASE_URL` na wewnętrzny katalog serwujący dołączone czcionki OCR.

Użytkownicy mogą też w dowolnej chwili nadpisać te wartości w **Ustawieniach zaawansowanych** w interfejsie. Nadpisania zapisane w przeglądarce mają pierwszeństwo przed domyślnymi wartościami środowiska.

### Wdrożenie w sieci izolowanej / offline

Dla sieci bez dostępu do internetu (administracja, ochrona zdrowia, finanse itd.). Adresy WASM są wbudowane w JavaScript podczas **budowania**, a same pliki WASM pobiera **przeglądarka użytkownika** w czasie działania. Dlatego wszystko trzeba przygotować na maszynie z internetem, a potem przenieść do izolowanej sieci.

#### Skrypt automatyczny (zalecany)

Dołączony skrypt `prepare-airgap.sh` automatyzuje cały proces: pobiera pakiety WASM, buduje obraz Docker i tworzy samodzielny pakiet ze skryptem instalacyjnym.

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Show supported OCR language codes (for --ocr-languages)
bash scripts/prepare-airgap.sh --list-ocr-languages

# Search OCR language codes by name or abbreviation
bash scripts/prepare-airgap.sh --search-ocr-language german

# Interactive mode — prompts for all options
bash scripts/prepare-airgap.sh

# Or fully automated
bash scripts/prepare-airgap.sh --wasm-base-url https://internal.example.com/wasm
```

Powstaje katalog pakietu:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Przenieś pakiet do izolowanej sieci przez USB, wewnętrzne repozytorium artefaktów lub zatwierdzoną metodę. Następnie uruchom dołączony skrypt instalacyjny:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Skrypt instalacyjny wczytuje obraz Docker, wypakowuje pliki WASM i opcjonalnie uruchamia kontener.

**Opcje skryptu:**

| Flaga                          | Opis                                                     | Domyślnie                        |
| ------------------------------ | -------------------------------------------------------- | -------------------------------- |
| `--wasm-base-url <url>`        | Gdzie pliki WASM będą hostowane wewnętrznie              | _(wymagane, pytanie jeśli brak)_ |
| `--image-name <name>`          | Tag obrazu Docker                                        | `bentopdf`                       |
| `--output-dir <path>`          | Katalog wyjściowy pakietu                                | `./bentopdf-airgap-bundle`       |
| `--simple-mode`                | Włącz Simple Mode                                        | wyłączone                        |
| `--base-url <path>`            | Bazowy URL podkatalogu (np. `/pdf/`)                     | `/`                              |
| `--language <code>`            | Domyślny język interfejsu (np. `fr`, `de`)               | _(brak)_                         |
| `--brand-name <name>`          | Własna nazwa marki                                       | _(brak)_                         |
| `--brand-logo <path>`          | Ścieżka do logo względem `public/`                       | _(brak)_                         |
| `--footer-text <text>`         | Własny tekst stopki                                      | _(brak)_                         |
| `--ocr-languages <list>`       | Języki OCR do dołączenia, oddzielone przecinkami         | `eng`                            |
| `--list-ocr-languages`         | Wypisz obsługiwane kody i nazwy OCR, a następnie zakończ | wyłączone                        |
| `--search-ocr-language <term>` | Szukaj kodów OCR po nazwie lub skrócie                   | wyłączone                        |
| `--dockerfile <path>`          | Używany Dockerfile                                       | `Dockerfile`                     |
| `--skip-docker`                | Pomiń budowanie i eksport Docker                         | wyłączone                        |
| `--skip-wasm`                  | Pomiń pobieranie WASM (użyj istniejących plików `.tgz`)  | wyłączone                        |

Interaktywny monit akceptuje też `list`, aby wypisać pełną listę obsługiwanych kodów Tesseract, oraz `search <term>`, aby znaleźć dopasowania, np. `search german` lub `search chi`.

::: warning Wymóg tego samego źródła
Pliki WASM muszą być serwowane z **tego samego źródła (origin)** co aplikacja BentoPDF. Web Workery używają `importScripts()`, które nie może ładować skryptów cross-origin. Na przykład, jeśli BentoPDF działa pod `https://internal.example.com`, bazowy adres WASM powinien być również `https://internal.example.com/wasm`.
:::

#### Kroki ręczne

<details>
<summary>Jeśli wolisz zrobić to ręcznie, bez skryptu</summary>

**Krok 1: Pobierz pakiety WASM i OCR** (na maszynie z internetem)

```bash
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf
```

**Krok 2: Zbuduj obraz Docker z wewnętrznymi adresami**

```bash
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .
```

**Krok 3: Wyeksportuj obraz Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**Krok 4: Przenieś do izolowanej sieci**

Skopiuj przez USB, wewnętrzne repozytorium artefaktów lub zatwierdzoną metodę transferu:

- `bentopdf.tar`: obraz Docker
- Pięć pakietów `.tgz` WASM/OCR z kroku 1
- Katalog `tesseract-langdata/` z kroku 1
- Katalog `ocr-fonts/` z kroku 1

**Krok 5: Skonfiguruj wewnątrz izolowanej sieci**

```bash
# Load the Docker image
docker load -i bentopdf.tar

# Extract WASM packages
mkdir -p ./wasm/pymupdf ./wasm/gs ./wasm/cpdf ./wasm/ocr/core ./wasm/ocr/lang-data ./wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C ./wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C ./wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C ./wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" ./wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C ./wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz ./wasm/ocr/lang-data/
cp ./ocr-fonts/* ./wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

Upewnij się, że pliki są dostępne pod adresami skonfigurowanymi w kroku 2, w tym `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` i `.../ocr/fonts`.

</details>

::: info Budujesz ze źródeł zamiast w Dockerze?
Ustaw zmienne w `.env.production` przed uruchomieniem `npm run build`:

```bash
VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/
VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/
VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/
VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js
VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core
VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data
VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts
```

:::

### Hostowanie własnego proxy WASM

Jeśli musisz serwować pliki WASM na licencji AGPL z odpowiednimi nagłówkami CORS, możesz wdrożyć proste proxy. Przykładową implementację znajdziesz w [przewodniku Cloudflare WASM Proxy](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md).

::: tip Dlaczego osobno?
To rozdzielenie zapewnia:

- Jasną zgodność prawną dla użytkowników komercyjnych
- Rdzeń BentoPDF pozostaje na podwójnej licencji (AGPL-3.0 / komercyjna)
- Pliki WASM są ładowane w czasie działania, a nie dołączane do źródeł
  :::

## Wymagania systemowe

| Wymaganie | Minimum                             |
| --------- | ----------------------------------- |
| Miejsce   | ok. 100 MB (rdzeń bez modułów AGPL) |
| RAM       | 512 MB                              |
| CPU       | Dowolny nowoczesny procesor         |

::: tip
BentoPDF to statyczna strona, więc nie jest potrzebna baza danych ani serwer backendowy!
:::
