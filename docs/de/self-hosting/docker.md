# Mit Docker / Podman bereitstellen

Der einfachste Weg, BentoPDF in einer Produktionsumgebung selbst zu hosten.

> [!IMPORTANT]
> **Erforderliche Header für die Konvertierung von Office-Dateien**
>
> LibreOffice-basierte Werkzeuge (Word-, Excel-, PowerPoint-Konvertierung) benötigen diese HTTP-Header für die `SharedArrayBuffer`-Unterstützung:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Die Seite muss außerdem aus einem sicheren Kontext ausgeliefert werden. `http://localhost` funktioniert für lokale Tests, aber `http://192.168.x.x` oder andere LAN-IPs gelten meist nicht als sicher, daher schlägt die Office-Konvertierung über einfaches HTTP fehl, auch wenn die Header vorhanden sind.
>
> Die offiziellen Container-Images enthalten diese Header. Wenn Sie einen Reverse-Proxy (Traefik, Caddy usw.) verwenden, stellen Sie sicher, dass diese Header erhalten bleiben oder hinzugefügt werden, und nutzen Sie HTTPS für Zugriffe außerhalb von Loopback.

> [!TIP]
> **Podman-Nutzer:** Alle `docker`-Befehle funktionieren mit Podman, wenn Sie `docker` durch `podman` und `docker-compose` durch `podman-compose` ersetzen.

## Schnellstart

> [!TIP]
> BentoPDF gibt es in zwei Builds:
>
> - **Self-Hosted-Build**: `ghcr.io/alam00000/bentopdf-simple:latest`. Jedes PDF-Werkzeug, **ohne** Marketing-Elemente (kein Hero, keine FAQ, keine Testimonials, kein Footer). Nutzen Sie ihn für interne Bereitstellungen in Teams und Organisationen. Er ist **keine** funktionsreduzierte "Lite"-Version.
> - **Commercial-Build**: `ghcr.io/alam00000/bentopdf:latest`. Die vollständige Marketing-Website, die bentopdf.com selbst und Inhaber kommerzieller Lizenzen für öffentlich zugängliche Bereitstellungen nutzen.
>
> Im Zweifel: Nehmen Sie den Self-Hosted-Build.

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

Erstellen Sie `docker-compose.yml`:

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

Ausführen:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Eigenes Image bauen

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

Bauen und ausführen:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Umgebungsvariablen

| Variable                             | Beschreibung                                                                                                                                                                                     | Standard                                                       |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Baut die Self-Hosted-Variante (blendet die Marketing-Elemente von bentopdf.com aus: Hero, FAQ, Testimonials, Footer). Alle PDF-Werkzeuge bleiben erhalten.                                       | `false`                                                        |
| `BASE_URL`                           | In Unterverzeichnis bereitstellen                                                                                                                                                                | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL des PyMuPDF-WASM-Moduls                                                                                                                                                                      | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL des Ghostscript-WASM-Moduls                                                                                                                                                                  | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL des CoherentPDF-WASM-Moduls                                                                                                                                                                  | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL des OCR-Worker-Skripts                                                                                                                                                                       | _(leer; Standard-CDN von Tesseract.js)_                        |
| `VITE_TESSERACT_CORE_URL`            | Verzeichnis der OCR-Core-Runtime                                                                                                                                                                 | _(leer; Standard-CDN von Tesseract.js)_                        |
| `VITE_TESSERACT_LANG_URL`            | Verzeichnis der OCR-traineddata                                                                                                                                                                  | _(leer; Standard-CDN von Tesseract.js)_                        |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Kommagetrennte OCR-Sprachen, die in der Oberfläche angeboten werden                                                                                                                              | _(leer; vollständigen Katalog anzeigen)_                       |
| `VITE_OCR_FONT_BASE_URL`             | Verzeichnis der OCR-Textebenen-Schriften                                                                                                                                                         | _(leer; externe Noto-Schrift-URLs)_                            |
| `VITE_DEFAULT_LANGUAGE`              | Standard UI language                                                                                                                                                                             | `en`                                                           |
| `VITE_BRAND_NAME`                    | Eigener Markenname                                                                                                                                                                               | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Logo-Pfad relativ zu `public/`                                                                                                                                                                   | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Eigener Footer-/Copyright-Text                                                                                                                                                                   | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | Kommagetrennte Werkzeug-IDs zum Ausblenden                                                                                                                                                       | _(leer; alle Werkzeuge aktiviert)_                             |
| `DISABLE_GITHUB_STARS`               | Überspringt den Abruf der GitHub-Sterne beim Laden der Seite und entfernt `api.github.com` aus der CSP. Simple-Mode-Builds überspringen ihn immer.                                               | `false`                                                        |
| `SITE_URL`                           | Öffentliche URL, die in Canonical-, hreflang- und Sitemap-Links geschrieben wird. Lassen Sie den Standard, sofern Suchmaschinen Ihre Bereitstellung nicht als eigene Website behandeln sollen.   | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Bei einer eigenen `SITE_URL` wird jede Seite mit `noindex` markiert, damit Ihre Kopie in den Suchergebnissen nicht mit bentopdf.com konkurriert. Mit `true` dürfen Suchmaschinen sie indexieren. | `false`                                                        |

