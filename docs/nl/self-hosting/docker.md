# Implementeren met Docker / Podman

De eenvoudigste manier om BentoPDF zelf te hosten in een productieomgeving.

> [!IMPORTANT]
> **Vereiste headers voor conversie van Office-bestanden**
>
> Op LibreOffice gebaseerde tools (conversie van Word, Excel en PowerPoint) hebben deze HTTP-headers nodig voor `SharedArrayBuffer`-ondersteuning:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> De pagina moet ook vanuit een beveiligde context worden aangeboden. `http://localhost` werkt voor lokaal testen, maar `http://192.168.x.x` of andere LAN-IP's komen meestal niet in aanmerking, dus Office-conversie via gewoon HTTP mislukt ook als de headers aanwezig zijn.
>
> De officiële containerimages bevatten deze headers. Gebruik je een reverse proxy (Traefik, Caddy enzovoort), zorg dan dat deze headers behouden blijven of worden toegevoegd, en gebruik HTTPS voor toegang buiten loopback.

> [!TIP]
> **Podman-gebruikers:** Alle `docker`-opdrachten werken met Podman door `docker` te vervangen door `podman` en `docker-compose` door `podman-compose`.

## Snelstart

> [!TIP]
> BentoPDF wordt in twee builds geleverd:
>
> - **Zelfgehoste build**: `ghcr.io/alam00000/bentopdf-simple:latest`. Alle PDF-tools, **zonder** de marketingelementen (geen hero, FAQ, testimonials, footer). Gebruik deze voor interne implementaties van teams of organisaties. Het is **geen** "lite"-versie met minder functies.
> - **Commerciële build**: `ghcr.io/alam00000/bentopdf:latest`. De volledige marketingsite, gebruikt door bentopdf.com zelf en door houders van een commerciële licentie met openbare implementaties.
>
> Twijfel je, haal dan de zelfgehoste build op.

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

Maak `docker-compose.yml` aan:

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

Uitvoeren:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Bouw je eigen image

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

Bouwen en uitvoeren:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Omgevingsvariabelen

