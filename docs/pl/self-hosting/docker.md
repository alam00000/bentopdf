# Wdrożenie z Dockerem / Podmanem

Najłatwiejszy sposób samodzielnego hostingu BentoPDF w środowisku produkcyjnym.

> [!IMPORTANT]
> **Wymagane nagłówki do konwersji plików Office**
>
> Narzędzia oparte na LibreOffice (konwersja Word, Excel, PowerPoint) wymagają tych nagłówków HTTP do obsługi `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Strona musi być też serwowana z bezpiecznego kontekstu. `http://localhost` działa do testów lokalnych, ale `http://192.168.x.x` i inne adresy LAN zwykle go nie spełniają, więc konwersja Office przez zwykłe HTTP nie zadziała, nawet jeśli nagłówki są obecne.
>
> Oficjalne obrazy kontenerów zawierają te nagłówki. Jeśli używasz reverse proxy (Traefik, Caddy itp.), upewnij się, że nagłówki są zachowywane lub dodawane, i używaj HTTPS przy dostępie spoza pętli zwrotnej.

> [!TIP]
> **Użytkownicy Podmana:** Wszystkie polecenia `docker` działają z Podmanem po zastąpieniu `docker` przez `podman` i `docker-compose` przez `podman-compose`.

## Szybki start

> [!TIP]
> BentoPDF jest dostępny w dwóch wersjach:
>
> - **Wersja do samodzielnego hostingu**: `ghcr.io/alam00000/bentopdf-simple:latest`. Wszystkie narzędzia PDF, **bez** warstwy marketingowej (bez hero, FAQ, opinii i stopki). Użyj jej do wdrożeń wewnętrznych, zespołowych i organizacyjnych. To **nie** jest okrojona wersja „lite”.
> - **Wersja komercyjna**: `ghcr.io/alam00000/bentopdf:latest`. Pełna witryna marketingowa, używana przez samo bentopdf.com i przez posiadaczy licencji komercyjnej z publicznymi wdrożeniami.
>
> W razie wątpliwości pobierz wersję do samodzielnego hostingu.

```bash
# Docker
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  --restart unless-stopped \
  ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d \
  --name bentopdf \
  -p 3000:8080 \
  ghcr.io/alam00000/bentopdf-simple:latest
```

## Docker Compose / Podman Compose

Utwórz `docker-compose.yml`:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    container_name: bentopdf
    ports:
      - '3000:8080'
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--spider', '-q', 'http://localhost:8080']
      interval: 30s
      timeout: 10s
      retries: 3