Die WASM-Modul-URLs sind mit CDN-Standardwerten vorkonfiguriert, sodass alle erweiterten Funktionen sofort funktionieren. Überschreiben Sie sie für abgeschottete oder selbst gehostete Bereitstellungen.

### Suchmaschinen

Standardmäßig verweist jede Seite Suchmaschinen auf bentopdf.com als Original, sodass Ihre Bereitstellung nicht als Duplikat erscheint. Für eine private oder interne Instanz müssen Sie nichts ändern.

- **Ihre Instanz komplett aus den Suchergebnissen heraushalten:** Starten Sie den Container mit `-e ROBOTS_NOINDEX=true`. Das erfordert nur einen Neustart, keinen Rebuild.
- **Ihre Instanz als eigene Website in den Suchergebnissen erscheinen lassen:** Bauen Sie mit `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Ohne `ALLOW_INDEXING=true` markiert eine eigene `SITE_URL` jede Seite mit `noindex`.

### Content-Security-Policy

Das nginx-Image wird mit einem erzwingenden `Content-Security-Policy`-Header ausgeliefert. Die Direktiven `script-src`, `connect-src` und `font-src` der CSP werden **beim Build** aus den oben genannten `VITE_*`-URL-Variablen **generiert**: Alle Hosts, die Sie per `--build-arg` übergeben, werden automatisch in die Richtlinie aufgenommen.

Daraus folgt:

- Wenn Sie `VITE_CORS_PROXY_URL` oder `VITE_WASM_*_URL` beim Build überschreiben, erlaubt die CSP diese Origins automatisch, ohne zusätzliche Konfiguration.
- Für URLs auf `cdn.jsdelivr.net` erlaubt `script-src` nur den exakten versionierten Paketordner, zum Beispiel `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, nicht das gesamte CDN. jsDelivr liefert jedes öffentliche npm-Paket und GitHub-Repository aus, sodass die Freigabe des gesamten Hosts es jedem davon erlauben würde, auf Ihrer Instanz zu laufen. URLs auf allen anderen Hosts werden per Origin erlaubt.
- Wenn Sie eigene WASM-URLs zur _Laufzeit_ über die Seite Erweiterte Einstellungen in der App konfigurieren, stehen diese Origins **nicht** in der CSP, und der Browser blockiert Abrufe dorthin. Das gilt auch für eine andere Version desselben Pakets auf `cdn.jsdelivr.net`, da nur die beim Build festgelegte Version erlaubt ist. Die Konfiguration zur Laufzeit ist für Experimente gedacht; für dauerhafte eigene URLs setzen Sie das passende `VITE_*`-Build-Argument.
- Bei abgeschotteten Bereitstellungen, die alle drei `VITE_WASM_*_URL`-Werte überschreiben, werden auch diese `cdn.jsdelivr.net`-Paketordner aus der CSP entfernt (jeder Standardwert wird ersetzt, nicht ergänzt). Die Tesseract-OCR-Standardwerte auf `cdn.jsdelivr.net` bleiben in der Richtlinie, bis Sie auch die drei `VITE_TESSERACT_*`-Werte setzen. Ebenso ersetzt das Setzen von `VITE_CORS_PROXY_URL` den öffentlichen Standard `bentopdf-cors-proxy.bentopdf.workers.dev`.

Die CSP enthält `'unsafe-eval'` in `script-src`, weil die LibreOffice-WASM-Runtime (für die Word-/Excel-/PowerPoint-Konvertierung) und die Bildbibliothek wasm-vips (für PDF zu TIFF) internen Dispatch-Code über `new Function()` kompilieren. Ohne es würden diese Werkzeuge nicht mehr funktionieren. Wenn Sie im `SIMPLE_MODE` (ohne LibreOffice) bauen und PDF zu TIFF nicht brauchen, können Sie die generierte `security-headers.conf` manuell bearbeiten und `'unsafe-eval'` für eine strengere Richtlinie entfernen.

