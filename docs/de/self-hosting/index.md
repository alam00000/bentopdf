# Self-Hosting-Leitfaden

BentoPDF kann auf Ihrer eigenen Infrastruktur selbst gehostet werden. Dieser Leitfaden behandelt verschiedene Bereitstellungsoptionen.

## Schnellstart mit Docker / Podman

Der schnellste Weg, BentoPDF selbst zu hosten:

> [!TIP]
> BentoPDF gibt es in zwei Builds:
>
> - **Self-Hosted-Build** (`ghcr.io/alam00000/bentopdf-simple:latest`). Jedes PDF-Werkzeug, **ohne** das Marketing-Drumherum (kein Hero, keine FAQ, keine Testimonials, kein Footer). Nutzen Sie ihn für interne Bereitstellungen in Teams und Organisationen. Es ist **keine** funktionsreduzierte "Lite"-Version.
> - **Commercial-Build** (`ghcr.io/alam00000/bentopdf:latest`). Die vollständige Marketing-Website, die von bentopdf.com selbst und von Inhabern einer kommerziellen Lizenz mit öffentlich zugänglichen Bereitstellungen verwendet wird.
>
> Im Zweifel: Ziehen Sie den Self-Hosted-Build.

> [!IMPORTANT]
> Die Konvertierung von Office-Dateien erfordert `SharedArrayBuffer`. Die App muss dafür sowohl Cross-Origin-isoliert sein als auch aus einem sicheren Kontext ausgeliefert werden. Das offizielle Image sendet bereits die erforderlichen COOP/COEP-Header, aber Browser deaktivieren `SharedArrayBuffer` bei reinen HTTP-Ursprüngen im lokalen Netzwerk wie `http://192.168.x.x` trotzdem.
>
> Verwenden Sie `http://localhost` nur für Tests auf demselben Gerät. Wenn Nutzende BentoPDF über eine LAN-IP oder einen Hostnamen aufrufen, beenden Sie die Verbindung mit HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Oder mit Docker Compose / Podman Compose:

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

Betreiben Sie BentoPDF als systemd-Dienst. Erstellen Sie `~/.config/containers/systemd/bentopdf.container`:

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

Die vollständige Quadlet-Dokumentation finden Sie im [Docker-Bereitstellungsleitfaden](/de/self-hosting/docker).

## Aus dem Quellcode bauen

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Konfigurationsoptionen

### Self-Hosted-Build (Simple Mode)

Der Self-Hosted-Build (das Image `bentopdf-simple`, auch Simple Mode genannt) ist **funktional identisch** mit dem Commercial-Build: Jedes PDF-Werkzeug ist vorhanden und verhält sich gleich. Er blendet lediglich das Marketing-Drumherum aus, das nur auf bentopdf.com selbst oder in einer kommerziellen, öffentlich zugänglichen Bereitstellung sinnvoll ist. **Es ist keine funktionsreduzierte oder "Lite"-Version.**

**Was der Self-Hosted-Build ausblendet** (nur kosmetisch, keine PDF-Funktionen werden entfernt):

- Navigationsleiste, Hero-Bereich, Funktionsbereich, FAQ, Testimonials, Footer
- Setzt den Seitentitel auf "PDF-Werkzeuge"

**Was der Self-Hosted-Build behält** (alles, was tatsächlich PDF-Arbeit leistet):

- Jedes PDF-Werkzeug (Zusammenführen, Teilen, Bearbeiten, Signieren, OCR, Office-Konvertierung usw.)
- Unterstützung für eigenes Branding, alle Build-Time- und Runtime-Konfigurationen

Der Commercial-Build (`ghcr.io/alam00000/bentopdf:latest`) betreibt bentopdf.com selbst und wird von Inhabern einer kommerziellen Lizenz für öffentlich zugängliche Bereitstellungen verwendet. Er ergänzt Hero, FAQ, Testimonials und Footer, die bei einem internen Werkzeug keinen Sinn ergeben würden.

Wenn Sie BentoPDF für Ihr Team, Ihre Organisation oder als internes Werkzeug selbst hosten, ziehen Sie den Self-Hosted-Build:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Alle Details finden Sie in [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md).

### Commercial-Build (öffentlich zugängliche Bereitstellungen mit eigener Marke)

Der Commercial-Build (das Image `bentopdf`, ohne Suffix `-simple`) betreibt bentopdf.com selbst. Er enthält die vollständige Marketing-Website (Hero, Funktionen, FAQ, Testimonials, Footer) zusätzlich zu jedem PDF-Werkzeug. Verwenden Sie diesen Build, wenn Sie **BentoPDF als öffentlich zugänglichen PDF-Dienst unter Ihrer eigenen Marke bereitstellen** möchten, zum Beispiel:

- Sie betreiben BentoPDF als gehostetes SaaS für Endnutzende auf Ihrer eigenen Domain
- Sie möchten das Landingpage-Erlebnis (Marketing-Bereiche + Werkzeuge), nicht nur die reine Werkzeugoberfläche
- Sie sind Inhaber einer kommerziellen Lizenz und betten BentoPDF in ein kommerzielles Produkt ein

**Unverändert ausführen** (mit BentoPDF-Branding, nützlich, um den Build auszuprobieren):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Mit eigener Marke bauen** (der typische kommerzielle Workflow):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Alle anderen Build-Time-Optionen (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, WASM-URL-Überschreibungen usw.) funktionieren genauso wie beim Self-Hosted-Build.

::: warning Lizenzierung
Der Commercial-Build darf unter einer der beiden Lizenzoptionen von BentoPDF betrieben werden:

- **AGPL-3.0** (kostenlos): erlaubt, wenn Ihre Bereitstellung ihren vollständigen Quellcode unter der AGPL veröffentlicht, einschließlich aller Branding-Änderungen und der umgebenden Geschäftslogik.
- **Kommerzielle Lizenz** (79 $ lebenslang): erforderlich für Closed-Source-/proprietäre Bereitstellungen, bei denen Sie Ihren Branding-Fork oder Ihren Geschäftscode nicht als Open Source veröffentlichen.

