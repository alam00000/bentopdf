# Zelf hosten

BentoPDF kun je op je eigen infrastructuur zelf hosten. Deze gids behandelt verschillende implementatiemogelijkheden.

## Snel aan de slag met Docker / Podman

De snelste manier om BentoPDF zelf te hosten:

> [!TIP]
> BentoPDF wordt in twee builds geleverd:
>
> - **Self-Hosted build**: `ghcr.io/alam00000/bentopdf-simple:latest`. Alle PDF-tools, **zonder** de marketingelementen (geen hero, FAQ, testimonials, footer). Gebruik dit voor interne implementaties voor teams of organisaties. Het is **geen** versie met minder functies of een "lite"-versie.
> - **Commercial build**: `ghcr.io/alam00000/bentopdf:latest`. De volledige marketingsite, gebruikt door bentopdf.com zelf en door commerciële licentiehouders met openbare implementaties.
>
> Twijfel je? Haal dan de Self-Hosted build op.

> [!IMPORTANT]
> Voor het converteren van Office-bestanden is `SharedArrayBuffer` nodig. De app moet daarvoor zowel cross-origin geïsoleerd zijn als vanuit een veilige context worden aangeboden. De officiële image stuurt de vereiste COOP/COEP-headers al mee, maar browsers schakelen `SharedArrayBuffer` nog steeds uit op gewone HTTP-origins in een lokaal netwerk, zoals `http://192.168.x.x`.
>
> Gebruik `http://localhost` alleen voor tests op hetzelfde apparaat. Als gebruikers BentoPDF via een LAN-IP of hostnaam openen, zorg dan voor HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Of met Docker Compose / Podman Compose:

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

Draai BentoPDF als systemd-service. Maak `~/.config/containers/systemd/bentopdf.container` aan:

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

Zie de [Docker-implementatiegids](/nl/self-hosting/docker) voor de volledige Quadlet-documentatie.

## Bouwen vanuit de broncode

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Configuratieopties

### Self-Hosted build (Simple Mode)

De Self-Hosted build (de `bentopdf-simple` image, ook wel Simple Mode genoemd) is **functioneel identiek** aan de Commercial build: alle PDF-tools zijn aanwezig en werken hetzelfde. Hij verbergt alleen de marketingelementen die uitsluitend zinvol zijn op bentopdf.com zelf of bij een commerciële, openbare implementatie. **Het is geen versie met minder functies of een "lite"-versie.**

**Wat de Self-Hosted build verbergt** (alleen cosmetisch, er worden geen PDF-functies verwijderd):

- Navigatiebalk, hero-sectie, functiesectie, FAQ, testimonials, footer
- Wijzigt de paginatitel in "PDF-tools"

**Wat de Self-Hosted build behoudt** (alles wat daadwerkelijk PDF-werk doet):

- Alle PDF-tools (samenvoegen, splitsen, bewerken, ondertekenen, OCR, Office-conversie, enz.)
- Ondersteuning voor eigen huisstijl, alle configuratie tijdens het bouwen en tijdens runtime

De Commercial build (`ghcr.io/alam00000/bentopdf:latest`) is wat bentopdf.com zelf draait en wordt gebruikt door commerciële licentiehouders met openbare implementaties. Hij voegt de hero, FAQ, testimonials en footer toe die op een interne tool niet zinvol zouden zijn.

Host je BentoPDF zelf voor je team, organisatie of als interne tool, haal dan de Self-Hosted build op:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Zie [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) voor alle details.

### Commercial build (openbare implementaties met je eigen merk)

De Commercial build (de `bentopdf` image, zonder het achtervoegsel `-simple`) is wat bentopdf.com zelf draait. Hij bevat de volledige marketingsite (hero, functies, FAQ, testimonials, footer) bovenop alle PDF-tools. Gebruik deze build als je **BentoPDF wilt implementeren als openbare PDF-dienst onder je eigen merk**, bijvoorbeeld:

- Je draait BentoPDF als gehoste SaaS voor eindgebruikers op je eigen domein
- Je wilt de ervaring van de landingspagina (marketingsecties plus tools), niet alleen de kale toolomgeving
- Je bent commercieel licentiehouder en verwerkt BentoPDF in een commercieel product