Lassen Sie für OCR die `VITE_TESSERACT_*`-Variablen leer, um die Standard-Online-Ressourcen zu nutzen, oder setzen Sie alle drei zusammen für selbst gehostetes/Offline-OCR. Teilweise Überschreibungen werden abgelehnt, weil Worker, Core-Runtime und traineddata-Verzeichnis zusammenpassen müssen. Für eine vollständig offline erzeugte durchsuchbare PDF setzen Sie zusätzlich `VITE_OCR_FONT_BASE_URL`, damit die OCR-Textebenen-Schriften von Ihrem internen Server statt von den öffentlichen Noto-Schrift-URLs geladen werden.

`VITE_DEFAULT_LANGUAGE` legt die Oberflächensprache für Erstbesucher fest. Unterstützte Werte: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Nutzer können die Sprache weiterhin wechseln, das ändert nur den Standard.

Beispiel:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Eigenes Branding

Ersetzen Sie das Standard-Logo, den Namen und den Footer-Text von BentoPDF durch Ihre eigenen. Legen Sie Ihre Logodatei im Ordner `public/` ab (oder nutzen Sie ein vorhandenes Bild) und übergib die Branding-Variablen beim Build:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Das Branding funktioniert im Vollmodus und im Simple Mode und lässt sich mit allen anderen Build-Optionen kombinieren.

### Bestimmte Werkzeuge deaktivieren

Blenden Sie Werkzeuge aus der Oberfläche aus, etwa aus Compliance- oder Sicherheitsgründen. Deaktivierte Werkzeuge werden von der Startseite, aus den Suchergebnissen, den Tastenkürzeln und dem Workflow-Builder entfernt. Beim direkten Aufruf der URL erscheint eine Seite "Werkzeug nicht verfügbar".

Werkzeug-IDs entsprechen der Seiten-URL ohne `.html`. Liegt das Werkzeug zum Beispiel unter `bentopdf.com/edit-pdf.html`, lautet die ID `edit-pdf`.

#### Werkzeug-IDs finden

Am einfachsten: Öffnen Sie ein beliebiges Werkzeug in BentoPDF und sehen Sie sich die URL an. Der letzte Teil des Pfads (ohne `.html`) ist die Werkzeug-ID.

<details>
<summary>Vollständige Liste der Werkzeug-IDs</summary>

**Bearbeiten & Annotieren:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**In PDF konvertieren:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Aus PDF konvertieren:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organisieren & Verwalten:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optimieren & Reparieren:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Sicherheit:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Option 1: Zur Build-Zeit (Docker-Build-Argument)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Dadurch wird die Liste der deaktivierten Werkzeuge fest in das JavaScript-Bundle geschrieben. Zum Ändern ist ein Rebuild nötig.

#### Option 2: Zur Laufzeit (config.json)

Binden Sie eine `config.json`-Datei in das ausgelieferte Verzeichnis ein, ganz ohne Rebuild:

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

Oder mit Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Beide Methoden lassen sich kombinieren, die Listen werden zusammengeführt. Taucht ein Werkzeug in einer von beiden auf, ist es deaktiviert.

#### Editor-Funktionen deaktivieren

Sie können auch einzelne Funktionen im PDF-Editor (z. B. Schwärzen, Annotationen, Formulare) deaktivieren, ohne das gesamte Editor-Werkzeug abzuschalten. Fügen Sie `editorDisabledCategories` zu Ihrer `config.json` hinzu:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Vollständige Liste der Editor-Kategorien</summary>

**Zoom:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Annotation:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Formen:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Formular:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Schwärzung:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Dokument:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Seite:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Panel:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Werkzeuge:** `tools`, `pan`, `pointer`, `capture`

**Auswahl:** `selection`, `selection-copy`

**Verlauf:** `history`, `history-undo`, `history-redo`

</details>

Kategorien sind hierarchisch: Das Deaktivieren einer übergeordneten Kategorie (z. B. `annotation`) deaktiviert alle ihre untergeordneten.

### Den GitHub-Sternezähler deaktivieren

Die Navigationsleiste zeigt einen Live-Zähler der GitHub-Sterne, der beim Laden der Seite von `api.github.com` abgerufen wird. Es ist die einzige externe Anfrage, die keiner PDF-Funktion dient. Deaktivieren Sie ihn beim Build, um den Abrufcode aus dem Bundle zu entfernen und `api.github.com` aus der Content-Security-Policy zu streichen:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Simple-Mode-Builds (`bentopdf-simple`) überspringen den Sternezähler immer. Dieses Flag wird nur für den Commercial-Build oder eigene Voll-Builds benötigt.

### Eigene WASM-URLs (abgeschottet / selbst gehostet)

