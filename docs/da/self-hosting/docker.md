# Installer med Docker / Podman

Den nemmeste måde at selvhoste BentoPDF i et produktionsmiljø.

> [!IMPORTANT]
> **Påkrævede headere til konvertering af Office-filer**
>
> LibreOffice-baserede værktøjer (konvertering af Word, Excel og PowerPoint) kræver disse HTTP-headere for at understøtte `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Siden skal også serveres fra en sikker kontekst. `http://localhost` virker til lokal test, men `http://192.168.x.x` eller andre LAN-IP'er opfylder normalt ikke kravet, så Office-konvertering over almindelig HTTP mislykkes, selv om headerne er til stede.
>
> De officielle containerbilleder indeholder disse headere. Hvis du bruger en reverse proxy (Traefik, Caddy osv.), så sørg for, at headerne bevares eller tilføjes, og brug HTTPS ved adgang uden for loopback.

> [!TIP]
> **Podman-brugere:** Alle `docker`-kommandoer virker med Podman, hvis du erstatter `docker` med `podman` og `docker-compose` med `podman-compose`.

## Hurtig start

> [!TIP]
> BentoPDF leveres i to builds:
>
> - **Self-Hosted-build**: `ghcr.io/alam00000/bentopdf-simple:latest`. Alle PDF-værktøjer, **uden** markedsføringsindhold (ingen hero, FAQ, udtalelser, footer). Brug den til interne installationer i teams og organisationer. Det er **ikke** en "lite"-version med færre funktioner.
> - **Commercial-build**: `ghcr.io/alam00000/bentopdf:latest`. Det fulde markedsføringssite, som bruges af bentopdf.com selv og af indehavere af kommercielle licenser med offentligt tilgængelige installationer.
>
> Er du i tvivl: hent Self-Hosted-builden.

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

Opret `docker-compose.yml`:

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

Kør:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Byg dit eget image

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

Byg og kør:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Miljøvariabler

