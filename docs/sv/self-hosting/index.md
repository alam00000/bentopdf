# Guide för självhosting

BentoPDF kan självhostas på din egen infrastruktur. Den här guiden går igenom olika distributionsalternativ.

## Snabbstart med Docker / Podman

Det snabbaste sättet att självhosta BentoPDF:

> [!TIP]
> BentoPDF levereras i två byggen:
>
> - **Självhostat bygge**: `ghcr.io/alam00000/bentopdf-simple:latest`. Alla PDF-verktyg, **utan** marknadsföringsdelarna (ingen hero, FAQ, omdömen eller sidfot). Använd detta för interna distributioner i team och organisationer. Det är **inte** en funktionsbegränsad "lite"-version.
> - **Kommersiellt bygge**: `ghcr.io/alam00000/bentopdf:latest`. Hela marknadsföringswebbplatsen, som används av bentopdf.com själv och av innehavare av kommersiell licens med publika distributioner.
>
> Om du är osäker: hämta det självhostade bygget.

> [!IMPORTANT]
> Konvertering av Office-filer kräver `SharedArrayBuffer`, vilket innebär att appen måste vara både cross-origin-isolerad och levereras från en säker kontext. Den officiella avbildningen skickar redan de nödvändiga COOP/COEP-huvudena, men webbläsare inaktiverar ändå `SharedArrayBuffer` på vanliga HTTP-ursprung i lokala nätverk, som `http://192.168.x.x`.
>
> Använd `http://localhost` bara för tester på samma enhet. Om användare når BentoPDF via en LAN-IP eller ett värdnamn ska du avsluta anslutningen med HTTPS.

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

Kör BentoPDF som en systemd-tjänst. Skapa `~/.config/containers/systemd/bentopdf.container`:

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

Se [Docker-distributionsguiden](/sv/self-hosting/docker) för fullständig dokumentation om Quadlet.

## Bygga från källkod

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Konfigurationsalternativ

### Självhostat bygge (Simple Mode)

Det självhostade bygget (avbildningen `bentopdf-simple`, även kallat Simple Mode) är **funktionellt identiskt** med det kommersiella bygget: alla PDF-verktyg finns med och beter sig likadant. Det döljer bara marknadsföringsdelarna som bara är rimliga på bentopdf.com självt eller i en kommersiell publik distribution. **Det är inte en funktionsbegränsad eller "lite"-version.**

**Vad det självhostade bygget döljer** (enbart kosmetiskt, inga PDF-funktioner tas bort):

- Navigeringsfält, hero-sektion, funktionssektion, FAQ, omdömen, sidfot
- Uppdaterar sidtiteln till "PDF-verktyg"

**Vad det självhostade bygget behåller** (allt som faktiskt hanterar PDF-arbete):

- Alla PDF-verktyg (slå ihop, dela, redigera, signera, OCR, Office-konvertering m.m.)
- Stöd för eget varumärke, all konfiguration vid bygge och körning

Det kommersiella bygget (`ghcr.io/alam00000/bentopdf:latest`) driver bentopdf.com självt och används av innehavare av kommersiell licens med publika distributioner. Det lägger till hero, FAQ, omdömen och sidfot, som inte vore rimliga i ett internt verktyg.

Om du självhostar BentoPDF för ditt team, din organisation eller som ett internt verktyg hämtar du det självhostade bygget:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Se [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) för fullständig information.

### Kommersiellt bygge (publika distributioner med eget varumärke)

Det kommersiella bygget (avbildningen `bentopdf`, utan suffixet `-simple`) driver bentopdf.com självt. Det innehåller hela marknadsföringswebbplatsen (hero, funktioner, FAQ, omdömen, sidfot) ovanpå alla PDF-verktyg. Använd det här bygget när du vill **distribuera BentoPDF som en publik PDF-tjänst under ditt eget varumärke**, till exempel:

- Du kör BentoPDF som en hostad SaaS för slutanvändare på din egen domän
- Du vill ha upplevelsen med målsida (marknadsföringssektioner + verktyg), inte bara själva verktygsytan
- Du är innehavare av kommersiell licens och bäddar in BentoPDF i en kommersiell produkt

**Kör det som det är** (med BentoPDF-varumärke, användbart för att förhandsgranska bygget):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Bygg med ditt eget varumärke** (det typiska kommersiella arbetsflödet):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Alla andra alternativ vid bygget (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, åsidosättning av WASM-URL:er m.m.) fungerar på samma sätt som i det självhostade bygget.

::: warning Licensiering
Det är tillåtet att köra det kommersiella bygget under något av BentoPDF:s två licensalternativ:

- **AGPL-3.0** (gratis): tillåtet om din distribution publicerar hela sin källkod under AGPL, inklusive varumärkesändringar och omgivande affärslogik.
- **Kommersiell licens** (79 USD engångsavgift): krävs för distributioner med sluten källkod eller proprietära distributioner där du inte öppnar källkoden för din varumärkesfork eller affärskod.

Se [licenssidan](https://www.bentopdf.com/licensing) för en fullständig jämförelse. AGPL-licensierade WASM-moduler (PyMuPDF, Ghostscript, CoherentPDF) laddas från ett CDN vid körning, så de hamnar inte i din avbildning och påverkar inte din licenssituation.
:::

### Bas-URL

Distribuera till en underkatalog:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Eget varumärke

Ersätt BentoPDF:s standardlogotyp, namn och sidfotstext med dina egna vid bygget:

| Variabel           | Beskrivning                                    | Standard                                |
| ------------------ | ---------------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Varumärkesnamn som visas i sidhuvud och sidfot | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Logotypsökväg relativt `public/`               | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Egen sidfots-/upphovsrättstext                 | `© 2026 BentoPDF. All rights reserved.` |

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

Varumärkesanpassning fungerar i både fullt läge och Simple Mode och kan kombineras med alla andra alternativ vid bygget (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Inaktivera specifika verktyg

Dölj enskilda verktyg av efterlevnads- eller säkerhetsskäl. Inaktiverade verktyg tas bort från startsidan, sökningen, genvägarna, arbetsflödesbyggaren och direkt URL-åtkomst.

Verktygs-ID:n är sidans URL utan `.html`: öppna ett verktyg och titta på URL:en (t.ex. `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Vid bygget** (inbakat i paketet):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Vid körning** (ingen ombyggnad behövs, montera en `config.json`):

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

Båda metoderna kan kombineras: listorna slås ihop.

Du kan också inaktivera specifika funktioner i PDF-redigeraren (t.ex. maskering) utan att inaktivera hela verktyget genom att lägga till `editorDisabledCategories` i `config.json`. Se [Docker-guiden](/sv/self-hosting/docker#inaktivera-redigeringsfunktioner) för en fullständig lista över kategorier.

## Distributionsguider

Välj din plattform:

- [Vercel](/sv/self-hosting/vercel)
- [Netlify](/sv/self-hosting/netlify)
- [Cloudflare Pages](/sv/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/sv/self-hosting/aws)
- [Hostinger](/sv/self-hosting/hostinger)
- [Nginx](/sv/self-hosting/nginx)
- [Apache](/sv/self-hosting/apache)
- [Docker](/sv/self-hosting/docker)
- [Kubernetes](/sv/self-hosting/kubernetes)
- [CORS-proxy](/sv/self-hosting/cors-proxy) - Krävs för digitala signaturer

## Vanliga problem

### Word / ODT / Excel / PowerPoint till PDF hänger sig (SharedArrayBuffer otillgängligt)

**Symptom**: LibreOffice-baserade dokumentkonverteringar (Word, ODT, Excel, PowerPoint till PDF) hänger sig vid ca 55 % eller startar inte. Webbläsarkonsolen kan visa:

> `ReferenceError: SharedArrayBuffer is not defined`

…eller så rapporterar `window.crossOriginIsolated` `false`, eller så rapporterar WASM-kompileringen `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Orsak**: LibreOffice WASM kräver `SharedArrayBuffer`, som webbläsaren bara aktiverar när sidan är **cross-origin-isolerad** OCH levereras från en **säker kontext**. Det innebär att två saker måste stämma:

1. Varje svar innehåller båda huvudena:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. Sidan levereras från `https://...` eller `http://localhost`. Vanlig HTTP på en LAN-IP (t.ex. `http://192.168.x.x`) räknas INTE som säker: webbläsare inaktiverar `SharedArrayBuffer` där.

Skillnaden mellan `00 61 73 6d` och `1f 8b 08 08` är ett separat delsymptom: de förkomprimerade filerna `.wasm.gz` / `.data.gz` saknar svarshuvudet `Content-Encoding: gzip`, så webbläsaren får rå gzip-data i stället för uppackad WASM.

**Lösning**: se din plattformsspecifika distributionsguide för exakt konfiguration:

- [Nginx →](/sv/self-hosting/nginx#signera-pdf-eller-formularifyllare-visar-en-tom-lasare-mime-fel-for-mjs)
- [Apache →](/sv/self-hosting/apache#signera-pdf-eller-formularifyllare-visar-en-tom-visare-mjs-mime-fel)
- [AWS S3 + CloudFront →](/sv/self-hosting/aws#steg-3b-response-headers-policy-kravs-for-libreoffice-wasm)
- [Cloudflare Pages →](/sv/self-hosting/cloudflare#konfigurationsfil) (filen `_headers`)
- [Netlify →](/sv/self-hosting/netlify#word-odt-excel-till-pdf-fastnar-pa-55) (`netlify.toml`)
- [Vercel →](/sv/self-hosting/vercel#word-odt-excel-till-pdf-fungerar-inte) (`vercel.json`)
- [Hostinger →](/sv/self-hosting/hostinger#libreoffice-verktyg-fungerar-inte) (`.htaccess`)
- [Kubernetes →](/sv/self-hosting/kubernetes#mime-typfel-for-mjs-tom-iframe-i-signera-pdf-formularifyllare)
- **Docker**: hanteras automatiskt av den medföljande nginx-konfigurationen, ingen åtgärd behövs.

**Verifiera**: öppna DevTools Console på valfri BentoPDF-sida och kör:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Om sidan levereras via HTTPS eller `http://localhost` OCH båda COEP/COOP-huvudena finns på varje svar klarar båda kontrollerna. Om du använder `http://192.168.x.x` eller ett annat HTTP-ursprung som inte är loopback avslutar du anslutningen med HTTPS: det finns ingen lösning enbart med huvuden.

### `.mjs`-filer levereras som `application/octet-stream`

**Symptom**: Signera PDF / Formulärifyllare / vissa andra verktyg visar en tom läsare eller laddas inte. Webbläsarkonsolen rapporterar:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Orsak**: Din webbserver eller omvända proxy saknar en MIME-typsmappning för `.mjs`-filer (den medföljande PDF-läsaren levereras med ES-moduler med den filändelsen). Många standardkonfigurationer av servrar använder `application/octet-stream` för okända filändelser, och webbläsare vägrar köra sådana som ES-moduler.

**Lösning**: se din plattformsspecifika distributionsguide för exakt kodsnutt:

- [Nginx →](/sv/self-hosting/nginx#signera-pdf-eller-formularifyllare-visar-en-tom-lasare-mime-fel-for-mjs)
- [Apache →](/sv/self-hosting/apache#signera-pdf-eller-formularifyllare-visar-en-tom-visare-mjs-mime-fel)
- [AWS S3 + CloudFront →](/sv/self-hosting/aws#steg-2-bygg-och-ladda-upp) (se `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/sv/self-hosting/kubernetes#mime-typfel-for-mjs-tom-iframe-i-signera-pdf-formularifyllare)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: hanteras automatiskt, ingen åtgärd behövs.

**Verifiera**: öppna DevTools → fliken Network, hitta den misslyckade `.mjs`-begäran och kontrollera svarshuvudet `Content-Type`. Det ska vara `application/javascript`. Om det fortfarande är `application/octet-stream` kan en yttre omvänd proxy eller ett CDN avläsa typen på nytt: kontrollera varje lager i din leveranskedja.

## WASM-konfiguration (AGPL-komponenter)

BentoPDF **bundlar inte** AGPL-licensierade bearbetningsbibliotek i sin källkod, men **förkonfigurerar CDN-URL:er** så att alla funktioner fungerar direkt, utan manuell konfiguration.

::: tip Nollkonfiguration som standard
Från och med v2.0.0 är WASM-modulerna förkonfigurerade att laddas från jsDelivr CDN via miljövariabler. Alla avancerade funktioner fungerar direkt utan någon konfiguration från användaren.
:::

| Komponent       | Licens   | Funktioner                                                            |
| --------------- | -------- | --------------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | EPUB/MOBI/FB2/XPS-konvertering, bildextrahering, tabellextrahering    |
| **Ghostscript** | AGPL-3.0 | PDF/A-konvertering, komprimering, rakning av snedskanning, rastrering |
| **CoherentPDF** | AGPL-3.0 | Innehållsförteckning, bilagor, PDF-sammanslagning med bokmärken       |

### Standardmiljövariabler

Dessa är satta i `.env.production` och inbakade i bygget:

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

### Åsidosätta WASM-URL:er

Du kan åsidosätta standardvärdena vid bygget för anpassade distributioner:

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

För att inaktivera en modul helt (kräver manuell konfiguration av användaren i Avancerade inställningar) sätter du dess variabel till en tom sträng.

För OCR låter du antingen alla `VITE_TESSERACT_*`-variabler vara tomma och behåller de förvalda onlinetillgångarna, eller sätter URL:erna för worker, core och språkdata tillsammans för självhostad/offline OCR. Om du bara bundlar specifika OCR-språk sätter du också `VITE_TESSERACT_AVAILABLE_LANGUAGES` till samma kommaseparerade koder så att gränssnittet bara erbjuder installerade språk och ej stödda val ger ett beskrivande fel. För helt offline sökbar PDF-utdata sätter du också `VITE_OCR_FONT_BASE_URL` till den interna katalog som levererar de medföljande OCR-teckensnitten.

Användare kan också när som helst åsidosätta dessa standardvärden via **Avancerade inställningar** i gränssnittet: användarens åsidosättningar som lagras i webbläsaren har företräde framför miljövärdena.

### Distribution utan internet (air-gapped / offline)

För nätverk utan internetåtkomst (myndigheter, sjukvård, finans m.fl.). WASM-URL:erna bakas in i JavaScript vid **bygget**: själva WASM-filerna laddas ner av **användarens webbläsare** vid körning. Du behöver därför förbereda allt på en dator med internet och sedan överföra det till det isolerade nätverket.

#### Automatiskt skript (rekommenderas)

Det medföljande skriptet `prepare-airgap.sh` automatiserar hela processen: det laddar ner WASM-paketen, bygger Docker-avbildningen och skapar ett fristående paket med ett installationsskript.

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

Detta skapar en paketkatalog:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Överför paketet till det isolerade nätverket via USB, internt artefaktarkiv eller någon godkänd metod. Kör sedan det medföljande installationsskriptet:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Installationsskriptet läser in Docker-avbildningen, packar upp WASM-filerna och startar på begäran containern.

**Skriptalternativ:**

| Flagga                         | Beskrivning                                                      | Standard                                    |
| ------------------------------ | ---------------------------------------------------------------- | ------------------------------------------- |
| `--wasm-base-url <url>`        | Var WASM-filerna hostas internt                                  | _(obligatorisk, efterfrågas om den saknas)_ |
| `--image-name <name>`          | Docker-avbildningens tagg                                        | `bentopdf`                                  |
| `--output-dir <path>`          | Utdatakatalog för paketet                                        | `./bentopdf-airgap-bundle`                  |
| `--simple-mode`                | Aktivera Simple Mode                                             | av                                          |
| `--base-url <path>`            | Bas-URL för underkatalog (t.ex. `/pdf/`)                         | `/`                                         |
| `--language <code>`            | Standardspråk för gränssnittet (t.ex. `fr`, `de`)                | _(ingen)_                                   |
| `--brand-name <name>`          | Eget varumärkesnamn                                              | _(ingen)_                                   |
| `--brand-logo <path>`          | Logotypsökväg relativt `public/`                                 | _(ingen)_                                   |
| `--footer-text <text>`         | Egen sidfotstext                                                 | _(ingen)_                                   |
| `--ocr-languages <list>`       | Kommaseparerade OCR-språk att bundla                             | `eng`                                       |
| `--list-ocr-languages`         | Skriv ut stödda OCR-koder och namn, avsluta sedan                | av                                          |
| `--search-ocr-language <term>` | Sök OCR-koder efter namn eller förkortning                       | av                                          |
| `--dockerfile <path>`          | Dockerfile som ska användas                                      | `Dockerfile`                                |
| `--skip-docker`                | Hoppa över Docker-bygge och export                               | av                                          |
| `--skip-wasm`                  | Hoppa över WASM-nedladdning (återanvänd befintliga `.tgz`-filer) | av                                          |

Den interaktiva prompten accepterar också `list` för att skriva ut hela listan över stödda Tesseract-koder och `search <term>` för att hitta träffar som `search german` eller `search chi`.

::: warning Krav på samma ursprung
WASM-filer måste levereras från **samma ursprung** som BentoPDF-appen. Web Workers använder `importScripts()`, som inte kan ladda skript mellan olika ursprung. Om BentoPDF till exempel körs på `https://internal.example.com` bör WASM-bas-URL:en också vara `https://internal.example.com/wasm`.
:::

#### Manuella steg

<details>
<summary>Om du föredrar att göra det manuellt utan skriptet</summary>

**Steg 1: Ladda ner WASM- och OCR-paketen** (på en dator med internet)

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

**Steg 2: Bygg Docker-avbildningen med interna URL:er**

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

**Steg 3: Exportera Docker-avbildningen**

```bash
docker save bentopdf -o bentopdf.tar
```

**Steg 4: Överför till det isolerade nätverket**

Kopiera via USB, internt artefaktarkiv eller annan godkänd överföringsmetod:

- `bentopdf.tar`: Docker-avbildningen
- De fem `.tgz`-paketen för WASM/OCR från steg 1
- Katalogen `tesseract-langdata/` från steg 1
- Katalogen `ocr-fonts/` från steg 1

**Steg 5: Konfigurera inne i det isolerade nätverket**

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

Se till att filerna är åtkomliga på de URL:er som du konfigurerade i steg 2, inklusive `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` och `.../ocr/fonts`.

</details>

::: info Bygger du från källkod i stället för Docker?
Sätt variablerna i `.env.production` innan du kör `npm run build`:

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

### Hosta din egen WASM-proxy

Om du behöver leverera AGPL-WASM-filer med rätt CORS-huvuden kan du distribuera en enkel proxy. Se [guiden för Cloudflare WASM-proxy](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) för ett exempel på implementation.

::: tip Varför separat?
Denna separation säkerställer:

- Tydlig laglig efterlevnad för kommersiella användare
- BentoPDF:s kärna förblir under sin dubbla licens (AGPL-3.0 / kommersiell)
- WASM-filer laddas vid körning och bundlas inte i källkoden
  :::

## Systemkrav

| Krav    | Minimum                           |
| ------- | --------------------------------- |
| Lagring | ~100 MB (kärna utan AGPL-moduler) |
| RAM     | 512 MB                            |
| CPU     | Valfri modern processor           |

::: tip
BentoPDF är en statisk webbplats, så ingen databas eller backend-server behövs!
:::