```

Uruchom:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Zbuduj własny obraz

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

Zbuduj i uruchom:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Zmienne środowiskowe

| Zmienna                              | Opis                                                                                                                                                                                                | Domyślnie                                                      |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Zbuduj wariant do samodzielnego hostingu (ukrywa warstwę marketingową bentopdf.com: hero, FAQ, opinie, stopkę). Wszystkie narzędzia PDF pozostają.                                                  | `false`                                                        |
| `BASE_URL`                           | Wdrożenie w podkatalogu                                                                                                                                                                             | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | Adres URL modułu PyMuPDF WASM                                                                                                                                                                       | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | Adres URL modułu Ghostscript WASM                                                                                                                                                                   | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | Adres URL modułu CoherentPDF WASM                                                                                                                                                                   | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | Adres URL skryptu workera OCR                                                                                                                                                                       | _(puste; domyślny CDN Tesseract.js)_                           |
| `VITE_TESSERACT_CORE_URL`            | Katalog środowiska uruchomieniowego OCR                                                                                                                                                             | _(puste; domyślny CDN Tesseract.js)_                           |
| `VITE_TESSERACT_LANG_URL`            | Katalog traineddata OCR                                                                                                                                                                             | _(puste; domyślny CDN Tesseract.js)_                           |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Języki OCR rozdzielone przecinkami, widoczne w interfejsie                                                                                                                                          | _(puste; pełny katalog)_                                       |
| `VITE_OCR_FONT_BASE_URL`             | Katalog czcionek warstwy tekstowej OCR                                                                                                                                                              | _(puste; zdalne adresy czcionek Noto)_                         |
| `VITE_DEFAULT_LANGUAGE`              | Domyślny język interfejsu                                                                                                                                                                           | `en`                                                           |
| `VITE_BRAND_NAME`                    | Własna nazwa marki                                                                                                                                                                                  | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Ścieżka logo względem `public/`                                                                                                                                                                     | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Własny tekst stopki/praw autorskich                                                                                                                                                                 | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | Identyfikatory narzędzi do ukrycia, rozdzielone przecinkami                                                                                                                                         | _(puste; wszystkie narzędzia włączone)_                        |
| `DISABLE_GITHUB_STARS`               | Pomija pobieranie liczby gwiazdek GitHub przy ładowaniu strony i usuwa `api.github.com` z CSP. Buildy Simple Mode zawsze to pomijają.                                                               | `false`                                                        |
| `SITE_URL`                           | Publiczny adres URL zapisywany w linkach canonical, hreflang i mapy witryny. Zostaw domyślny, chyba że chcesz, aby wyszukiwarki traktowały Twoje wdrożenie jako osobną witrynę.                     | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Przy własnym `SITE_URL` każda strona jest oznaczana jako `noindex`, aby Twoja kopia nie konkurowała z bentopdf.com w wynikach wyszukiwania. Ustaw `true`, aby pozwolić wyszukiwarkom ją indeksować. | `false`                                                        |

Adresy URL modułów WASM są wstępnie skonfigurowane z domyślnymi CDN, więc wszystkie zaawansowane funkcje działają od razu. Zmień je w środowiskach odciętych od sieci lub przy samodzielnym hostingu.

### Wyszukiwarki

Domyślnie każda strona wskazuje wyszukiwarkom bentopdf.com jako oryginał, więc Twoje wdrożenie nie jest widoczne jako duplikat. W prywatnej lub wewnętrznej instancji nie musisz niczego zmieniać.

- **Całkowicie ukryj swoją instancję w wynikach wyszukiwania:** uruchom kontener z `-e ROBOTS_NOINDEX=true`. Wystarczy restart, bez ponownego budowania.
- **Uczyń swoją instancję osobną witryną w wynikach wyszukiwania:** zbuduj z `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Bez `ALLOW_INDEXING=true` własny `SITE_URL` oznacza każdą stronę jako `noindex`.

### Content-Security-Policy

Obraz nginx zawiera egzekwowany nagłówek `Content-Security-Policy`. Dyrektywy CSP `script-src`, `connect-src` i `font-src` są **generowane podczas budowania** na podstawie powyższych zmiennych URL `VITE_*`: wszystkie hosty przekazane przez `--build-arg` są automatycznie dodawane do polityki.

W rezultacie:

- Jeśli podczas budowania zmienisz `VITE_CORS_PROXY_URL` lub `VITE_WASM_*_URL`, CSP automatycznie zezwoli na te źródła, bez dodatkowej konfiguracji.
- Dla adresów na `cdn.jsdelivr.net` `script-src` zezwala tylko na dokładny folder pakietu z wersją, na przykład `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, a nie na cały CDN. jsDelivr udostępnia każdy publiczny pakiet npm i repozytorium GitHub, więc zezwolenie na cały host pozwoliłoby uruchomić którykolwiek z nich w Twojej instancji. Adresy na każdym innym hoście są dozwolone według źródła (origin).
- Jeśli własne adresy WASM ustawisz _w czasie działania_ na stronie Ustawienia zaawansowane w aplikacji, te źródła **nie** są w CSP i przeglądarka zablokuje pobieranie z nich. Dotyczy to także innej wersji tego samego pakietu na `cdn.jsdelivr.net`, ponieważ dozwolona jest tylko wersja ustawiona podczas budowania. Konfiguracja w czasie działania służy do eksperymentów; dla trwałych własnych adresów ustaw odpowiedni argument budowania `VITE_*`.
- We wdrożeniach odciętych od sieci, które zmieniają wszystkie trzy wartości `VITE_WASM_*_URL`, foldery pakietów `cdn.jsdelivr.net` są też usuwane z CSP (każda wartość domyślna jest zastępowana, a nie uzupełniana). Domyślne adresy Tesseract OCR na `cdn.jsdelivr.net` zostają w polityce, dopóki nie ustawisz także trzech wartości `VITE_TESSERACT_*`. Podobnie ustawienie `VITE_CORS_PROXY_URL` zastępuje publiczną wartość domyślną `bentopdf-cors-proxy.bentopdf.workers.dev`.

CSP zawiera `'unsafe-eval'` w `script-src`, ponieważ środowisko LibreOffice WASM (używane przez narzędzia konwersji Word/Excel/PowerPoint) i biblioteka obrazów wasm-vips (używana przez PDF do TIFF) kompilują wewnętrzny kod dispatch przez `new Function()`. Usunięcie tej wartości zepsułoby te narzędzia. Jeśli budujesz w `SIMPLE_MODE` (bez LibreOffice) i nie potrzebujesz PDF do TIFF, możesz ręcznie edytować wygenerowany `security-headers.conf`, aby usunąć `'unsafe-eval'` i uzyskać ostrzejszą politykę.

W przypadku OCR zostaw zmienne `VITE_TESSERACT_*` puste, aby używać domyślnych zasobów online, albo ustaw wszystkie trzy razem dla OCR hostowanego samodzielnie lub offline. Częściowe nadpisania OCR są odrzucane, ponieważ worker, środowisko uruchomieniowe i katalog traineddata muszą do siebie pasować. Aby uzyskać w pełni offline przeszukiwalny plik PDF, ustaw też `VITE_OCR_FONT_BASE_URL`, aby czcionki warstwy tekstowej OCR były ładowane z Twojego wewnętrznego serwera, a nie z publicznych adresów czcionek Noto.

`VITE_DEFAULT_LANGUAGE` ustawia język interfejsu dla nowych odwiedzających. Obsługiwane wartości: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Użytkownicy nadal mogą zmienić język: to zmienia tylko wartość domyślną.

Przykład:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Własny branding

Zastąp domyślne logo, nazwę i tekst stopki BentoPDF własnymi. Umieść plik logo w folderze `public/` (lub użyj istniejącego obrazu), a następnie przekaż zmienne brandingu podczas budowania:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Branding działa zarówno w trybie pełnym, jak i w Simple Mode i można go łączyć ze wszystkimi innymi opcjami czasu budowania.

### Wyłączanie wybranych narzędzi

Ukryj narzędzia w interfejsie ze względu na wymogi zgodności lub bezpieczeństwa. Wyłączone narzędzia są usuwane ze strony głównej, wyników wyszukiwania, skrótów klawiszowych i kreatora przepływów pracy. Bezpośredni dostęp przez adres URL pokazuje stronę „narzędzie niedostępne”.

Identyfikatory narzędzi to adres URL strony bez `.html`. Na przykład jeśli narzędzie znajduje się pod `bentopdf.com/edit-pdf.html`, jego identyfikator to `edit-pdf`.

#### Jak znaleźć identyfikatory narzędzi

Najłatwiej: otwórz dowolne narzędzie w BentoPDF i spójrz na adres URL. Ostatnia część ścieżki (bez `.html`) to identyfikator narzędzia.

<details>
<summary>Pełna lista identyfikatorów narzędzi</summary>

**Edycja i adnotacje:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Konwersja do PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Konwersja z PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organizacja i zarządzanie:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optymalizacja i naprawa:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Bezpieczeństwo:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Opcja 1: Podczas budowania (argument budowania Docker)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Lista wyłączonych narzędzi jest wbudowywana w pakiet JavaScript. Zmiana wymaga ponownego zbudowania.

#### Opcja 2: W czasie działania (config.json)

Zamontuj plik `config.json` w serwowanym katalogu, bez ponownego budowania:

```json
{
  "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
}
```

```bash
docker run -d \
  -p 3000:8080 \
  -v ./config.json:/usr/share/nginx/html/config.json:ro \
  ghcr.io/alam00000/bentopdf-simple:latest