| Variabel                             | Beskrivelse                                                                                                                                                                                | Standard                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Byg Self-Hosted-varianten (skjuler bentopdf.com's markedsføringsindhold: hero, FAQ, udtalelser, footer). Alle PDF-værktøjer bevares.                                                       | `false`                                                        |
| `BASE_URL`                           | Installer i en undermappe                                                                                                                                                                  | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL til PyMuPDF WASM-modul                                                                                                                                                                 | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL til Ghostscript WASM-modul                                                                                                                                                             | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL til CoherentPDF WASM-modul                                                                                                                                                             | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL til OCR-workerscript                                                                                                                                                                   | _(tom; brug Tesseract.js' standard-CDN)_                       |
| `VITE_TESSERACT_CORE_URL`            | Mappe til OCR-kerne-runtime                                                                                                                                                                | _(tom; brug Tesseract.js' standard-CDN)_                       |
| `VITE_TESSERACT_LANG_URL`            | Mappe til OCR-traineddata                                                                                                                                                                  | _(tom; brug Tesseract.js' standard-CDN)_                       |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Kommaseparerede OCR-sprog, der vises i brugerfladen                                                                                                                                        | _(tom; vis hele kataloget)_                                    |
| `VITE_OCR_FONT_BASE_URL`             | Mappe til OCR-tekstlagets skrifttyper                                                                                                                                                      | _(tom; brug eksterne Noto-skrift-URL'er)_                      |
| `VITE_DEFAULT_LANGUAGE`              | Standard UI language                                                                                                                                                                       | `en`                                                           |
| `VITE_BRAND_NAME`                    | Brugerdefineret brandnavn                                                                                                                                                                  | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Logosti relativt til `public/`                                                                                                                                                             | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Brugerdefineret footer-/copyrighttekst                                                                                                                                                     | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | Kommaseparerede værktøjs-ID'er, der skal skjules                                                                                                                                           | _(tom; alle værktøjer aktiveret)_                              |
| `DISABLE_GITHUB_STARS`               | Spring hentningen af GitHub-stjerneantal over ved sideindlæsning, og fjern `api.github.com` fra CSP. Simple Mode-builds springer den altid over.                                           | `false`                                                        |
| `SITE_URL`                           | Offentlig URL, der skrives i canonical-, hreflang- og sitemap-links. Lad den stå på standardværdien, medmindre du vil have søgemaskiner til at behandle din installation som et eget site. | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Med en brugerdefineret `SITE_URL` markeres hver side `noindex`, så din kopi ikke konkurrerer med bentopdf.com i søgeresultaterne. Sæt til `true` for at lade søgemaskiner indeksere den.   | `false`                                                        |

WASM-modul-URL'erne er forudkonfigureret med CDN-standarder, så alle avancerede funktioner virker fra start. Overskriv dem til air-gapped eller selvhostede installationer.

### Søgemaskiner

Som standard peger hver side søgemaskiner hen på bentopdf.com som originalen, så din installation ikke vises som dublet. Du behøver ikke ændre noget for en privat eller intern instans.

- **Hold din instans helt ude af søgeresultaterne:** kør containeren med `-e ROBOTS_NOINDEX=true`. Det kræver kun en genstart, ikke en ny build.
- **Gør din instans til sit eget site i søgeresultaterne:** byg med `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Uden `ALLOW_INDEXING=true` markerer en brugerdefineret `SITE_URL` hver side `noindex`.

### Content-Security-Policy

Nginx-imaget leveres med en håndhævende `Content-Security-Policy`-header. CSP'ens direktiver `script-src`, `connect-src` og `font-src` **genereres ved build** ud fra `VITE_*`-URL-variablerne ovenfor, og alle værter, du angiver via `--build-arg`, føjes automatisk til politikken.

Det betyder:

- Hvis du overskriver `VITE_CORS_PROXY_URL` eller `VITE_WASM_*_URL` ved build, tillader CSP automatisk disse origins, så der kræves ingen ekstra konfiguration.
- For URL'er på `cdn.jsdelivr.net` tillader `script-src` kun den præcise versionerede pakkemappe, for eksempel `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, ikke hele CDN'et. jsDelivr leverer enhver offentlig npm-pakke eller GitHub-repository, så hvis hele værten blev tilladt, kunne hvilken som helst af dem køre på din instans. URL'er på alle andre værter tillades pr. origin.
- Hvis du konfigurerer brugerdefinerede WASM-URL'er _ved kørsel_ via siden Avancerede indstillinger i appen, står disse origins **ikke** i CSP, og browseren blokerer hentning fra dem. Det gælder også en anden version af samme pakke på `cdn.jsdelivr.net`, fordi kun den version, der blev sat ved build, er tilladt. Konfiguration ved kørsel er beregnet til eksperimenter. Til permanente brugerdefinerede URL'er skal du sætte det tilsvarende `VITE_*`-build-arg.
- Air-gapped installationer, der overskriver alle tre `VITE_WASM_*_URL`-værdier, får også disse `cdn.jsdelivr.net`-pakkemapper fjernet fra CSP (hver standardværdi erstattes, ikke tilføjes). Tesseract OCR-standarderne på `cdn.jsdelivr.net` forbliver i politikken, indtil du også sætter de tre `VITE_TESSERACT_*`-værdier. Tilsvarende erstatter `VITE_CORS_PROXY_URL` den offentlige standard `bentopdf-cors-proxy.bentopdf.workers.dev`.

CSP indeholder `'unsafe-eval'` i `script-src`, fordi LibreOffice WASM-runtime (brugt af værktøjerne til konvertering af Word/Excel/PowerPoint) og billedbiblioteket wasm-vips (brugt til PDF til TIFF) kompilerer intern dispatch-kode via `new Function()`. Hvis den fjernes, holder de værktøjer op med at virke. Hvis du bygger i `SIMPLE_MODE` (uden LibreOffice) og ikke har brug for PDF til TIFF, kan du manuelt redigere den genererede `security-headers.conf` og fjerne `'unsafe-eval'` for en strengere politik.

For OCR skal du lade `VITE_TESSERACT_*`-variablerne stå tomme for at bruge standardressourcerne online, eller sætte alle tre sammen til selvhostet/offline OCR. Delvise OCR-overskrivninger afvises, fordi worker, kerne-runtime og traineddata-mappe skal passe sammen. For fuldt offline søgbar PDF-output skal du også sætte `VITE_OCR_FONT_BASE_URL`, så OCR-tekstlagets skrifttyper indlæses fra din interne server i stedet for de offentlige Noto-skrift-URL'er.

`VITE_DEFAULT_LANGUAGE` angiver brugerfladens sprog for førstegangsbesøgende. Understøttede værdier: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Brugere kan stadig skifte sprog, det ændrer kun standarden.

Eksempel:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Brugerdefineret branding

Erstat BentoPDF's standardlogo, navn og footertekst med dine egne. Læg din logofil i mappen `public/` (eller brug et eksisterende billede), og angiv derefter branding-variablerne ved build:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Branding virker i både fuld tilstand og Simple Mode og kan kombineres med alle andre build-indstillinger.

### Deaktivering af bestemte værktøjer

Skjul værktøjer i brugerfladen af hensyn til compliance eller sikkerhed. Deaktiverede værktøjer fjernes fra forsiden, søgeresultater, tastaturgenveje og workflow-builderen. Direkte adgang via URL viser en side om, at værktøjet ikke er tilgængeligt.

Værktøjs-ID'er er sidens URL uden `.html`. Hvis værktøjet for eksempel ligger på `bentopdf.com/edit-pdf.html`, er ID'et `edit-pdf`.

#### Find værktøjs-ID'er

Den nemmeste måde: åbn et værktøj i BentoPDF og se på URL'en. Den sidste del af stien (uden `.html`) er værktøjs-ID'et.

<details>
<summary>Komplet liste over værktøjs-ID'er</summary>

**Rediger og annotér:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Konverter til PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Konverter fra PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organiser og administrer:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optimer og reparer:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Sikkerhed:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Mulighed 1: Ved build (Docker build-arg)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Det bager listen over deaktiverede værktøjer ind i JavaScript-bundlen. Kræver en ny build at ændre.

#### Mulighed 2: Ved kørsel (config.json)

Mount en `config.json`-fil i den serverede mappe, uden behov for ny build:

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

Eller med Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Begge metoder kan kombineres, og listerne flettes. Hvis et værktøj står i en af dem, er det deaktiveret.

#### Deaktivering af editorfunktioner

Du kan også deaktivere bestemte funktioner i PDF-editoren (f.eks. sortlægning, annotationer, formularer) uden at deaktivere hele editorværktøjet. Tilføj `editorDisabledCategories` til din `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Komplet liste over editorkategorier</summary>

**Zoom:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Annotation:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Former:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Formular:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Sortlægning:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Dokument:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Side:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Panel:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Værktøjer:** `tools`, `pan`, `pointer`, `capture`

**Markering:** `selection`, `selection-copy`

**Historik:** `history`, `history-undo`, `history-redo`

</details>

Kategorierne er hierarkiske: Deaktiverer du en overordnet kategori (f.eks. `annotation`), deaktiveres alle dens underkategorier.

### Deaktivering af GitHub-stjernetælleren

Navigationslinjen viser et live antal GitHub-stjerner, som hentes fra `api.github.com` ved sideindlæsning. Det er den eneste eksterne forespørgsel, der ikke tjener en PDF-funktion. Deaktivér den ved build for at fjerne hentekoden fra bundlen og fjerne `api.github.com` fra Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Simple Mode-builds (`bentopdf-simple`) springer altid stjernetælleren over. Flaget er kun nødvendigt på Commercial-builden eller egne fulde builds.

### Brugerdefinerede WASM-URL'er (air-gapped / selvhostet)

> [!IMPORTANT]
> WASM-URL'er bages ind i JavaScript **ved build**. WASM-filerne downloades af **brugerens browser** ved kørsel, og Docker downloader dem ikke under build. I air-gapped netværk skal du hoste WASM-filerne på en intern server, som browsere kan nå.

**Fuld air-gapped arbejdsgang:**

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

Brug koderne udskrevet af `bash scripts/prepare-airgap.sh --list-ocr-languages`, eller søg på navn med `bash scripts/prepare-airgap.sh --search-ocr-language <term>`, til `--ocr-languages`. Når du bygger med en begrænset OCR-delmængde, skal du give de samme koder til `VITE_TESSERACT_AVAILABLE_LANGUAGES`, så appen kun viser medfølgende sprog. For fuld offline OCR-output skal du også hoste den medfølgende mappe `ocr-fonts/` og pege `VITE_OCR_FONT_BASE_URL` på den.

Sæt en variabel til en tom streng for at deaktivere det modul (brugere skal så konfigurere manuelt via Avancerede indstillinger).

## Brugerdefineret port

Som standard lytter BentoPDF på port `8080` inde i containeren. For at ændre det skal du sætte miljøvariablen `PORT` ved kørsel:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Variable | Beskrivelse                    | Standard |
| -------- | ------------------------------ | -------- |
| `PORT`   | Nginx' lytteport i containeren | `8080`   |

Det virker med både standard- og nonroot-Dockerfilerne.

## Brugerdefineret bruger-ID (PUID/PGID)

Til miljøer, der kræver kørsel som en bestemt bruger uden root (NAS-enheder, Kubernetes med sikkerhedskontekster, organisationens politikker), tilbyder BentoPDF en separat Dockerfile med PUID/PGID-understøttelse i LSIO-stil.

### Byg og kør

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

### Miljøvariabler

| Variabel       | Beskrivelse           | Standard |
| -------------- | --------------------- | -------- |
| `PUID`         | Bruger-ID at køre som | `1000`   |
| `PGID`         | Gruppe-ID at køre som | `1000`   |
| `PORT`         | Nginx' lytteport      | `8080`   |
| `DISABLE_IPV6` | Deaktivér IPv6-lytter | `false`  |

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

### Sådan fungerer det

Containeren starter som root, opretter en bruger med den angivne PUID/PGID, justerer ejerskab på alle skrivbare mapper og dropper derefter rettigheder med `su-exec`. Nginx-processen kører udelukkende som den bruger, du har angivet.

> [!NOTE]
> Standard-`Dockerfile` bruger `nginx-unprivileged` (UID 101) og anbefales til de fleste installationer. Brug kun `Dockerfile.nonroot`, når du har brug for et bestemt UID/GID.

> [!WARNING]
> PUID/PGID kan ikke være `0` (root). Entrypointet validerer input og afslutter med en fejl ved ugyldige værdier.

## Med Traefik (reverse proxy)

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

## Med Caddy (reverse proxy)

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

Caddyfile:

```
pdf.example.com {
    reverse_proxy bentopdf:8080
    header Cross-Origin-Opener-Policy "same-origin"
    header Cross-Origin-Embedder-Policy "require-corp"
}
```

## Ressourcegrænser

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

## Podman Quadlet (systemd-integration)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) giver dig mulighed for at køre Podman-containere som systemd-services. Det er ideelt til produktionsinstallationer på Linux-systemer.

### Grundlæggende Quadlet-opsætning

Opret en container-unitfil på `~/.config/containers/systemd/bentopdf.container` (bruger) eller `/etc/containers/systemd/bentopdf.container` (system):

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

### Aktivér og start

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
> Til installation for hele systemet skal du bruge `systemctl` uden flaget `--user` og placere filen i `/etc/containers/systemd/`.

### Quadlet med health check

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

### Automatisk opdatering med Quadlet

Podman kan automatisk opdatere containere, når nye images er tilgængelige:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Quadlet-netværkskonfiguration

Til brugerdefineret netværkskonfiguration skal du oprette en netværksfil `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Henvis derefter til den i din containerfil:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Opdatering

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