> [!IMPORTANT]
> WASM-URLs werden **beim Build** fest in das JavaScript geschrieben. Die WASM-Dateien lädt der **Browser des Nutzers** zur Laufzeit herunter, Docker lädt sie beim Build nicht herunter. In abgeschotteten Netzwerken müssen Sie die WASM-Dateien auf einem internen Server hosten, den Browser erreichen können.

**Vollständiger Workflow für abgeschottete Umgebungen:**

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

Verwenden Sie für `--ocr-languages` die Codes, die `bash scripts/prepare-airgap.sh --list-ocr-languages` ausgibt, oder suchen Sie per Name mit `bash scripts/prepare-airgap.sh --search-ocr-language <term>`. Wenn Sie mit einer eingeschränkten OCR-Teilmenge bauen, übergib dieselben Codes an `VITE_TESSERACT_AVAILABLE_LANGUAGES`, damit die App nur gebündelte Sprachen anzeigt. Für eine vollständige Offline-OCR-Ausgabe hosten Sie zusätzlich das mitgelieferte Verzeichnis `ocr-fonts/` und lassen Sie `VITE_OCR_FONT_BASE_URL` darauf zeigen.

Setzen Sie eine Variable auf einen leeren String, um das jeweilige Modul zu deaktivieren (Nutzer müssen es dann manuell über die Erweiterten Einstellungen konfigurieren).

## Eigener Port

Standardmäßig lauscht BentoPDF im Container auf Port `8080`. Um das zu ändern, setzen Sie zur Laufzeit die Umgebungsvariable `PORT`:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Variable | Beschreibung                   | Standard |
| -------- | ------------------------------ | -------- |
| `PORT`   | Nginx-Listen-Port im Container | `8080`   |

Das funktioniert sowohl mit dem Standard- als auch mit dem Nonroot-Dockerfile.

## Eigene Benutzer-ID (PUID/PGID)

Für Umgebungen, die einen bestimmten Nicht-Root-Benutzer erfordern (NAS-Geräte, Kubernetes mit Security-Contexts, organisatorische Vorgaben), bietet BentoPDF ein separates Dockerfile mit PUID/PGID-Unterstützung im LSIO-Stil.

### Bauen und ausführen

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

### Umgebungsvariablen

| Variable       | Beschreibung                           | Standard |
| -------------- | -------------------------------------- | -------- |
| `PUID`         | Benutzer-ID, unter der ausgeführt wird | `1000`   |
| `PGID`         | Gruppen-ID, unter der ausgeführt wird  | `1000`   |
| `PORT`         | Nginx-Listen-Port                      | `8080`   |
| `DISABLE_IPV6` | IPv6-Listener deaktivieren             | `false`  |

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

### So funktioniert es

Der Container startet als root, legt einen Benutzer mit der angegebenen PUID/PGID an, passt die Besitzrechte aller beschreibbaren Verzeichnisse an und gibt dann mit `su-exec` die Rechte ab. Der nginx-Prozess läuft vollständig unter dem angegebenen Benutzer.

> [!NOTE]
> Das Standard-`Dockerfile` verwendet `nginx-unprivileged` (UID 101) und wird für die meisten Bereitstellungen empfohlen. Nutzen Sie `Dockerfile.nonroot` nur, wenn Sie eine bestimmte UID/GID brauchen.

> [!WARNING]
> PUID/PGID dürfen nicht `0` (root) sein. Der Entrypoint prüft die Eingaben und beendet sich bei ungültigen Werten mit einem Fehler.

## Mit Traefik (Reverse-Proxy)

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

## Mit Caddy (Reverse-Proxy)

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

## Ressourcenlimits

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

## Podman Quadlet (systemd-Integration)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) ermöglicht es, Podman-Container als systemd-Dienste auszuführen. Das ist ideal für Produktionsbereitstellungen auf Linux-Systemen.

### Grundlegende Quadlet-Einrichtung

Erstellen Sie eine Container-Unit-Datei unter `~/.config/containers/systemd/bentopdf.container` (Benutzer) oder `/etc/containers/systemd/bentopdf.container` (System):

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

### Aktivieren und starten

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
> Für eine systemweite Bereitstellung nutzen Sie `systemctl` ohne das Flag `--user` und legen Sie die Datei in `/etc/containers/systemd/` ab.

### Quadlet mit Health-Check

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

### Automatisches Update mit Quadlet

Podman kann Container automatisch aktualisieren, wenn neue Images verfügbar sind:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Quadlet-Netzwerkkonfiguration

Für eine eigene Netzwerkkonfiguration erstellen Sie eine Netzwerkdatei `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Verweisen Sie dann in Ihrer Container-Datei darauf:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Aktualisieren

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