Den vollständigen Vergleich finden Sie auf der [Lizenzierungsseite](https://www.bentopdf.com/licensing). AGPL-lizenzierte WASM-Module (PyMuPDF, Ghostscript, CoherentPDF) werden zur Laufzeit von einem CDN geladen, gelangen also nicht in Ihr Image und ändern nichts an Ihrer Lizenzlage.
:::

### Base-URL

In einem Unterverzeichnis bereitstellen:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Eigenes Branding

Ersetzen Sie das Standard-Logo, den Namen und den Footer-Text von BentoPDF zur Build-Zeit durch Ihre eigenen:

| Variable           | Beschreibung                    | Standard                                |
| ------------------ | ------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Markenname in Header und Footer | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Logopfad relativ zu `public/`   | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Eigener Footer-/Copyright-Text  | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Oder über Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Das Branding funktioniert sowohl im vollständigen Modus als auch im Simple Mode und lässt sich mit allen anderen Build-Time-Optionen kombinieren (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Bestimmte Werkzeuge deaktivieren

Blenden Sie einzelne Werkzeuge aus Compliance- oder Sicherheitsgründen aus. Deaktivierte Werkzeuge werden auf der Startseite, in der Suche, in den Tastenkürzeln, im Workflow-Builder und beim direkten URL-Zugriff entfernt.

Werkzeug-IDs entsprechen der Seiten-URL ohne `.html`: Öffnen Sie ein beliebiges Werkzeug und sehen Sie sich die URL an (z. B. `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Build-Time** (in das Bundle eingebaut):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Runtime** (ohne Neubau: eine `config.json` einbinden):

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

Beide Methoden lassen sich kombinieren, die Listen werden zusammengeführt.

Sie können außerdem einzelne Funktionen im PDF-Editor (z. B. Schwärzen) deaktivieren, ohne das gesamte Werkzeug zu deaktivieren, indem Sie `editorDisabledCategories` zur `config.json` hinzufügen. Die vollständige Liste der Kategorien finden Sie im [Docker-Leitfaden](/de/self-hosting/docker#editor-funktionen-deaktivieren).

## Bereitstellungsleitfäden

Wählen Sie Ihre Plattform:

- [Vercel](/de/self-hosting/vercel)
- [Netlify](/de/self-hosting/netlify)
- [Cloudflare Pages](/de/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/de/self-hosting/aws)
- [Hostinger](/de/self-hosting/hostinger)
- [Nginx](/de/self-hosting/nginx)
- [Apache](/de/self-hosting/apache)
- [Docker](/de/self-hosting/docker)
- [Kubernetes](/de/self-hosting/kubernetes)
- [CORS-Proxy](/de/self-hosting/cors-proxy) - Erforderlich für digitale Signaturen

## Häufige Probleme

### Word / ODT / Excel / PowerPoint zu PDF hängt (SharedArrayBuffer nicht verfügbar)

**Symptom**: LibreOffice-basierte Dokumentkonvertierungen (Word, ODT, Excel, PowerPoint zu PDF) hängen bei ca. 55 % oder starten nicht. Die Browserkonsole zeigt möglicherweise:

> `ReferenceError: SharedArrayBuffer is not defined`

…oder `window.crossOriginIsolated` meldet `false`, oder die WASM-Kompilierung meldet `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Ursache**: LibreOffice-WASM benötigt `SharedArrayBuffer`, das der Browser nur aktiviert, wenn die Seite **Cross-Origin-isoliert** ist UND aus einem **sicheren Kontext** ausgeliefert wird. Dafür müssen zwei Dinge zutreffen:

1. Jede Antwort enthält beide Header:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. Die Seite wird über `https://...` oder `http://localhost` ausgeliefert. Reines HTTP auf einer LAN-IP (z. B. `http://192.168.x.x`) zählt NICHT als sicher, dort deaktivieren Browser `SharedArrayBuffer`.

Die Abweichung `00 61 73 6d / 1f 8b 08 08` ist ein separates Teilsymptom: Den vorkomprimierten Dateien `.wasm.gz` / `.data.gz` fehlt der Response-Header `Content-Encoding: gzip`, sodass der Browser rohe gzip-Bytes statt dekomprimiertem WASM erhält.

**Lösung**: Die genaue Konfiguration finden Sie im Bereitstellungsleitfaden Ihrer Plattform:

- [Nginx →](/de/self-hosting/nginx#signieren-oder-formularausfullung-zeigt-einen-leeren-viewer-mjs-mime-fehler)
- [Apache →](/de/self-hosting/apache#signieren-oder-formularausfullung-zeigt-einen-leeren-viewer-mjs-mime-fehler)
- [AWS S3 + CloudFront →](/de/self-hosting/aws#schritt-3b-response-headers-policy-erforderlich-fur-libreoffice-wasm)
- [Cloudflare Pages →](/de/self-hosting/cloudflare#konfigurationsdatei) (`_headers`-Datei)
- [Netlify →](/de/self-hosting/netlify#word-odt-excel-zu-pdf-bleibt-bei-55-hangen) (`netlify.toml`)
- [Vercel →](/de/self-hosting/vercel#word-odt-excel-zu-pdf-funktioniert-nicht) (`vercel.json`)
- [Hostinger →](/de/self-hosting/hostinger#libreoffice-werkzeuge-funktionieren-nicht) (`.htaccess`)
- [Kubernetes →](/de/self-hosting/kubernetes#mjs-mime-type-fehler-pdf-unterschreiben-pdf-formular-ausfullen-leerer-iframe)
- **Docker**: wird von der mitgelieferten Nginx-Konfiguration automatisch erledigt, keine Aktion nötig.

**Überprüfen**: Öffnen Sie auf einer beliebigen BentoPDF-Seite die DevTools-Konsole und führen Sie aus:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Wenn die Seite über HTTPS oder `http://localhost` läuft UND beide COEP/COOP-Header in jeder Antwort vorhanden sind, bestehen beide Prüfungen. Wenn Sie auf `http://192.168.x.x` oder einem anderen nicht-Loopback-HTTP-Ursprung sind, beenden Sie die Verbindung mit HTTPS. Es gibt keine Lösung allein über Header.

### `.mjs`-Dateien werden als `application/octet-stream` ausgeliefert

**Symptom**: PDF unterschreiben / PDF-Formular ausfüllen / bestimmte andere Werkzeuge zeigen einen leeren Viewer oder laden nicht. Die Browserkonsole meldet:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Ursache**: Ihr Webserver oder Reverse-Proxy hat keine MIME-Type-Zuordnung für `.mjs`-Dateien (der mitgelieferte PDF-Viewer enthält ES-Module mit dieser Endung). Viele Standard-Serverkonfigurationen verwenden für unbekannte Endungen `application/octet-stream`, was Browser als ES-Module nicht ausführen.

**Lösung**: Den genauen Ausschnitt finden Sie im Bereitstellungsleitfaden Ihrer Plattform:

- [Nginx →](/de/self-hosting/nginx#signieren-oder-formularausfullung-zeigt-einen-leeren-viewer-mjs-mime-fehler)
- [Apache →](/de/self-hosting/apache#signieren-oder-formularausfullung-zeigt-einen-leeren-viewer-mjs-mime-fehler)
- [AWS S3 + CloudFront →](/de/self-hosting/aws#schritt-2-bauen-und-hochladen) (siehe `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/de/self-hosting/kubernetes#mjs-mime-type-fehler-pdf-unterschreiben-pdf-formular-ausfullen-leerer-iframe)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: wird automatisch erledigt, keine Aktion nötig.

**Überprüfen**: Öffnen Sie die DevTools → Tab Network, suchen Sie die fehlgeschlagene `.mjs`-Anfrage und prüfen Sie den Response-Header `Content-Type`. Er sollte `application/javascript` lauten. Wenn er immer noch `application/octet-stream` lautet, bestimmt möglicherweise ein vorgelagerter Reverse-Proxy oder CDN den Typ neu. Prüfen Sie jede Schicht in Ihrer Auslieferungskette.

## WASM-Konfiguration (AGPL-Komponenten)

BentoPDF **bündelt keine** AGPL-lizenzierten Verarbeitungsbibliotheken in seinem Quellcode, **konfiguriert aber CDN-URLs vor**, sodass alle Funktionen sofort funktionieren, ohne manuelle Einrichtung.

::: tip Standardmäßig ohne Konfiguration
Seit v2.0.0 sind WASM-Module so vorkonfiguriert, dass sie über Umgebungsvariablen vom jsDelivr-CDN geladen werden. Alle erweiterten Funktionen funktionieren sofort, ohne Konfiguration durch Nutzende.
:::

| Komponente      | Lizenz   | Funktionen                                                             |
| --------------- | -------- | ---------------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | EPUB-/MOBI-/FB2-/XPS-Konvertierung, Bildextraktion, Tabellenextraktion |
| **Ghostscript** | AGPL-3.0 | PDF/A-Konvertierung, Komprimierung, Begradigung, Rasterung             |
| **CoherentPDF** | AGPL-3.0 | Inhaltsverzeichnis, Anhänge, PDF-Zusammenführung mit Lesezeichen       |

### Standard-Umgebungsvariablen

Diese sind in `.env.production` gesetzt und in den Build eingebaut:

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

### WASM-URLs überschreiben

Sie können die Standardwerte zur Build-Zeit für eigene Bereitstellungen überschreiben:

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

Um ein Modul vollständig zu deaktivieren (manuelle Konfiguration durch Nutzende über die erweiterten Einstellungen erforderlich), setzen Sie seine Variable auf eine leere Zeichenfolge.

Für OCR lassen Sie entweder alle `VITE_TESSERACT_*`-Variablen leer und behalten die standardmäßigen Online-Assets, oder Sie setzen die Worker-/Core-/Sprach-URLs gemeinsam für selbst gehostetes/Offline-OCR. Wenn Sie nur bestimmte OCR-Sprachen bündeln, setzen Sie `VITE_TESSERACT_AVAILABLE_LANGUAGES` ebenfalls auf dieselben kommagetrennten Codes, damit die Oberfläche nur installierte Sprachen anbietet und nicht unterstützte Auswahlen mit einer aussagekräftigen Fehlermeldung fehlschlagen. Für eine vollständig offline erzeugte durchsuchbare PDF-Ausgabe setzen Sie außerdem `VITE_OCR_FONT_BASE_URL` auf das interne Verzeichnis, das die mitgelieferten OCR-Schriftarten bereitstellt.

Nutzende können diese Standardwerte jederzeit über die **erweiterten Einstellungen** in der Oberfläche überschreiben. Im Browser gespeicherte Überschreibungen haben Vorrang vor den Standardwerten der Umgebung.

### Air-Gapped- / Offline-Bereitstellung

Für Netzwerke ohne Internetzugang (Behörden, Gesundheitswesen, Finanzwesen usw.). Die WASM-URLs sind zur **Build-Zeit** in das JavaScript eingebaut, die eigentlichen WASM-Dateien werden zur Laufzeit vom **Browser der Nutzenden** heruntergeladen. Sie müssen also alles auf einem Rechner mit Internetzugang vorbereiten und dann in das isolierte Netzwerk übertragen.

#### Automatisiertes Skript (empfohlen)

Das mitgelieferte Skript `prepare-airgap.sh` automatisiert den gesamten Ablauf: Es lädt die WASM-Pakete herunter, baut das Docker-Image und erzeugt ein in sich geschlossenes Bundle mit einem Setup-Skript.

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

Dies erzeugt ein Bundle-Verzeichnis:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Übertragen Sie das Bundle per USB, internem Artefakt-Repository oder auf einem anderen genehmigten Weg in das Air-Gapped-Netzwerk. Führen Sie dann das mitgelieferte Setup-Skript aus:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Das Setup-Skript lädt das Docker-Image, entpackt die WASM-Dateien und startet optional den Container.

**Skriptoptionen:**

| Flag                           | Beschreibung                                                  | Standard                                    |
| ------------------------------ | ------------------------------------------------------------- | ------------------------------------------- |
| `--wasm-base-url <url>`        | Wo die WASMs intern gehostet werden                           | _(erforderlich, wird bei Fehlen abgefragt)_ |
| `--image-name <name>`          | Docker-Image-Tag                                              | `bentopdf`                                  |
| `--output-dir <path>`          | Ausgabeverzeichnis des Bundles                                | `./bentopdf-airgap-bundle`                  |
| `--simple-mode`                | Simple Mode aktivieren                                        | aus                                         |
| `--base-url <path>`            | Base-URL des Unterverzeichnisses (z. B. `/pdf/`)              | `/`                                         |
| `--language <code>`            | Standardsprache der Oberfläche (z. B. `fr`, `de`)             | _(keine)_                                   |
| `--brand-name <name>`          | Eigener Markenname                                            | _(keine)_                                   |
| `--brand-logo <path>`          | Logopfad relativ zu `public/`                                 | _(keine)_                                   |
| `--footer-text <text>`         | Eigener Footer-Text                                           | _(keine)_                                   |
| `--ocr-languages <list>`       | Kommagetrennte OCR-Sprachen zum Bündeln                       | `eng`                                       |
| `--list-ocr-languages`         | Unterstützte OCR-Codes und Namen ausgeben, dann beenden       | aus                                         |
| `--search-ocr-language <term>` | OCR-Codes nach Name oder Abkürzung suchen                     | aus                                         |
| `--dockerfile <path>`          | Zu verwendendes Dockerfile                                    | `Dockerfile`                                |
| `--skip-docker`                | Docker-Build und -Export überspringen                         | aus                                         |
| `--skip-wasm`                  | WASM-Download überspringen (vorhandene `.tgz`-Dateien nutzen) | aus                                         |

Die interaktive Abfrage akzeptiert außerdem `list`, um die vollständige Liste der unterstützten Tesseract-Codes auszugeben, und `search <term>`, um Treffer wie `search german` oder `search chi` zu finden.

::: warning Same-Origin-Anforderung
WASM-Dateien müssen vom **selben Ursprung** wie die BentoPDF-App ausgeliefert werden. Web Worker verwenden `importScripts()`, das keine Skripte von anderen Ursprüngen laden kann. Wenn BentoPDF beispielsweise unter `https://internal.example.com` läuft, sollte auch die WASM-Basis-URL `https://internal.example.com/wasm` lauten.
:::

#### Manuelle Schritte

<details>
<summary>Wenn Sie es lieber manuell ohne das Skript machen</summary>

**Schritt 1: WASM- und OCR-Pakete herunterladen** (auf einem Rechner mit Internetzugang)

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

**Schritt 2: Das Docker-Image mit internen URLs bauen**

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

**Schritt 3: Das Docker-Image exportieren**

```bash
docker save bentopdf -o bentopdf.tar
```

**Schritt 4: In das Air-Gapped-Netzwerk übertragen**

Kopieren Sie per USB, internem Artefakt-Repository oder einem genehmigten Übertragungsweg:

- `bentopdf.tar`: das Docker-Image
- Die fünf `.tgz`-WASM-/OCR-Pakete aus Schritt 1
- Das Verzeichnis `tesseract-langdata/` aus Schritt 1
- Das Verzeichnis `ocr-fonts/` aus Schritt 1

**Schritt 5: Im Air-Gapped-Netzwerk einrichten**

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

Stellen Sie sicher, dass die Dateien unter den in Schritt 2 konfigurierten URLs erreichbar sind, einschließlich `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` und `.../ocr/fonts`.

</details>

::: info Aus dem Quellcode statt mit Docker bauen?
Setzen Sie die Variablen in `.env.production`, bevor Sie `npm run build` ausführen:

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

### Einen eigenen WASM-Proxy hosten

Wenn Sie AGPL-WASM-Dateien mit passenden CORS-Headern ausliefern müssen, können Sie einen einfachen Proxy bereitstellen. Eine Beispielimplementierung finden Sie im [Cloudflare-WASM-Proxy-Leitfaden](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md).

::: tip Warum getrennt?
Diese Trennung sorgt für:

- Klare rechtliche Konformität für kommerzielle Nutzende
- Den Kern von BentoPDF unter seiner Dual-Lizenz (AGPL-3.0 / Commercial)
- WASM-Dateien, die zur Laufzeit geladen und nicht im Quellcode gebündelt werden
  :::

## Systemanforderungen

| Anforderung | Minimum                            |
| ----------- | ---------------------------------- |
| Speicher    | ca. 100 MB (Kern ohne AGPL-Module) |
| RAM         | 512 MB                             |
| CPU         | Jeder moderne Prozessor            |

::: tip
BentoPDF ist eine statische Website, es werden keine Datenbank und kein Backend-Server benötigt!
:::
