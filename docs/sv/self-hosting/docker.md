# Driftsätt med Docker / Podman

Det enklaste sättet att självhosta BentoPDF i en produktionsmiljö.

> [!IMPORTANT]
> **Obligatoriska rubriker för konvertering av Office-filer**
>
> LibreOffice-baserade verktyg (konvertering av Word, Excel och PowerPoint) kräver dessa HTTP-rubriker för stöd för `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Sidan måste dessutom serveras från en säker kontext. `http://localhost` fungerar för lokal testning, men `http://192.168.x.x` och andra LAN-adresser kvalificerar sig oftast inte, så Office-konvertering över vanlig HTTP misslyckas även om rubrikerna finns.
>
> De officiella containerbilderna inkluderar dessa rubriker. Om du använder en reverse proxy (Traefik, Caddy m.fl.), se till att rubrikerna bevaras eller läggs till, och använd HTTPS för åtkomst som inte är loopback.

> [!TIP]
> **Podman-användare:** Alla `docker`-kommandon fungerar med Podman om du ersätter `docker` med `podman` och `docker-compose` med `podman-compose`.

## Snabbstart

> [!TIP]
> BentoPDF levereras i två byggen:
>
> - **Self-Hosted-bygget**: `ghcr.io/alam00000/bentopdf-simple:latest`. Alla PDF-verktyg, **utan** marknadsföringsdelarna (ingen hero, FAQ, omdömen eller sidfot). Använd detta för interna driftsättningar i team och organisationer. Det är **inte** en "lite"-version med färre funktioner.
> - **Commercial-bygget**: `ghcr.io/alam00000/bentopdf:latest`. Hela marknadsföringssajten, som används av bentopdf.com själv och av innehavare av kommersiell licens som kör publika driftsättningar.
>
> Är du osäker: hämta Self-Hosted-bygget.

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

Skapa `docker-compose.yml`:

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

Kör:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Bygg din egen image

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

Bygg och kör:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Miljövariabler

| Variabel                             | Beskrivning                                                                                                                                                                     | Standard                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Bygg Self-Hosted-varianten (döljer marknadsföringsdelarna från bentopdf.com: hero, FAQ, omdömen, sidfot). Alla PDF-verktyg finns kvar.                                          | `false`                                                        |
| `BASE_URL`                           | Driftsätt i en underkatalog                                                                                                                                                     | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL till PyMuPDF WASM-modulen                                                                                                                                                   | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL till Ghostscript WASM-modulen                                                                                                                                               | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL till CoherentPDF WASM-modulen                                                                                                                                               | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL till OCR-workerskriptet                                                                                                                                                     | _(tom; använd Tesseract.js standard-CDN)_                      |
| `VITE_TESSERACT_CORE_URL`            | Katalog för OCR-kärnkörmiljön                                                                                                                                                   | _(tom; använd Tesseract.js standard-CDN)_                      |
| `VITE_TESSERACT_LANG_URL`            | Katalog för OCR traineddata                                                                                                                                                     | _(tom; använd Tesseract.js standard-CDN)_                      |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Kommaseparerade OCR-språk som visas i gränssnittet                                                                                                                              | _(tom; visa hela katalogen)_                                   |
| `VITE_OCR_FONT_BASE_URL`             | Katalog för typsnitt till OCR-textlager                                                                                                                                         | _(tom; använd externa Noto-typsnitts-URL:er)_                  |
| `VITE_DEFAULT_LANGUAGE`              | Standardspråk för gränssnittet                                                                                                                                                  | `en`                                                           |
| `VITE_BRAND_NAME`                    | Eget varumärkesnamn                                                                                                                                                             | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Logotypens sökväg relativt `public/`                                                                                                                                            | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Egen sidfots-/upphovsrättstext                                                                                                                                                  | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | Kommaseparerade verktygs-ID:n som ska döljas                                                                                                                                    | _(tom; alla verktyg aktiverade)_                               |
| `DISABLE_GITHUB_STARS`               | Hoppa över hämtningen av GitHub-stjärnor vid sidladdning och ta bort `api.github.com` från CSP. Simple Mode-byggen hoppar alltid över den.                                      | `false`                                                        |
| `SITE_URL`                           | Publik URL som skrivs in i canonical-, hreflang- och sitemap-länkar. Behåll standardvärdet om du inte vill att sökmotorer ska behandla din driftsättning som en egen webbplats. | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Med en egen `SITE_URL` markeras varje sida `noindex` så att din kopia inte konkurrerar med bentopdf.com i sökresultaten. Sätt till `true` för att låta sökmotorer indexera den. | `false`                                                        |