```

Albo z Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Obie metody można łączyć: listy są scalane. Jeśli narzędzie występuje w którejkolwiek, jest wyłączone.

#### Wyłączanie funkcji edytora

Możesz też wyłączyć wybrane funkcje wewnątrz edytora PDF (np. redagowanie, adnotacje, formularze) bez wyłączania całego edytora. Dodaj `editorDisabledCategories` do swojego `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Pełna lista kategorii edytora</summary>

**Powiększenie:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Adnotacje:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Kształty:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Formularze:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Redagowanie:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Dokument:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Strona:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Panel:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Narzędzia:** `tools`, `pan`, `pointer`, `capture`

**Zaznaczenie:** `selection`, `selection-copy`

**Historia:** `history`, `history-undo`, `history-redo`

</details>

Kategorie są hierarchiczne: wyłączenie kategorii nadrzędnej (np. `annotation`) wyłącza wszystkie jej podkategorie.

### Wyłączanie licznika gwiazdek GitHub

Pasek nawigacji pokazuje aktualną liczbę gwiazdek GitHub, pobieraną z `api.github.com` przy ładowaniu strony. To jedyne zewnętrzne żądanie, które nie obsługuje funkcji PDF. Wyłącz je podczas budowania, aby usunąć kod pobierania z pakietu i `api.github.com` z Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Buildy Simple Mode (`bentopdf-simple`) zawsze pomijają licznik gwiazdek: ta flaga jest potrzebna tylko w wersji komercyjnej lub własnych pełnych buildach.

### Własne adresy WASM (środowiska odcięte od sieci / samodzielny hosting)

> [!IMPORTANT]
> Adresy WASM są wbudowywane w JavaScript **podczas budowania**. Pliki WASM pobiera **przeglądarka użytkownika** w czasie działania: Docker nie pobiera ich podczas budowania. W sieciach odciętych od internetu musisz hostować pliki WASM na wewnętrznym serwerze dostępnym dla przeglądarek.

**Pełny proces dla środowiska odciętego od sieci:**

```bash
# 1. On a machine WITH internet — download WASM packages
bash scripts/prepare-airgap.sh --list-ocr-languages
bash scripts/prepare-airgap.sh --search-ocr-language german

# 2. Download WASM/OCR packages
npm pack @bentopdf/pymupdf-wasm@0.11.14
npm pack @bentopdf/gs-wasm
npm pack coherentpdf
npm pack tesseract.js@7.0.0
npm pack tesseract.js-core@7.0.0
mkdir -p tesseract-langdata
curl -fsSL https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz -o tesseract-langdata/eng.traineddata.gz
mkdir -p ocr-fonts
curl -fsSL https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf -o ocr-fonts/NotoSans-Regular.ttf

# 3. Build the image with your internal server URLs
docker build \
  --build-arg VITE_WASM_PYMUPDF_URL=https://internal-server.example.com/wasm/pymupdf/ \
  --build-arg VITE_WASM_GS_URL=https://internal-server.example.com/wasm/gs/ \
  --build-arg VITE_WASM_CPDF_URL=https://internal-server.example.com/wasm/cpdf/ \
  --build-arg VITE_TESSERACT_WORKER_URL=https://internal-server.example.com/wasm/ocr/worker.min.js \
  --build-arg VITE_TESSERACT_CORE_URL=https://internal-server.example.com/wasm/ocr/core \
  --build-arg VITE_TESSERACT_LANG_URL=https://internal-server.example.com/wasm/ocr/lang-data \
  --build-arg VITE_TESSERACT_AVAILABLE_LANGUAGES=eng,deu \
  --build-arg VITE_OCR_FONT_BASE_URL=https://internal-server.example.com/wasm/ocr/fonts \
  -t bentopdf .

# 4. Export the image
docker save bentopdf -o bentopdf.tar

# 5. Transfer bentopdf.tar + the .tgz packages + tesseract-langdata/ + ocr-fonts/ into the air-gapped network

# 6. Inside the air-gapped network — load and run
docker load -i bentopdf.tar

# Extract WASM packages to your internal web server
mkdir -p /var/www/wasm/pymupdf /var/www/wasm/gs /var/www/wasm/cpdf /var/www/wasm/ocr/core /var/www/wasm/ocr/lang-data /var/www/wasm/ocr/fonts
tar xzf bentopdf-pymupdf-wasm-0.11.14.tgz -C /var/www/wasm/pymupdf --strip-components=1
tar xzf bentopdf-gs-wasm-*.tgz -C /var/www/wasm/gs --strip-components=1
tar xzf coherentpdf-*.tgz -C /var/www/wasm/cpdf --strip-components=1
TEMP_TESS=$(mktemp -d)
tar xzf tesseract.js-7.0.0.tgz -C "$TEMP_TESS"
cp "$TEMP_TESS/package/dist/worker.min.js" /var/www/wasm/ocr/worker.min.js
rm -rf "$TEMP_TESS"
tar xzf tesseract.js-core-7.0.0.tgz -C /var/www/wasm/ocr/core --strip-components=1
cp ./tesseract-langdata/*.traineddata.gz /var/www/wasm/ocr/lang-data/
cp ./ocr-fonts/* /var/www/wasm/ocr/fonts/

# Run BentoPDF
docker run -d -p 3000:8080 --restart unless-stopped bentopdf
```

