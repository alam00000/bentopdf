# Selvhostingsguide

BentoPDF kan selvhostes på din egen infrastruktur. Denne guide gennemgår forskellige deployment-muligheder.

## Hurtig start med Docker / Podman

Den hurtigste måde at selvhoste BentoPDF på:

> [!TIP]
> BentoPDF leveres i to builds:
>
> - **Selvhostet build**: `ghcr.io/alam00000/bentopdf-simple:latest`. Alle PDF-værktøjer, **uden** marketingelementerne (ingen hero, FAQ, udtalelser eller sidefod). Brug denne til interne deployments i teams og organisationer. Den er **ikke** en "lite"-version med færre funktioner.
> - **Kommerciel build**: `ghcr.io/alam00000/bentopdf:latest`. Det fulde marketingsite, brugt af bentopdf.com selv og af kommercielle licensindehavere med offentligt tilgængelige deployments.
>
> Er du i tvivl: Hent det selvhostede build.

> [!IMPORTANT]
> Konvertering af Office-filer kræver `SharedArrayBuffer`, hvilket betyder, at appen både skal være cross-origin-isoleret og serveres fra en sikker kontekst. Det officielle image sender allerede de nødvendige COOP/COEP-headere, men browsere deaktiverer stadig `SharedArrayBuffer` på almindelige HTTP-origins i lokale netværk som `http://192.168.x.x`.
>
> Brug kun `http://localhost` til test på samme enhed. Hvis brugerne tilgår BentoPDF via en LAN-IP eller et værtsnavn, skal du afslutte forbindelsen med HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Eller med Docker Compose / Podman Compose:

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

Kør BentoPDF som en systemd-tjeneste. Opret `~/.config/containers/systemd/bentopdf.container`:

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

Se [Docker-deploymentguiden](/da/self-hosting/docker) for den fulde Quadlet-dokumentation.

## Bygning fra kildekode

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Konfigurationsindstillinger

### Selvhostet build (Simple Mode)

Det selvhostede build (imaget `bentopdf-simple`, også kaldet Simple Mode) er **funktionelt identisk** med det kommercielle build. Alle PDF-værktøjer er til stede og opfører sig på samme måde. Det skjuler blot de marketingelementer, der kun giver mening på bentopdf.com selv eller i en kommerciel, offentligt tilgængelig deployment. **Det er ikke en version med færre funktioner eller en "lite"-version.**

**Hvad det selvhostede build skjuler** (kun kosmetisk, ingen PDF-funktioner fjernes):

- Navigationslinje, hero-sektion, funktionssektion, FAQ, udtalelser, sidefod
- Opdaterer sidens titel til "PDF-værktøjer"

**Hvad det selvhostede build beholder** (alt det, der faktisk arbejder med PDF):

- Alle PDF-værktøjer (flet, opdel, rediger, underskriv, OCR, Office-konvertering osv.)
- Understøttelse af eget brand, al konfiguration ved build og under kørsel

Det kommercielle build (`ghcr.io/alam00000/bentopdf:latest`) driver bentopdf.com selv og bruges af kommercielle licensindehavere med offentligt tilgængelige deployments. Det tilføjer hero, FAQ, udtalelser og sidefod, som ikke ville give mening i et internt værktøj.

Hvis du selvhoster BentoPDF til dit team, din organisation eller som internt værktøj, skal du hente det selvhostede build:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Se [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) for alle detaljer.

### Kommerciel build (offentligt tilgængelige deployments med dit eget brand)

Det kommercielle build (imaget `bentopdf`, uden suffikset `-simple`) driver bentopdf.com selv. Det indeholder det fulde marketingsite (hero, funktioner, FAQ, udtalelser, sidefod) oven på alle PDF-værktøjer. Brug dette build, når du vil **deploye BentoPDF som en offentligt tilgængelig PDF-tjeneste under dit eget brand**, for eksempel:

- Du kører BentoPDF som hostet SaaS for slutbrugere på dit eget domæne
- Du vil have landingsside-oplevelsen (marketingsektioner + værktøjer), ikke kun selve værktøjsfladen
- Du er kommerciel licensindehaver og indlejrer BentoPDF i et kommercielt produkt

**Kør det som det er** (BentoPDF-branding, nyttigt til at få vist buildet):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Byg med dit eget brand** (den typiske kommercielle arbejdsgang):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Alle andre build-indstillinger (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, WASM-URL-overstyringer osv.) virker på samme måde som i det selvhostede build.

::: warning Licensering
Det er tilladt at køre det kommercielle build under begge af BentoPDF's to licensmuligheder:

- **AGPL-3.0** (gratis): tilladt, hvis din deployment udgiver hele sin kildekode under AGPL, inklusive eventuelle branding-ændringer og omkringliggende forretningslogik.
- **Kommerciel licens** ($79 livstid): påkrævet til lukkede/proprietære deployments, hvor du ikke gør din branding-fork eller forretningskode open source.

Se [licenssiden](https://www.bentopdf.com/licensing) for den fulde sammenligning. AGPL-licenserede WASM-moduler (PyMuPDF, Ghostscript, CoherentPDF) indlæses fra et CDN under kørsel, så de indgår ikke i dit image og ændrer ikke din licensmæssige stilling.
:::

### Base-URL

Deploy til en undermappe:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Eget brand

Erstat BentoPDF's standardlogo, -navn og sidefodstekst med dine egne ved build:

| Variabel           | Beskrivelse                               | Standard                                |
| ------------------ | ----------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Brandnavn vist i sidehoved og sidefod     | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Logosti relativt til `public/`            | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Brugerdefineret sidefods-/ophavsretstekst | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Eller via Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Branding virker i både fuld tilstand og Simple Mode og kan kombineres med alle andre build-indstillinger (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Deaktivering af bestemte værktøjer

Skjul enkelte værktøjer af hensyn til compliance eller sikkerhed. Deaktiverede værktøjer fjernes fra startsiden, søgning, genveje, workflow-builderen og direkte URL-adgang.

Værktøjs-id'er er sidens URL uden `.html`. Åbn et værktøj, og se på URL'en (f.eks. `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Ved build** (indbygget i bundlen):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Under kørsel** (ingen genopbygning nødvendig, montér en `config.json`):

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

Begge metoder kan kombineres, og listerne bliver slået sammen.

Du kan også deaktivere bestemte funktioner i PDF-editoren (f.eks. redigering af indhold) uden at deaktivere hele værktøjet ved at tilføje `editorDisabledCategories` til `config.json`. Se [Docker-guiden](/da/self-hosting/docker#deaktivering-af-editorfunktioner) for den fulde liste over kategorier.

## Deployment-guider

Vælg din platform:

- [Vercel](/da/self-hosting/vercel)
- [Netlify](/da/self-hosting/netlify)
- [Cloudflare Pages](/da/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/da/self-hosting/aws)
- [Hostinger](/da/self-hosting/hostinger)
- [Nginx](/da/self-hosting/nginx)
- [Apache](/da/self-hosting/apache)
- [Docker](/da/self-hosting/docker)
- [Kubernetes](/da/self-hosting/kubernetes)
- [CORS-proxy](/da/self-hosting/cors-proxy) - Påkrævet til digitale signaturer

## Almindelige problemer

### Word / ODT / Excel / PowerPoint til PDF hænger (SharedArrayBuffer utilgængelig)

**Symptom**: LibreOffice-baserede dokumentkonverteringer (Word, ODT, Excel, PowerPoint til PDF) hænger ved ca. 55 % eller starter ikke. Browserens konsol kan vise:

> `ReferenceError: SharedArrayBuffer is not defined`

…eller `window.crossOriginIsolated` rapporterer `false`, eller WASM-kompileringen rapporterer `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Årsag**: LibreOffice WASM kræver `SharedArrayBuffer`, som browseren kun aktiverer, når siden er **cross-origin-isoleret** OG serveres fra en **sikker kontekst**. Det betyder, at to ting skal være opfyldt:

1. Hvert svar indeholder begge headere:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. Siden serveres fra `https://...` eller `http://localhost`. Almindelig HTTP på en LAN-IP (f.eks. `http://192.168.x.x`) tæller IKKE som sikker, og browsere deaktiverer `SharedArrayBuffer` dér.

Uoverensstemmelsen `00 61 73 6d / 1f 8b 08 08` er et separat undersymptom: De forkomprimerede `.wasm.gz`- / `.data.gz`-filer mangler svarheaderen `Content-Encoding: gzip`, så browseren modtager rå gzip-bytes i stedet for dekomprimeret WASM.

**Løsning**: Se din platformspecifikke deployment-guide for den præcise konfiguration:

- [Nginx →](/da/self-hosting/nginx#underskriv-pdf-eller-formularudfylder-viser-en-tom-læser-mjs-mime-fejl)
- [Apache →](/da/self-hosting/apache#underskriv-pdf-eller-formularudfylder-viser-en-tom-viewer-mjs-mime-fejl)
- [AWS S3 + CloudFront →](/da/self-hosting/aws#trin-3b-response-headers-policy-pakrævet-til-libreoffice-wasm)
- [Cloudflare Pages →](/da/self-hosting/cloudflare#konfigurationsfil) (`_headers`-fil)
- [Netlify →](/da/self-hosting/netlify#word-odt-excel-til-pdf-hænger-ved-55) (`netlify.toml`)
- [Vercel →](/da/self-hosting/vercel#word-odt-excel-til-pdf-virker-ikke) (`vercel.json`)
- [Hostinger →](/da/self-hosting/hostinger#libreoffice-værktøjer-virker-ikke) (`.htaccess`)
- [Kubernetes →](/da/self-hosting/kubernetes#mjs-mime-typefejl-underskriv-pdf-formularudfylder-tom-iframe)
- **Docker**: håndteres automatisk af den medfølgende nginx-konfiguration, ingen handling nødvendig.

**Kontrollér**: Åbn DevTools Console på en vilkårlig BentoPDF-side, og kør:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Hvis siden er HTTPS eller `http://localhost` OG begge COEP/COOP-headere findes på hvert svar, består begge kontroller. Hvis du er på `http://192.168.x.x` eller en anden HTTP-origin, der ikke er loopback, skal du afslutte den med HTTPS. Der findes ingen løsning, der kun bruger headere.

### `.mjs`-filer serveres som `application/octet-stream`

**Symptom**: Underskriv PDF / Formularudfylder / visse andre værktøjer viser en tom læser eller kan ikke indlæses. Browserens konsol rapporterer:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Årsag**: Din webserver eller reverse proxy har ingen MIME-type-tilknytning til `.mjs`-filer (den indbyggede PDF-læser leverer ES-moduler med den filendelse). Mange standardkonfigurationer bruger som standard `application/octet-stream` til ukendte filendelser, og browsere nægter at køre dem som ES-moduler.

**Løsning**: Se din platformspecifikke deployment-guide for det præcise udsnit:

- [Nginx →](/da/self-hosting/nginx#underskriv-pdf-eller-formularudfylder-viser-en-tom-læser-mjs-mime-fejl)
- [Apache →](/da/self-hosting/apache#underskriv-pdf-eller-formularudfylder-viser-en-tom-viewer-mjs-mime-fejl)
- [AWS S3 + CloudFront →](/da/self-hosting/aws#trin-2-byg-og-upload) (se `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/da/self-hosting/kubernetes#mjs-mime-typefejl-underskriv-pdf-formularudfylder-tom-iframe)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: håndteres automatisk, ingen handling nødvendig.

**Kontrollér**: Åbn DevTools → fanen Network, find den mislykkede `.mjs`-anmodning, og kontrollér svarheaderen `Content-Type`. Den skal være `application/javascript`. Hvis den stadig er `application/octet-stream`, er det muligt, at en ydre reverse proxy eller et CDN gætter typen igen. Tjek hvert led i din serveringskæde.

## WASM-konfiguration (AGPL-komponenter)

BentoPDF **bundler ikke** AGPL-licenserede behandlingsbiblioteker i sin kildekode, men **forhåndskonfigurerer CDN-URL'er**, så alle funktioner virker ud af boksen, uden manuel opsætning.

::: tip Nul konfiguration som standard
Fra og med v2.0.0 er WASM-moduler forhåndskonfigureret til at blive indlæst fra jsDelivr CDN via miljøvariabler. Alle avancerede funktioner virker med det samme uden brugerkonfiguration.
:::

| Komponent       | Licens   | Funktioner                                                                     |
| --------------- | -------- | ------------------------------------------------------------------------------ |
| **PyMuPDF**     | AGPL-3.0 | EPUB/MOBI/FB2/XPS-konvertering, udtrækning af billeder, udtrækning af tabeller |
| **Ghostscript** | AGPL-3.0 | PDF/A-konvertering, komprimering, udretning af skæve sider, rasterisering      |
| **CoherentPDF** | AGPL-3.0 | Indholdsfortegnelse, vedhæftninger, PDF-sammenfletning med bogmærker           |

### Standardmiljøvariabler

Disse er sat i `.env.production` og indbygget i buildet:

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

### Overstyring af WASM-URL'er

Du kan overstyre standardværdierne ved build til brugerdefinerede deployments:

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

For at deaktivere et modul helt (kræver manuel brugerkonfiguration via Avancerede indstillinger) skal du sætte dets variabel til en tom streng.

Til OCR skal du enten lade alle `VITE_TESSERACT_*`-variabler være tomme og beholde de online standardressourcer, eller angive worker-, core- og lang-URL'erne sammen til selvhostet/offline OCR. Hvis du kun bundler bestemte OCR-sprog, skal du også sætte `VITE_TESSERACT_AVAILABLE_LANGUAGES` til de samme kommaseparerede koder, så brugerfladen kun tilbyder installerede sprog, og ikke-understøttede valg fejler med en beskrivende fejl. Til fuldt offline PDF-output med søgbar tekst skal du desuden sætte `VITE_OCR_FONT_BASE_URL` til den interne mappe, der serverer de bundlede OCR-skrifttyper.

Brugere kan også til enhver tid overstyre disse standardværdier via **Avancerede indstillinger** i brugerfladen. Brugeroverstyringer gemt i browseren har forrang over miljøstandarderne.

### Air-gapped / offline deployment

Til netværk uden internetadgang (offentlig sektor, sundhed, finans osv.). WASM-URL'erne er indbygget i JavaScript ved **build**. De egentlige WASM-filer downloades af **brugerens browser** under kørsel. Du skal derfor forberede alt på en maskine med internet og derefter overføre det til det isolerede netværk.

#### Automatiseret script (anbefalet)

Det medfølgende script `prepare-airgap.sh` automatiserer hele processen: det downloader WASM-pakker, bygger Docker-imaget og producerer en selvstændig bundle med et opsætningsscript.

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

Dette producerer en bundle-mappe:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Overfør bundlen til det air-gappede netværk via USB, internt artefaktlager eller en godkendt metode. Kør derefter det medfølgende opsætningsscript:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Opsætningsscriptet indlæser Docker-imaget, udpakker WASM-filer og starter eventuelt containeren.

**Script-indstillinger:**

| Flag                           | Beskrivelse                                                   | Standard                               |
| ------------------------------ | ------------------------------------------------------------- | -------------------------------------- |
| `--wasm-base-url <url>`        | Hvor WASM-filerne hostes internt                              | _(påkrævet, spørges om, hvis mangler)_ |
| `--image-name <name>`          | Docker image-tag                                              | `bentopdf`                             |
| `--output-dir <path>`          | Output-mappe til bundlen                                      | `./bentopdf-airgap-bundle`             |
| `--simple-mode`                | Aktivér Simple Mode                                           | fra                                    |
| `--base-url <path>`            | Base-URL til undermappe (f.eks. `/pdf/`)                      | `/`                                    |
| `--language <code>`            | Standardsprog i brugerfladen (f.eks. `fr`, `de`)              | _(ingen)_                              |
| `--brand-name <name>`          | Brugerdefineret brandnavn                                     | _(ingen)_                              |
| `--brand-logo <path>`          | Logosti relativt til `public/`                                | _(ingen)_                              |
| `--footer-text <text>`         | Brugerdefineret sidefodstekst                                 | _(ingen)_                              |
| `--ocr-languages <list>`       | Kommasepareret liste over OCR-sprog, der skal bundles         | `eng`                                  |
| `--list-ocr-languages`         | Udskriv understøttede OCR-koder og navne, og afslut           | fra                                    |
| `--search-ocr-language <term>` | Søg efter OCR-koder via navn eller forkortelse                | fra                                    |
| `--dockerfile <path>`          | Dockerfile, der skal bruges                                   | `Dockerfile`                           |
| `--skip-docker`                | Spring Docker-build og eksport over                           | fra                                    |
| `--skip-wasm`                  | Spring WASM-download over (genbrug eksisterende `.tgz`-filer) | fra                                    |

Den interaktive prompt accepterer også `list` for at udskrive den fulde liste over understøttede Tesseract-koder og `search <term>` for at finde match som `search german` eller `search chi`.

::: warning Krav om samme origin
WASM-filer skal serveres fra **samme origin** som BentoPDF-appen. Web Workers bruger `importScripts()`, som ikke kan indlæse scripts på tværs af origins. Hvis BentoPDF for eksempel kører på `https://internal.example.com`, skal WASM-base-URL'en også være `https://internal.example.com/wasm`.
:::

#### Manuelle trin

<details>
<summary>Hvis du foretrækker at gøre det manuelt uden scriptet</summary>

**Trin 1: Download WASM- og OCR-pakkerne** (på en maskine med internet)

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

**Trin 2: Byg Docker-imaget med interne URL'er**

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

**Trin 3: Eksportér Docker-imaget**

```bash
docker save bentopdf -o bentopdf.tar
```

**Trin 4: Overfør til det air-gappede netværk**

Kopiér via USB, internt artefaktlager eller en godkendt overførselsmetode:

- `bentopdf.tar`: Docker-imaget
- De fem `.tgz` WASM/OCR-pakker fra trin 1
- Mappen `tesseract-langdata/` fra trin 1
- Mappen `ocr-fonts/` fra trin 1

**Trin 5: Opsætning inde i det air-gappede netværk**

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

Sørg for, at filerne er tilgængelige på de URL'er, du konfigurerede i trin 2, herunder `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` og `.../ocr/fonts`.

</details>

::: info Bygger du fra kildekode i stedet for Docker?
Sæt variablerne i `.env.production`, før du kører `npm run build`:

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

### Hosting af din egen WASM-proxy

Hvis du skal servere AGPL WASM-filer med korrekte CORS-headere, kan du deploye en simpel proxy. Se [Cloudflare WASM Proxy-guiden](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) for et eksempel på en implementering.

::: tip Hvorfor adskilt?
Denne adskillelse sikrer:

- Klar juridisk compliance for kommercielle brugere
- BentoPDF's kerne forbliver under sin dobbeltlicens (AGPL-3.0 / kommerciel)
- WASM-filer indlæses under kørsel og bundles ikke i kildekoden
  :::

## Systemkrav

| Krav       | Minimum                           |
| ---------- | --------------------------------- |
| Lagerplads | ~100 MB (kerne uden AGPL-moduler) |
| RAM        | 512 MB                            |
| CPU        | Enhver moderne processor          |

::: tip
BentoPDF er et statisk site, så der kræves ingen database eller backend-server!
:::