WASM-modulernas URL:er är förkonfigurerade med CDN-standardvärden, så alla avancerade funktioner fungerar direkt. Åsidosätt dem för luftgappade eller självhostade driftsättningar.

### Sökmotorer

Som standard pekar varje sida sökmotorer till bentopdf.com som originalet, så att din driftsättning inte visas som en dubblett. Du behöver inte ändra något för en privat eller intern instans.

- **Håll din instans helt borta från sökresultat:** kör containern med `-e ROBOTS_NOINDEX=true`. Det kräver bara en omstart, inte ett nytt bygge.
- **Gör din instans till en egen webbplats i sökresultaten:** bygg med `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Utan `ALLOW_INDEXING=true` markerar en egen `SITE_URL` varje sida `noindex`.

### Content-Security-Policy

Nginx-imagen levereras med en tillämpad `Content-Security-Policy`-rubrik. CSP:ns direktiv `script-src`, `connect-src` och `font-src` **genereras vid bygget** från URL-variablerna `VITE_*` ovan: alla värdar du anger via `--build-arg` läggs automatiskt till i policyn.

Det innebär att:

- Om du åsidosätter `VITE_CORS_PROXY_URL` eller `VITE_WASM_*_URL` vid bygget tillåter CSP dessa ursprung automatiskt, ingen extra konfiguration behövs.
- För URL:er på `cdn.jsdelivr.net` tillåter `script-src` bara den exakta versionerade paketmappen, till exempel `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, inte hela CDN:et. jsDelivr serverar alla publika npm-paket och GitHub-repositorier, så om hela värden tilläts kunde vilket som helst av dem köras på din instans. URL:er på andra värdar tillåts per ursprung.
- Om du konfigurerar egna WASM-URL:er vid _körning_ via sidan Avancerade inställningar i appen finns dessa ursprung **inte** i CSP och webbläsaren blockerar hämtningar från dem. Detta gäller även en annan version av samma paket på `cdn.jsdelivr.net`, eftersom bara den version som angavs vid bygget tillåts. Konfiguration vid körning är avsedd för experiment; för permanenta egna URL:er, ange motsvarande `VITE_*` build arg.
- Luftgappade driftsättningar som åsidosätter alla tre `VITE_WASM_*_URL`-värden får även dessa paketmappar på `cdn.jsdelivr.net` borttagna från CSP (varje standardvärde ersätts, läggs inte till). Tesseract OCR-standardvärdena på `cdn.jsdelivr.net` finns kvar i policyn tills du även anger de tre `VITE_TESSERACT_*`-värdena. På samma sätt ersätter `VITE_CORS_PROXY_URL` den publika standardadressen `bentopdf-cors-proxy.bentopdf.workers.dev`.

CSP innehåller `'unsafe-eval'` i `script-src` eftersom LibreOffice WASM-körmiljön (som används av verktygen för konvertering av Word/Excel/PowerPoint) och bildbiblioteket wasm-vips (som används av PDF till TIFF) kompilerar intern dispatch-kod via `new Function()`. Att ta bort det skulle bryta dessa verktyg. Om du bygger i `SIMPLE_MODE` (utan LibreOffice) och inte behöver PDF till TIFF kan du manuellt redigera den genererade `security-headers.conf` och ta bort `'unsafe-eval'` för en striktare policy.