Użyj kodów wypisanych przez `bash scripts/prepare-airgap.sh --list-ocr-languages` lub wyszukaj po nazwie za pomocą `bash scripts/prepare-airgap.sh --search-ocr-language <term>` dla `--ocr-languages`. Gdy budujesz z ograniczonym podzbiorem OCR, przekaż te same kody do `VITE_TESSERACT_AVAILABLE_LANGUAGES`, aby aplikacja pokazywała tylko dołączone języki. Dla pełnego OCR offline hostuj też dołączony katalog `ocr-fonts/` i wskaż go w `VITE_OCR_FONT_BASE_URL`.

Ustaw zmienną na pusty ciąg, aby wyłączyć dany moduł (użytkownicy muszą wtedy skonfigurować go ręcznie w Ustawieniach zaawansowanych).

## Własny port

Domyślnie BentoPDF nasłuchuje na porcie `8080` wewnątrz kontenera. Aby to zmienić, ustaw zmienną środowiskową `PORT` w czasie uruchamiania:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Zmienna | Opis                                  | Domyślnie |
| ------- | ------------------------------------- | --------- |
| `PORT`  | Port nasłuchiwania Nginx w kontenerze | `8080`    |

Działa to zarówno ze standardowym Dockerfile, jak i z wersją nonroot.

## Własny identyfikator użytkownika (PUID/PGID)

Dla środowisk wymagających uruchamiania jako konkretny użytkownik inny niż root (urządzenia NAS, Kubernetes z kontekstami bezpieczeństwa, zasady organizacji) BentoPDF udostępnia osobny Dockerfile z obsługą PUID/PGID w stylu LSIO.

### Budowanie i uruchamianie

```bash
# Build the non-root image
docker build -f Dockerfile.nonroot -t bentopdf-nonroot .

# Run with custom UID/GID
docker run -d \
  --name bentopdf \
  -p 3000:8080 \
  -e PUID=1000 \
  -e PGID=1000 \
  --restart unless-stopped \
  bentopdf-nonroot
```

### Zmienne środowiskowe

| Zmienna        | Opis                                         | Domyślnie |
| -------------- | -------------------------------------------- | --------- |
| `PUID`         | Identyfikator użytkownika, jako który działa | `1000`    |
| `PGID`         | Identyfikator grupy, jako która działa       | `1000`    |
| `PORT`         | Port nasłuchiwania Nginx                     | `8080`    |
| `DISABLE_IPV6` | Wyłącz nasłuchiwanie IPv6                    | `false`   |

### Docker Compose