| Variable                             | Description                                                                                                                                                                 | Default                                                        |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Bouw de zelfgehoste variant (verbergt de marketingelementen van bentopdf.com: hero, FAQ, testimonials, footer). Alle PDF-tools blijven beschikbaar.                         | `false`                                                        |
| `BASE_URL`                           | Implementeren in een submap                                                                                                                                                 | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL van de PyMuPDF WASM-module                                                                                                                                              | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL van de Ghostscript WASM-module                                                                                                                                          | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL van de CoherentPDF WASM-module                                                                                                                                          | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL van het OCR-workerscript                                                                                                                                                | _(leeg; gebruik de standaard-CDN van Tesseract.js)_            |
| `VITE_TESSERACT_CORE_URL`            | Map met de OCR-core-runtime                                                                                                                                                 | _(leeg; gebruik de standaard-CDN van Tesseract.js)_            |
| `VITE_TESSERACT_LANG_URL`            | Map met OCR-traineddata                                                                                                                                                     | _(leeg; gebruik de standaard-CDN van Tesseract.js)_            |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | OCR-talen in de interface, gescheiden door komma's                                                                                                                          | _(leeg; toon de volledige catalogus)_                          |
| `VITE_OCR_FONT_BASE_URL`             | Map met OCR-tekstlaaglettertypen                                                                                                                                            | _(leeg; gebruik externe Noto-lettertype-URL's)_                |
| `VITE_DEFAULT_LANGUAGE`              | Standaardtaal van de interface                                                                                                                                              | `en`                                                           |
| `VITE_BRAND_NAME`                    | Aangepaste merknaam                                                                                                                                                         | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Logopad relatief aan `public/`                                                                                                                                              | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Aangepaste footer-/copyrighttekst                                                                                                                                           | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | Tool-ID's om te verbergen, gescheiden door komma's                                                                                                                          | _(leeg; alle tools ingeschakeld)_                              |
| `DISABLE_GITHUB_STARS`               | Sla het ophalen van het aantal GitHub-sterren bij het laden van de pagina over en haal `api.github.com` uit de CSP. Builds in Simple Mode slaan het altijd over.            | `false`                                                        |
| `SITE_URL`                           | Openbare URL die in canonical-, hreflang- en sitemaplinks wordt geschreven. Laat de standaardwaarde staan, tenzij zoekmachines je implementatie als eigen site moeten zien. | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Bij een aangepaste `SITE_URL` krijgt elke pagina `noindex`, zodat je kopie niet concurreert met bentopdf.com in zoekresultaten. Zet op `true` om indexering toe te staan.   | `false`                                                        |

WASM-module-URL's zijn vooraf geconfigureerd met CDN-standaardwaarden, dus alle geavanceerde functies werken direct. Overschrijf ze voor air-gapped of zelfgehoste implementaties.

### Zoekmachines

Standaard verwijst elke pagina zoekmachines naar bentopdf.com als origineel, zodat je implementatie niet als duplicaat verschijnt. Voor een privé- of interne instantie hoef je niets te wijzigen.

- **Houd je instantie helemaal uit zoekresultaten:** start de container met `-e ROBOTS_NOINDEX=true`. Hiervoor is alleen een herstart nodig, geen nieuwe build.
- **Maak van je instantie een eigen site in zoekresultaten:** bouw met `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Zonder `ALLOW_INDEXING=true` markeert een aangepaste `SITE_URL` elke pagina als `noindex`.

### Content-Security-Policy

De nginx-image wordt geleverd met een afdwingende `Content-Security-Policy`-header. De richtlijnen `script-src`, `connect-src` en `font-src` van de CSP worden **tijdens de build gegenereerd** uit de bovenstaande `VITE_*`-URL-variabelen: alle hosts die je via `--build-arg` meegeeft, worden automatisch aan het beleid toegevoegd.

Daardoor geldt:

- Overschrijf je `VITE_CORS_PROXY_URL` of `VITE_WASM_*_URL` tijdens de build, dan staat de CSP die origins automatisch toe, zonder extra configuratie.
- Voor URL's op `cdn.jsdelivr.net` staat `script-src` alleen de exacte map van het versiegebonden pakket toe, bijvoorbeeld `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, niet de hele CDN. jsDelivr serveert elk openbaar npm-pakket of GitHub-repository, dus het toestaan van de hele host zou elk daarvan op je instantie laten draaien. URL's op andere hosts worden op origin toegestaan.
- Configureer je aangepaste WASM-URL's tijdens _runtime_ via de pagina Geavanceerde instellingen in de app, dan staan die origins **niet** in de CSP en blokkeert de browser het ophalen ervan. Dit geldt ook voor een andere versie van hetzelfde pakket op `cdn.jsdelivr.net`, omdat alleen de tijdens de build ingestelde versie is toegestaan. Runtimeconfiguratie is bedoeld om mee te experimenteren; stel voor permanente aangepaste URL's het bijbehorende `VITE_*`-buildargument in.
- Air-gapped implementaties die alle drie de `VITE_WASM_*_URL`-waarden overschrijven, verwijderen ook die `cdn.jsdelivr.net`-pakketmappen uit de CSP (elke standaardwaarde wordt vervangen, niet aangevuld). De Tesseract OCR-standaardwaarden op `cdn.jsdelivr.net` blijven in het beleid staan totdat je ook de drie `VITE_TESSERACT_*`-waarden instelt. Zo vervangt het instellen van `VITE_CORS_PROXY_URL` ook de openbare standaardwaarde `bentopdf-cors-proxy.bentopdf.workers.dev`.

De CSP bevat `'unsafe-eval'` in `script-src`, omdat de LibreOffice WASM-runtime (gebruikt door de conversietools voor Word/Excel/PowerPoint) en de afbeeldingsbibliotheek wasm-vips (gebruikt door PDF naar TIFF) interne dispatch-code compileren via `new Function()`. Zonder dit werken die tools niet meer. Bouw je in `SIMPLE_MODE` (zonder LibreOffice) en heb je PDF naar TIFF niet nodig, dan kun je het gegenereerde `security-headers.conf` handmatig bewerken om `'unsafe-eval'` te verwijderen voor een strenger beleid.

Laat voor OCR de `VITE_TESSERACT_*`-variabelen leeg om de standaard online assets te gebruiken, of stel alle drie samen in voor zelfgehoste/offline OCR. Gedeeltelijke OCR-overschrijvingen worden geweigerd, omdat de worker, de core-runtime en de traineddata-map bij elkaar moeten passen. Stel voor volledig offline doorzoekbare PDF-uitvoer ook `VITE_OCR_FONT_BASE_URL` in, zodat de OCR-tekstlaaglettertypen van je interne server worden geladen in plaats van van de openbare Noto-lettertype-URL's.

`VITE_DEFAULT_LANGUAGE` stelt de interfacetaal in voor nieuwe bezoekers. Ondersteunde waarden: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Gebruikers kunnen nog steeds van taal wisselen: dit verandert alleen de standaardtaal.

Voorbeeld:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Eigen huisstijl

Vervang het standaardlogo, de naam en de footertekst van BentoPDF door je eigen. Plaats je logobestand in de map `public/` (of gebruik een bestaande afbeelding) en geef de huisstijlvariabelen tijdens de build mee:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Huisstijl werkt in zowel de volledige modus als Simple Mode en kan worden gecombineerd met alle andere buildopties.

### Specifieke tools uitschakelen

Verberg tools in de interface voor compliance- of beveiligingseisen. Uitgeschakelde tools verdwijnen van de startpagina, uit zoekresultaten, sneltoetsen en de workflowbouwer. Rechtstreekse toegang via de URL toont een pagina "tool niet beschikbaar".

Tool-ID's zijn de pagina-URL zonder `.html`. Staat een tool bijvoorbeeld op `bentopdf.com/edit-pdf.html`, dan is de ID `edit-pdf`.

#### Tool-ID's vinden

Het makkelijkst: open een tool in BentoPDF en kijk naar de URL. Het laatste deel van het pad (zonder `.html`) is de tool-ID.

<details>
<summary>Volledige lijst met tool-ID's</summary>

**Bewerken en annoteren:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Naar PDF converteren:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Van PDF converteren:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organiseren en beheren:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optimaliseren en repareren:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Beveiliging:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Optie 1: Tijdens de build (Docker-buildargument)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Hiermee wordt de lijst met uitgeschakelde tools in de JavaScript-bundel ingebakken. Wijzigen vereist een nieuwe build.

#### Optie 2: Tijdens runtime (config.json)

Koppel een bestand `config.json` in de aangeboden map, zonder nieuwe build:

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

Of met Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Beide methoden kunnen worden gecombineerd: de lijsten worden samengevoegd. Staat een tool in een van beide, dan is hij uitgeschakeld.

#### Editorfuncties uitschakelen

Je kunt ook specifieke functies in de PDF-editor (bijv. redactie, annotaties, formulieren) uitschakelen zonder de hele editortool uit te schakelen. Voeg `editorDisabledCategories` toe aan je `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Volledige lijst met editorcategorieën</summary>

**Zoom:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Annotatie:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Vormen:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Formulier:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Redactie:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Document:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Pagina:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Paneel:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Tools:** `tools`, `pan`, `pointer`, `capture`

**Selectie:** `selection`, `selection-copy`

**Geschiedenis:** `history`, `history-undo`, `history-redo`

</details>

Categorieën zijn hiërarchisch: het uitschakelen van een bovenliggende categorie (bijv. `annotation`) schakelt alle onderliggende uit.

### De GitHub-sterrenteller uitschakelen

De navigatiebalk toont een live aantal GitHub-sterren, bij het laden van de pagina opgehaald van `api.github.com`. Het is het enige externe verzoek dat geen PDF-functie dient. Schakel het uit tijdens de build om de ophaalcode uit de bundel te verwijderen en `api.github.com` uit de Content-Security-Policy te halen:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Builds in Simple Mode (`bentopdf-simple`) slaan de sterrenteller altijd over: deze vlag is alleen nodig voor de commerciële build of aangepaste volledige builds.

### Aangepaste WASM-URL's (air-gapped / zelfgehost)

> [!IMPORTANT]
> WASM-URL's worden tijdens de **build** in de JavaScript ingebakken. De WASM-bestanden worden tijdens runtime door de **browser van de gebruiker** gedownload: Docker downloadt ze niet tijdens de build. Voor air-gapped netwerken moet je de WASM-bestanden hosten op een interne server die browsers kunnen bereiken.

**Volledige air-gapped werkwijze:**

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

Gebruik de codes die `bash scripts/prepare-airgap.sh --list-ocr-languages` toont, of zoek op naam met `bash scripts/prepare-airgap.sh --search-ocr-language <term>`, voor `--ocr-languages`. Bouw je met een beperkte OCR-subset, geef dan dezelfde codes door aan `VITE_TESSERACT_AVAILABLE_LANGUAGES`, zodat de app alleen meegeleverde talen toont. Host voor volledig offline OCR-uitvoer ook de meegeleverde map `ocr-fonts/` en laat `VITE_OCR_FONT_BASE_URL` ernaar verwijzen.

Stel een variabele in op een lege string om die module uit te schakelen (gebruikers moeten dan handmatig configureren via Geavanceerde instellingen).

## Aangepaste poort

Standaard luistert BentoPDF op poort `8080` in de container. Om dit te wijzigen, stel je tijdens runtime de omgevingsvariabele `PORT` in:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Variable | Description                        | Default |
| -------- | ---------------------------------- | ------- |
| `PORT`   | Nginx-luisterpoort in de container | `8080`  |

Dit werkt met zowel de standaard als de nonroot Dockerfile.

## Aangepaste gebruikers-ID (PUID/PGID)

Voor omgevingen die als een specifieke niet-rootgebruiker moeten draaien (NAS-apparaten, Kubernetes met security contexts, organisatiebeleid) biedt BentoPDF een aparte Dockerfile met PUID/PGID-ondersteuning in LSIO-stijl.

### Bouwen en uitvoeren

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

### Omgevingsvariabelen

| Variable       | Description                     | Default |
| -------------- | ------------------------------- | ------- |
| `PUID`         | Gebruikers-ID om mee te draaien | `1000`  |
| `PGID`         | Groeps-ID om mee te draaien     | `1000`  |
| `PORT`         | Nginx-luisterpoort              | `8080`  |
| `DISABLE_IPV6` | IPv6-listener uitschakelen      | `false` |

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

### Hoe het werkt

De container start als root, maakt een gebruiker aan met de opgegeven PUID/PGID, past het eigendom van alle beschrijfbare mappen aan en laat daarna rechten vallen met `su-exec`. Het nginx-proces draait volledig als de door jou opgegeven gebruiker.

> [!NOTE]
> De standaard `Dockerfile` gebruikt `nginx-unprivileged` (UID 101) en wordt aanbevolen voor de meeste implementaties. Gebruik `Dockerfile.nonroot` alleen als je een specifieke UID/GID nodig hebt.

> [!WARNING]
> PUID/PGID mag niet `0` (root) zijn. De entrypoint valideert de invoer en stopt met een foutmelding bij ongeldige waarden.

## Met Traefik (reverse proxy)

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

## Met Caddy (reverse proxy)

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

## Resourcelimieten

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

## Podman Quadlet (systemd-integratie)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) laat je Podman-containers als systemd-services draaien. Dit is ideaal voor productie-implementaties op Linux-systemen.

### Basisinstallatie van Quadlet

Maak een containerunitbestand aan op `~/.config/containers/systemd/bentopdf.container` (gebruiker) of `/etc/containers/systemd/bentopdf.container` (systeem):

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

### Inschakelen en starten

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
> Gebruik voor een systeembrede implementatie `systemctl` zonder de vlag `--user` en plaats het bestand in `/etc/containers/systemd/`.

### Quadlet met health check

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

### Automatisch bijwerken met Quadlet

Podman kan containers automatisch bijwerken wanneer nieuwe images beschikbaar zijn:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Netwerkconfiguratie van Quadlet

Maak voor een aangepaste netwerkconfiguratie een netwerkbestand `bentopdf.network` aan:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Verwijs er daarna naar in je containerbestand:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Bijwerken

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