**Draai hem ongewijzigd** (met BentoPDF-huisstijl, handig om de build te bekijken):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Bouw met je eigen merk** (de gebruikelijke commerciële werkwijze):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Elke andere buildoptie (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, WASM-URL-overschrijvingen, enz.) werkt op dezelfde manier als bij de Self-Hosted build.

::: warning Licenties
De Commercial build draaien is toegestaan onder een van de twee licentieopties van BentoPDF:

- **AGPL-3.0** (gratis): toegestaan als je implementatie de volledige broncode onder AGPL publiceert, inclusief aanpassingen aan de huisstijl en de omringende bedrijfslogica.
- **Commerciële licentie** ($79 eenmalig): vereist voor closed-source / propriëtaire implementaties waarbij je je huisstijlfork of bedrijfscode niet open source maakt.

Zie de [Licentiepagina](https://www.bentopdf.com/licensing) voor de volledige vergelijking. AGPL-gelicentieerde WASM-modules (PyMuPDF, Ghostscript, CoherentPDF) worden tijdens runtime vanaf een CDN geladen, dus ze komen niet in je image terecht en veranderen je licentiepositie niet.
:::

### Basis-URL

Implementeren in een submap:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Eigen huisstijl

Vervang tijdens het bouwen het standaard BentoPDF-logo, de naam en de voettekst door je eigen:

| Variabele          | Beschrijving                                | Standaard                               |
| ------------------ | ------------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Merknaam in de header en footer             | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Logopad relatief ten opzichte van `public/` | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Eigen footer-/copyrighttekst                | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Of via Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Eigen huisstijl werkt in zowel de volledige modus als Simple Mode en kan worden gecombineerd met alle andere buildopties (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Specifieke tools uitschakelen

Verberg afzonderlijke tools voor compliance of beveiliging. Uitgeschakelde tools worden verwijderd van de startpagina, uit zoeken, sneltoetsen, de workflowbouwer en directe URL-toegang.

Tool-ID's zijn de pagina-URL zonder `.html`: open een tool en kijk naar de URL (bijv. `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Tijdens het bouwen** (ingebakken in de bundel):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Tijdens runtime** (geen nieuwe build nodig: koppel een `config.json`):

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

Beide methoden kunnen worden gecombineerd: de lijsten worden samengevoegd.

Je kunt ook specifieke functies in de PDF-editor (bijv. redactie) uitschakelen zonder de hele tool uit te schakelen door `editorDisabledCategories` toe te voegen aan `config.json`. Zie de [Docker-gids](/nl/self-hosting/docker#editorfuncties-uitschakelen) voor de volledige lijst met categorieën.

## Implementatiegidsen

Kies je platform:

- [Vercel](/nl/self-hosting/vercel)
- [Netlify](/nl/self-hosting/netlify)
- [Cloudflare Pages](/nl/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/nl/self-hosting/aws)
- [Hostinger](/nl/self-hosting/hostinger)
- [Nginx](/nl/self-hosting/nginx)
- [Apache](/nl/self-hosting/apache)
- [Docker](/nl/self-hosting/docker)
- [Kubernetes](/nl/self-hosting/kubernetes)
- [CORS Proxy](/nl/self-hosting/cors-proxy) - Vereist voor digitale handtekeningen

## Veelvoorkomende problemen

### Word / ODT / Excel / PowerPoint naar PDF blijft hangen (SharedArrayBuffer niet beschikbaar)

**Symptoom**: Documentconversies op basis van LibreOffice (Word, ODT, Excel, PowerPoint naar PDF) blijven hangen bij ~55% of starten niet. De browserconsole toont mogelijk:

> `ReferenceError: SharedArrayBuffer is not defined`

...of `window.crossOriginIsolated` meldt `false`, of de WASM-compilatie meldt `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Oorzaak**: LibreOffice WASM vereist `SharedArrayBuffer`, dat de browser alleen inschakelt wanneer de pagina **cross-origin geïsoleerd** is EN vanuit een **veilige context** wordt aangeboden. Dat betekent dat twee dingen moeten kloppen:

1. Elke respons bevat beide headers:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. De pagina wordt aangeboden vanaf `https://...` of `http://localhost`. Gewone HTTP op een LAN-IP (bijv. `http://192.168.x.x`) telt NIET als veilig: browsers schakelen `SharedArrayBuffer` daar uit.

Het verschil tussen `00 61 73 6d / 1f 8b 08 08` is een apart subsymptoom: bij de vooraf gecomprimeerde `.wasm.gz` / `.data.gz`-bestanden ontbreekt de responsheader `Content-Encoding: gzip`, waardoor de browser ruwe gzip-bytes ontvangt in plaats van gedecomprimeerde WASM.

**Oplossing**: zie de platformspecifieke implementatiegids voor de exacte configuratie:

- [Nginx →](/nl/self-hosting/nginx#pdf-ondertekenen-of-formulierinvuller-toont-een-lege-viewer-mjs-mime-fout)
- [Apache →](/nl/self-hosting/apache#pdf-ondertekenen-of-formulierinvuller-toont-een-leeg-weergavevenster-mjs-mime-fout)
- [AWS S3 + CloudFront →](/nl/self-hosting/aws#stap-3b-response-headers-policy-vereist-voor-libreoffice-wasm)
- [Cloudflare Pages →](/nl/self-hosting/cloudflare#configuratiebestand) (`_headers`-bestand)
- [Netlify →](/nl/self-hosting/netlify#word-odt-excel-naar-pdf-blijft-hangen-op-55) (`netlify.toml`)
- [Vercel →](/nl/self-hosting/vercel#word-odt-excel-naar-pdf-werkt-niet) (`vercel.json`)
- [Hostinger →](/nl/self-hosting/hostinger#libreoffice-tools-werken-niet) (`.htaccess`)
- [Kubernetes →](/nl/self-hosting/kubernetes#mjs-mime-typefouten-iframe-van-pdf-ondertekenen-pdf-formulier-invullen-leeg)
- **Docker**: wordt automatisch afgehandeld door de meegeleverde nginx-configuratie, geen actie nodig.

**Controleren**: open de DevTools-console op een willekeurige BentoPDF-pagina en voer uit:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Als de pagina HTTPS of `http://localhost` gebruikt EN beide COEP/COOP-headers op elke respons aanwezig zijn, slagen beide controles. Zit je op `http://192.168.x.x` of een andere niet-loopback HTTP-origin, zorg dan voor HTTPS: een oplossing met alleen headers bestaat niet.

### `.mjs`-bestanden geleverd als `application/octet-stream`

**Symptoom**: PDF ondertekenen / PDF-formulier invullen / enkele andere tools tonen een lege viewer of laden niet. De browserconsole meldt:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Oorzaak**: Je webserver of reverse proxy heeft geen MIME-type-koppeling voor `.mjs`-bestanden (de meegeleverde PDF-viewer gebruikt ES-modules met die extensie). Veel standaard serverconfiguraties gebruiken voor onbekende extensies `application/octet-stream`, wat browsers weigeren uit te voeren als ES-modules.

**Oplossing**: zie de platformspecifieke implementatiegids voor het exacte fragment:

- [Nginx →](/nl/self-hosting/nginx#pdf-ondertekenen-of-formulierinvuller-toont-een-lege-viewer-mjs-mime-fout)
- [Apache →](/nl/self-hosting/apache#pdf-ondertekenen-of-formulierinvuller-toont-een-leeg-weergavevenster-mjs-mime-fout)
- [AWS S3 + CloudFront →](/nl/self-hosting/aws#stap-2-bouwen-en-uploaden) (zie `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/nl/self-hosting/kubernetes#mjs-mime-typefouten-iframe-van-pdf-ondertekenen-pdf-formulier-invullen-leeg)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: worden automatisch afgehandeld, geen actie nodig.

**Controleren**: open DevTools → tabblad Netwerk, zoek het mislukte `.mjs`-verzoek en bekijk de responsheader `Content-Type`. Die hoort `application/javascript` te zijn. Is het nog steeds `application/octet-stream`, dan bepaalt een externe reverse proxy of CDN het type mogelijk opnieuw: controleer elke laag in je serveringsketen.

## WASM-configuratie (AGPL-componenten)

BentoPDF **bundelt geen** AGPL-gelicentieerde verwerkingsbibliotheken in de broncode, maar **stelt CDN-URL's vooraf in** zodat alle functies direct werken, zonder handmatige configuratie.

::: tip Standaard zonder configuratie
Sinds v2.0.0 zijn WASM-modules via omgevingsvariabelen vooraf ingesteld om vanaf de jsDelivr CDN te laden. Alle geavanceerde functies werken direct zonder configuratie door de gebruiker.
:::

| Component       | Licentie | Functies                                                          |
| --------------- | -------- | ----------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | EPUB/MOBI/FB2/XPS-conversie, afbeeldingsextractie, tabelextractie |
| **Ghostscript** | AGPL-3.0 | PDF/A-conversie, compressie, rechtzetten, rasteren                |
| **CoherentPDF** | AGPL-3.0 | Inhoudsopgave, bijlagen, PDF samenvoegen met bladwijzers          |

### Standaard omgevingsvariabelen

Deze staan in `.env.production` en worden in de build ingebakken:

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

### WASM-URL's overschrijven

Je kunt de standaardwaarden tijdens het bouwen overschrijven voor aangepaste implementaties:

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

Om een module helemaal uit te schakelen (handmatige configuratie door de gebruiker via Geavanceerde instellingen is dan vereist), stel je de variabele in op een lege tekenreeks.

Laat voor OCR alle `VITE_TESSERACT_*`-variabelen leeg en gebruik de standaard online bronnen, of stel de worker-, core- en lang-URL's samen in voor zelf gehoste/offline OCR. Bundel je alleen specifieke OCR-talen, stel dan ook `VITE_TESSERACT_AVAILABLE_LANGUAGES` in op dezelfde kommagescheiden codes, zodat de interface alleen geïnstalleerde talen aanbiedt en niet-ondersteunde selecties mislukken met een duidelijke foutmelding. Stel voor volledig offline doorzoekbare PDF-uitvoer ook `VITE_OCR_FONT_BASE_URL` in op de interne map waarin de meegeleverde OCR-lettertypen worden aangeboden.

Gebruikers kunnen deze standaardwaarden ook op elk moment overschrijven via **Geavanceerde instellingen** in de interface. Overschrijvingen van gebruikers die in de browser zijn opgeslagen, hebben voorrang op de standaardwaarden uit de omgeving.

### Air-gapped / offline implementatie

Voor netwerken zonder internettoegang (overheid, zorg, financiële sector, enz.). De WASM-URL's worden tijdens het **bouwen** in de JavaScript ingebakken: de eigenlijke WASM-bestanden worden tijdens runtime door de **browser van de gebruiker** gedownload. Je moet dus alles voorbereiden op een machine met internet en het daarna overbrengen naar het geïsoleerde netwerk.

#### Geautomatiseerd script (aanbevolen)

Het meegeleverde script `prepare-airgap.sh` automatiseert het hele proces: het downloadt WASM-pakketten, bouwt de Docker-image en maakt een zelfstandige bundel met een installatiescript.

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

Dit levert een bundelmap op:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Breng de bundel via USB, een interne artefactrepository of een goedgekeurde methode over naar het air-gapped netwerk. Voer daarna het meegeleverde installatiescript uit:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Het installatiescript laadt de Docker-image, pakt de WASM-bestanden uit en start optioneel de container.

**Scriptopties:**

| Vlag                           | Beschrijving                                                      | Standaard                                         |
| ------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------- |
| `--wasm-base-url <url>`        | Waar de WASM's intern worden gehost                               | _(vereist, wordt gevraagd indien niet opgegeven)_ |
| `--image-name <name>`          | Docker-imagetag                                                   | `bentopdf`                                        |
| `--output-dir <path>`          | Uitvoermap voor de bundel                                         | `./bentopdf-airgap-bundle`                        |
| `--simple-mode`                | Simple Mode inschakelen                                           | uit                                               |
| `--base-url <path>`            | Basis-URL van submap (bijv. `/pdf/`)                              | `/`                                               |
| `--language <code>`            | Standaardtaal van de interface (bijv. `fr`, `de`)                 | _(geen)_                                          |
| `--brand-name <name>`          | Eigen merknaam                                                    | _(geen)_                                          |
| `--brand-logo <path>`          | Logopad relatief ten opzichte van `public/`                       | _(geen)_                                          |
| `--footer-text <text>`         | Eigen voettekst                                                   | _(geen)_                                          |
| `--ocr-languages <list>`       | Kommagescheiden OCR-talen om te bundelen                          | `eng`                                             |
| `--list-ocr-languages`         | Toon ondersteunde OCR-codes en namen en stop                      | uit                                               |
| `--search-ocr-language <term>` | Zoek OCR-codes op naam of afkorting                               | uit                                               |
| `--dockerfile <path>`          | Te gebruiken Dockerfile                                           | `Dockerfile`                                      |
| `--skip-docker`                | Docker-build en export overslaan                                  | uit                                               |
| `--skip-wasm`                  | WASM-download overslaan (bestaande `.tgz`-bestanden hergebruiken) | uit                                               |

De interactieve prompt accepteert ook `list` om de volledige lijst met ondersteunde Tesseract-codes te tonen en `search <term>` om resultaten te vinden, zoals `search german` of `search chi`.

::: warning Vereiste van dezelfde origin
WASM-bestanden moeten worden aangeboden vanaf dezelfde **origin** als de BentoPDF-app. Web Workers gebruiken `importScripts()`, dat geen scripts cross-origin kan laden. Draait BentoPDF bijvoorbeeld op `https://internal.example.com`, dan moet de WASM-basis-URL ook `https://internal.example.com/wasm` zijn.
:::

#### Handmatige stappen

<details>
<summary>Als je het liever handmatig doet, zonder het script</summary>

**Stap 1: Download de WASM- en OCR-pakketten** (op een machine met internet)

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

**Stap 2: Bouw de Docker-image met interne URL's**

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

**Stap 3: Exporteer de Docker-image**

```bash
docker save bentopdf -o bentopdf.tar
```

**Stap 4: Breng alles over naar het air-gapped netwerk**

Kopieer via USB, een interne artefactrepository of een goedgekeurde overdrachtsmethode:

- `bentopdf.tar`: de Docker-image
- De vijf `.tgz` WASM-/OCR-pakketten uit stap 1
- De map `tesseract-langdata/` uit stap 1
- De map `ocr-fonts/` uit stap 1

**Stap 5: Installeer binnen het air-gapped netwerk**

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

Zorg dat de bestanden bereikbaar zijn op de URL's die je in stap 2 hebt ingesteld, waaronder `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` en `.../ocr/fonts`.

</details>

::: info Bouwen vanuit de broncode in plaats van Docker?
Stel de variabelen in `.env.production` in voordat je `npm run build` uitvoert:

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

### Je eigen WASM-proxy hosten

Als je AGPL-WASM-bestanden met de juiste CORS-headers wilt aanbieden, kun je een eenvoudige proxy implementeren. Zie de [Cloudflare WASM Proxy-gids](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) voor een voorbeeldimplementatie.

::: tip Waarom gescheiden?
Deze scheiding zorgt voor:

- Duidelijke juridische naleving voor commerciële gebruikers
- De kern van BentoPDF blijft onder de dubbele licentie (AGPL-3.0 / Commercieel)
- WASM-bestanden worden tijdens runtime geladen en niet in de broncode gebundeld
  :::

## Systeemvereisten

| Vereiste | Minimum                            |
| -------- | ---------------------------------- |
| Opslag   | ~100 MB (kern zonder AGPL-modules) |
| RAM      | 512 MB                             |
| CPU      | Elke moderne processor             |

::: tip
BentoPDF is een statische site: er is geen database of backendserver nodig!
:::