```yaml
services:
  bentopdf:
    build:
      context: .
      dockerfile: Dockerfile.nonroot
    container_name: bentopdf
    ports:
      - '3000:8080'
    environment:
      - PUID=1000
      - PGID=1000
    restart: unless-stopped
```

### Jak to działa

Kontener startuje jako root, tworzy użytkownika o podanym PUID/PGID, dostosowuje własność wszystkich katalogów z możliwością zapisu, a następnie obniża uprawnienia za pomocą `su-exec`. Proces nginx działa w całości jako wskazany użytkownik.

> [!NOTE]
> Standardowy `Dockerfile` używa `nginx-unprivileged` (UID 101) i jest zalecany w większości wdrożeń. Używaj `Dockerfile.nonroot` tylko wtedy, gdy potrzebujesz konkretnego UID/GID.

> [!WARNING]
> PUID/PGID nie mogą mieć wartości `0` (root). Punkt wejścia waliduje dane i kończy się błędem przy nieprawidłowych wartościach.

## Z Traefik (reverse proxy)

```yaml
services:
  traefik:
    image: traefik:v2.10
    command:
      - '--providers.docker=true'
      - '--entrypoints.web.address=:80'
      - '--entrypoints.websecure.address=:443'
      - '--certificatesresolvers.letsencrypt.acme.email=you@example.com'
      - '--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json'
      - '--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web'
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    labels:
      - 'traefik.enable=true'
      - 'traefik.http.routers.bentopdf.rule=Host(`pdf.example.com`)'
      - 'traefik.http.routers.bentopdf.entrypoints=websecure'
      - 'traefik.http.routers.bentopdf.tls.certresolver=letsencrypt'
      - 'traefik.http.services.bentopdf.loadbalancer.server.port=8080'
      # Required headers for SharedArrayBuffer (LibreOffice WASM)
      - 'traefik.http.routers.bentopdf.middlewares=bentopdf-headers'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Opener-Policy=same-origin'
      - 'traefik.http.middlewares.bentopdf-headers.headers.customresponseheaders.Cross-Origin-Embedder-Policy=require-corp'
    restart: unless-stopped
```

## Z Caddy (reverse proxy)

```yaml
services:
  caddy:
    image: caddy:2
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data

  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    restart: unless-stopped

volumes:
  caddy_data:
```

Plik Caddyfile:

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## Limity zasobów

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 128M
```

## Podman Quadlet (integracja z systemd)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) pozwala uruchamiać kontenery Podman jako usługi systemd. To idealne rozwiązanie dla wdrożeń produkcyjnych w systemach Linux.

### Podstawowa konfiguracja Quadlet

Utwórz plik jednostki kontenera w `~/.config/containers/systemd/bentopdf.container` (użytkownik) lub `/etc/containers/systemd/bentopdf.container` (system):

```ini
[Unit]
Description=BentoPDF - Privacy-first PDF toolkit
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Włączanie i uruchamianie

```bash
# Reload systemd to detect new unit
systemctl --user daemon-reload

# Start the service
systemctl --user start bentopdf

# Enable on boot
systemctl --user enable bentopdf

# Check status
systemctl --user status bentopdf

# View logs
journalctl --user -u bentopdf -f
```

> [!TIP]
> Dla wdrożenia ogólnosystemowego użyj `systemctl` bez flagi `--user` i umieść plik w `/etc/containers/systemd/`.

### Quadlet z kontrolą stanu

```ini
[Unit]
Description=BentoPDF with health monitoring
After=network-online.target
Wants=network-online.target

[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
AutoUpdate=registry
HealthCmd=wget --spider -q http://localhost:8080 || exit 1
HealthInterval=30s
HealthTimeout=10s
HealthRetries=3

[Service]
Restart=always
TimeoutStartSec=300

[Install]
WantedBy=default.target
```

### Automatyczna aktualizacja z Quadlet

Podman może automatycznie aktualizować kontenery, gdy pojawią się nowe obrazy:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Konfiguracja sieci Quadlet

Aby skonfigurować własną sieć, utwórz plik sieci `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Następnie odwołaj się do niego w pliku kontenera:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Aktualizacja

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