För OCR, lämna variablerna `VITE_TESSERACT_*` tomma för att använda de förvalda onlineresurserna, eller ange alla tre tillsammans för självhostad/offline-OCR. Partiella OCR-åsidosättningar avvisas eftersom workern, kärnkörmiljön och traineddata-katalogen måste matcha varandra. För sökbara PDF-filer helt offline, ange även `VITE_OCR_FONT_BASE_URL` så att OCR-textlagrets typsnitt laddas från din interna server i stället för de publika Noto-typsnitts-URL:erna.

`VITE_DEFAULT_LANGUAGE` anger gränssnittsspråk för förstagångsbesökare. Värden som stöds: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Användare kan fortfarande byta språk, det är bara standardvärdet som ändras.

Exempel:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Eget varumärke

Ersätt standardlogotypen, namnet och sidfotstexten för BentoPDF med dina egna. Lägg din logotypfil i mappen `public/` (eller använd en befintlig bild) och ange sedan varumärkesvariablerna vid bygget:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Varumärkesanpassning fungerar i både fullt läge och Simple Mode och kan kombineras med alla andra alternativ vid bygget.

### Inaktivera specifika verktyg

Dölj verktyg i gränssnittet av efterlevnads- eller säkerhetsskäl. Inaktiverade verktyg tas bort från startsidan, sökresultat, kortkommandon och arbetsflödesbyggaren. Direkt åtkomst via URL visar en sida om att verktyget inte är tillgängligt.

Verktygs-ID:n är sidans URL utan `.html`. Om verktyget till exempel finns på `bentopdf.com/edit-pdf.html` är ID:t `edit-pdf`.

#### Hitta verktygs-ID:n

Det enklaste sättet: öppna ett verktyg i BentoPDF och titta på URL:en. Sista delen av sökvägen (utan `.html`) är verktygets ID.

<details>
<summary>Fullständig lista över verktygs-ID:n</summary>

**Redigera och kommentera:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Konvertera till PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Konvertera från PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organisera och hantera:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optimera och reparera:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Säkerhet:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Alternativ 1: Vid bygget (Docker build arg)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Detta bakar in listan över inaktiverade verktyg i JavaScript-paketet. Ändringar kräver ett nytt bygge.

#### Alternativ 2: Vid körning (config.json)

Montera en `config.json`-fil i den serverade katalogen, inget nytt bygge behövs:

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

Båda metoderna kan kombineras, listorna slås ihop. Om ett verktyg finns i någon av dem inaktiveras det.

#### Inaktivera redigeringsfunktioner

Du kan också inaktivera specifika funktioner i PDF-redigeraren (t.ex. maskering, kommentarer, formulär) utan att inaktivera hela redigeringsverktyget. Lägg till `editorDisabledCategories` i din `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Fullständig lista över redigerarkategorier</summary>

**Zoom:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Kommentarer:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Former:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Formulär:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Maskering:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Dokument:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Sida:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Panel:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Verktyg:** `tools`, `pan`, `pointer`, `capture`

**Markering:** `selection`, `selection-copy`

**Historik:** `history`, `history-undo`, `history-redo`

</details>

Kategorierna är hierarkiska: om du inaktiverar en överordnad kategori (t.ex. `annotation`) inaktiveras alla underordnade.

### Inaktivera GitHub-stjärnräknaren

Navigeringsfältet visar ett live-antal GitHub-stjärnor som hämtas från `api.github.com` vid sidladdning. Det är den enda externa förfrågan som inte tjänar en PDF-funktion. Inaktivera den vid bygget för att ta bort hämtningskoden från paketet och ta bort `api.github.com` från Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Simple Mode-byggen (`bentopdf-simple`) hoppar alltid över stjärnräknaren, flaggan behövs bara för Commercial-bygget eller egna fullständiga byggen.

### Egna WASM-URL:er (luftgappat / självhostat)

> [!IMPORTANT]
> WASM-URL:erna bakas in i JavaScript vid **bygget**. WASM-filerna laddas ned av **användarens webbläsare** vid körning, Docker laddar inte ned dem under bygget. För luftgappade nätverk måste du hosta WASM-filerna på en intern server som webbläsare kan nå.

**Fullständigt arbetsflöde för luftgappade miljöer:**

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

Använd koderna som skrivs ut av `bash scripts/prepare-airgap.sh --list-ocr-languages`, eller sök på namn med `bash scripts/prepare-airgap.sh --search-ocr-language <term>`, för `--ocr-languages`. När du bygger med en begränsad uppsättning OCR-språk, ange samma koder till `VITE_TESSERACT_AVAILABLE_LANGUAGES` så att appen bara visar medföljande språk. För fullständig OCR offline, hosta även den medföljande katalogen `ocr-fonts/` och peka `VITE_OCR_FONT_BASE_URL` mot den.

Sätt en variabel till en tom sträng för att inaktivera den modulen (användare måste då konfigurera manuellt via Avancerade inställningar).

## Egen port

Som standard lyssnar BentoPDF på port `8080` i containern. För att ändra detta, ange miljövariabeln `PORT` vid körning:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Variabel | Beskrivning                      | Standard |
| -------- | -------------------------------- | -------- |
| `PORT`   | Nginx lyssningsport i containern | `8080`   |

Detta fungerar med både standard-Dockerfile och nonroot-Dockerfile.

## Eget användar-ID (PUID/PGID)

För miljöer som kräver att köra som en specifik icke-root-användare (NAS-enheter, Kubernetes med säkerhetskontexter, organisationspolicyer) tillhandahåller BentoPDF en separat Dockerfile med PUID/PGID-stöd i LSIO-stil.

### Bygg och kör

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

### Miljövariabler

| Variabel       | Beskrivning              | Standard |
| -------------- | ------------------------ | -------- |
| `PUID`         | Användar-ID att köra som | `1000`   |
| `PGID`         | Grupp-ID att köra som    | `1000`   |
| `PORT`         | Nginx lyssningsport      | `8080`   |
| `DISABLE_IPV6` | Inaktivera IPv6-lyssnare | `false`  |

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

### Så fungerar det

Containern startar som root, skapar en användare med angivet PUID/PGID, justerar ägarskapet för alla skrivbara kataloger och släpper sedan behörigheter med `su-exec`. Nginx-processen körs helt som din angivna användare.

> [!NOTE]
> Standard-`Dockerfile` använder `nginx-unprivileged` (UID 101) och rekommenderas för de flesta driftsättningar. Använd `Dockerfile.nonroot` bara när du behöver ett specifikt UID/GID.

> [!WARNING]
> PUID/PGID kan inte vara `0` (root). Entrypoint validerar indata och avslutas med ett fel vid ogiltiga värden.

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

## Resursgränser

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

## Podman Quadlet (Systemd-integration)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) låter dig köra Podman-containrar som systemd-tjänster. Det är idealiskt för produktionsdriftsättningar på Linux-system.

### Grundläggande Quadlet-uppsättning

Skapa en container unit-fil i `~/.config/containers/systemd/bentopdf.container` (användare) eller `/etc/containers/systemd/bentopdf.container` (system):

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

### Aktivera och starta

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
> För driftsättning på systemnivå, använd `systemctl` utan flaggan `--user` och placera filen i `/etc/containers/systemd/`.

### Quadlet med hälsokontroll

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

### Automatisk uppdatering med Quadlet

Podman kan uppdatera containrar automatiskt när nya images finns:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Nätverkskonfiguration för Quadlet

För egen nätverkskonfiguration, skapa en nätverksfil `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Referera sedan till den i din containerfil:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Uppdatera

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
