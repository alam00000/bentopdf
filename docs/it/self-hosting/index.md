# Guida all'self-hosting

BentoPDF può essere ospitato sulla tua infrastruttura. Questa guida illustra le varie opzioni di deploy.

## Avvio rapido con Docker / Podman

Il modo più rapido per ospitare BentoPDF:

> [!TIP]
> BentoPDF è disponibile in due build:
>
> - **Build Self-Hosted**: `ghcr.io/alam00000/bentopdf-simple:latest`. Tutti gli strumenti PDF, **senza** gli elementi di marketing (niente hero, FAQ, testimonianze, footer). Usala per deploy interni, di team o di organizzazione. **Non** è una versione "lite" con meno funzionalità.
> - **Build Commercial**: `ghcr.io/alam00000/bentopdf:latest`. Il sito di marketing completo, usato da bentopdf.com stesso e dai titolari di licenza commerciale che gestiscono deploy pubblici.
>
> Nel dubbio: scarica la build Self-Hosted.

> [!IMPORTANT]
> La conversione dei file Office richiede `SharedArrayBuffer`, il che significa che l'app deve essere sia isolata cross-origin sia servita da un contesto sicuro. L'immagine ufficiale invia già gli header COOP/COEP necessari, ma i browser disabilitano comunque `SharedArrayBuffer` sulle origini HTTP semplici della rete locale, come `http://192.168.x.x`.
>
> Usa `http://localhost` solo per test sullo stesso dispositivo. Se gli utenti accedono a BentoPDF tramite un IP o un hostname della LAN, termina la connessione con HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Oppure con Docker Compose / Podman Compose:

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

## Podman Quadlet (Linux systemd)

Esegui BentoPDF come servizio systemd. Crea `~/.config/containers/systemd/bentopdf.container`:

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

Consulta la [guida al deploy con Docker](/it/self-hosting/docker) per la documentazione completa di Quadlet.

## Compilazione dal codice sorgente

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Opzioni di configurazione

### Build Self-Hosted (Simple Mode)

La build Self-Hosted (l'immagine `bentopdf-simple`, detta anche Simple Mode) è **funzionalmente identica** alla build Commercial: ogni strumento PDF è presente e si comporta allo stesso modo. Nasconde solo gli elementi di marketing che hanno senso soltanto su bentopdf.com o in un deploy commerciale pubblico. **Non è una versione "lite" con meno funzionalità.**

**Cosa nasconde la build Self-Hosted** (solo aspetto estetico, nessuna funzionalità PDF viene rimossa):

- Barra di navigazione, sezione hero, sezione delle funzionalità, FAQ, testimonianze, footer
- Aggiorna il titolo della pagina in "Strumenti PDF"

**Cosa mantiene la build Self-Hosted** (tutto ciò che lavora davvero sui PDF):

- Ogni strumento PDF (unione, divisione, modifica, firma, OCR, conversione Office, ecc.)
- Supporto al branding personalizzato, tutta la configurazione di build e di runtime

La build Commercial (`ghcr.io/alam00000/bentopdf:latest`) è quella che alimenta bentopdf.com stesso ed è usata dai titolari di licenza commerciale che gestiscono deploy pubblici: aggiunge hero, FAQ, testimonianze e footer che non avrebbero senso in uno strumento interno.

Se ospiti BentoPDF per il tuo team, la tua organizzazione o come strumento interno, scarica la build Self-Hosted:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Consulta [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md) per tutti i dettagli.

### Build Commercial (deploy pubblici con il tuo brand)

La build Commercial (l'immagine `bentopdf`, senza il suffisso `-simple`) è quella che alimenta bentopdf.com stesso. Include il sito di marketing completo (hero, funzionalità, FAQ, testimonianze, footer) oltre a ogni strumento PDF. Usa questa build quando vuoi **distribuire BentoPDF come servizio PDF pubblico con il tuo brand**, ad esempio:

- Gestisci BentoPDF come SaaS ospitato per gli utenti finali sul tuo dominio
- Vuoi l'esperienza della landing page (sezioni di marketing + strumenti), non solo l'interfaccia essenziale degli strumenti
- Sei un titolare di licenza commerciale e integri BentoPDF in un prodotto commerciale

**Eseguila così com'è** (brand BentoPDF, utile per vedere un'anteprima della build):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Compila con il tuo brand** (il tipico flusso commerciale):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Ogni altra opzione di build (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, override degli URL WASM, ecc.) funziona come nella build Self-Hosted.

::: warning Licenze
L'esecuzione della build Commercial è consentita con una qualsiasi delle due opzioni di licenza di BentoPDF:

- **AGPL-3.0** (gratuita): consentita se il tuo deploy pubblica tutto il proprio codice sorgente sotto AGPL, comprese le modifiche al brand e la logica di business circostante.
- **Licenza commerciale** ($79 a vita): necessaria per deploy proprietari o a codice chiuso in cui non rendi open source il tuo fork di branding o il tuo codice di business.

Consulta la [pagina delle licenze](https://www.bentopdf.com/licensing) per il confronto completo. I moduli WASM con licenza AGPL (PyMuPDF, Ghostscript, CoherentPDF) vengono caricati da una CDN a runtime, quindi non entrano nella tua immagine e non cambiano la tua situazione di licenza.
:::

### Base URL

Deploy in una sottodirectory:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Branding personalizzato

Sostituisci il logo, il nome e il testo del footer predefiniti di BentoPDF con i tuoi durante la build:

| Variabile          | Descrizione                                | Predefinito                             |
| ------------------ | ------------------------------------------ | --------------------------------------- |
| `VITE_BRAND_NAME`  | Nome del brand mostrato in header e footer | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Percorso del logo relativo a `public/`     | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Testo personalizzato del footer/copyright  | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Oppure tramite Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Il branding funziona sia in modalità completa sia in Simple Mode e può essere combinato con tutte le altre opzioni di build (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Disabilitare strumenti specifici

Nascondi singoli strumenti per motivi di conformità o sicurezza. Gli strumenti disabilitati vengono rimossi dalla homepage, dalla ricerca, dalle scorciatoie, dal workflow builder e dall'accesso diretto tramite URL.

Gli ID degli strumenti sono l'URL della pagina senza `.html`: apri uno strumento qualsiasi e guarda l'URL (ad es. `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**In fase di build** (incorporata nel bundle):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**A runtime** (nessuna ricompilazione necessaria: monta un `config.json`):

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

I due metodi possono essere combinati: gli elenchi vengono uniti.

Puoi anche disabilitare funzionalità specifiche dell'Editor PDF (ad es. la redazione) senza disabilitare l'intero strumento, aggiungendo `editorDisabledCategories` a `config.json`. Consulta la [guida Docker](/it/self-hosting/docker#disattivare-le-funzionalita-dell-editor) per l'elenco completo delle categorie.

## Guide al deploy

Scegli la tua piattaforma:

- [Vercel](/it/self-hosting/vercel)
- [Netlify](/it/self-hosting/netlify)
- [Cloudflare Pages](/it/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/it/self-hosting/aws)
- [Hostinger](/it/self-hosting/hostinger)
- [Nginx](/it/self-hosting/nginx)
- [Apache](/it/self-hosting/apache)
- [Docker](/it/self-hosting/docker)
- [Kubernetes](/it/self-hosting/kubernetes)
- [CORS Proxy](/it/self-hosting/cors-proxy) - Necessario per le firme digitali

## Problemi comuni

### La conversione da Word / ODT / Excel / PowerPoint a PDF si blocca (SharedArrayBuffer non disponibile)

**Sintomo**: le conversioni di documenti basate su LibreOffice (da Word, ODT, Excel, PowerPoint a PDF) si bloccano intorno al 55% o non partono. La console del browser può mostrare:

> `ReferenceError: SharedArrayBuffer is not defined`

…oppure `window.crossOriginIsolated` restituisce `false`, o la compilazione WASM segnala `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Causa**: LibreOffice WASM richiede `SharedArrayBuffer`, che il browser abilita solo quando la pagina è **isolata cross-origin** E servita da un **contesto sicuro**. Ciò significa che devono valere due condizioni:

1. Ogni risposta include entrambi gli header:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. La pagina è servita da `https://...` o da `http://localhost`. Un semplice HTTP su un IP della LAN (ad es. `http://192.168.x.x`) NON conta come sicuro: i browser disabilitano lì `SharedArrayBuffer`.

La discrepanza `00 61 73 6d / 1f 8b 08 08` è un sotto-sintomo distinto: ai file precompressi `.wasm.gz` / `.data.gz` manca l'header di risposta `Content-Encoding: gzip`, quindi il browser riceve byte gzip grezzi invece di WASM decompresso.

**Soluzione**: consulta la guida al deploy specifica della tua piattaforma per la configurazione esatta:

- [Nginx →](/it/self-hosting/nginx#conversione-da-word-odt-excel-a-pdf-non-funzionante)
- [Apache →](/it/self-hosting/apache#la-conversione-da-word-odt-excel-a-pdf-non-funziona)
- [AWS S3 + CloudFront →](/it/self-hosting/aws#passaggio-3b-policy-degli-header-di-risposta-necessaria-per-libreoffice-wasm)
- [Cloudflare Pages →](/it/self-hosting/cloudflare#file-di-configurazione) (`_headers` file)
- [Netlify →](/it/self-hosting/netlify#conversione-da-word-odt-excel-a-pdf-bloccata-al-55) (`netlify.toml`)
- [Vercel →](/it/self-hosting/vercel#conversione-da-word-odt-excel-a-pdf-non-funzionante) (`vercel.json`)
- [Hostinger →](/it/self-hosting/hostinger#gli-strumenti-libreoffice-non-funzionano) (`.htaccess`)
- [Kubernetes →](/it/self-hosting/kubernetes#verificare-che-gli-header-sharedarraybuffer-funzionino-ancora-ingress-gateway)
- **Docker**: gestito automaticamente dalla configurazione nginx inclusa, nessuna azione necessaria.

**Verifica**: apri la Console di DevTools su una qualsiasi pagina di BentoPDF ed esegui:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Se la pagina è in HTTPS o su `http://localhost` E entrambi gli header COEP/COOP sono presenti in ogni risposta, entrambi i controlli passano. Se sei su `http://192.168.x.x` o su un'altra origine HTTP non di loopback, termina la connessione con HTTPS: non esiste una soluzione basata solo sugli header.

### File `.mjs` serviti come `application/octet-stream`

**Sintomo**: Firma PDF / Compilazione moduli / alcuni altri strumenti mostrano un visualizzatore vuoto o non si caricano. La console del browser segnala:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Causa**: il tuo web server o reverse proxy non ha una mappatura del tipo MIME per i file `.mjs` (il visualizzatore PDF incluso distribuisce ES module con quell'estensione). Molte configurazioni di server predefinite usano `application/octet-stream` per le estensioni non riconosciute, e i browser rifiutano di eseguirlo come ES module.

**Soluzione**: consulta la guida al deploy specifica della tua piattaforma per lo snippet esatto:

- [Nginx →](/it/self-hosting/nginx#firma-pdf-o-compilazione-moduli-mostra-un-visualizzatore-vuoto-errore-mime-mjs)
- [Apache →](/it/self-hosting/apache#firma-pdf-o-compilazione-moduli-mostra-un-visualizzatore-vuoto-errore-mime-mjs)
- [AWS S3 + CloudFront →](/it/self-hosting/aws#passaggio-2-compila-e-carica) (vedi `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/it/self-hosting/kubernetes#errori-di-tipo-mime-per-mjs-iframe-di-firma-pdf-compilazione-moduli-vuoto)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: gestito automaticamente, nessuna azione necessaria.

**Verifica**: apri DevTools → scheda Network, trova la richiesta `.mjs` che fallisce e controlla l'header di risposta `Content-Type`. Dovrebbe essere `application/javascript`. Se è ancora `application/octet-stream`, un reverse proxy o una CDN esterna potrebbe riconoscere di nuovo il tipo: controlla ogni livello della catena di servizio.

## Configurazione WASM (componenti AGPL)

BentoPDF **non include** nel proprio codice sorgente le librerie di elaborazione con licenza AGPL, ma **preconfigura gli URL della CDN** in modo che tutte le funzionalità funzionino subito, senza alcuna configurazione manuale.

::: tip Zero-config per impostazione predefinita
Dalla v2.0.0, i moduli WASM sono preconfigurati per caricarsi dalla CDN jsDelivr tramite variabili d'ambiente. Tutte le funzionalità avanzate funzionano subito senza alcuna configurazione da parte dell'utente.
:::

| Componente      | Licenza  | Funzionalità                                                                 |
| --------------- | -------- | ---------------------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | Conversione EPUB/MOBI/FB2/XPS, estrazione di immagini, estrazione di tabelle |
| **Ghostscript** | AGPL-3.0 | Conversione PDF/A, compressione, raddrizzamento, rasterizzazione             |
| **CoherentPDF** | AGPL-3.0 | Indice, allegati, unione di PDF con segnalibri                               |

### Variabili d'ambiente predefinite

Sono impostate in `.env.production` e incorporate nella build:

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

### Sovrascrivere gli URL WASM

Puoi sovrascrivere i valori predefiniti in fase di build per deploy personalizzati:

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

Per disabilitare completamente un modulo (richiedendo la configurazione manuale dell'utente tramite le Impostazioni avanzate), imposta la sua variabile su una stringa vuota.

Per l'OCR, lascia vuote tutte le variabili `VITE_TESSERACT_*` e mantieni gli asset online predefiniti, oppure imposta insieme gli URL di worker/core/lang per un OCR self-hosted/offline. Se includi solo alcune lingue OCR, imposta anche `VITE_TESSERACT_AVAILABLE_LANGUAGES` con gli stessi codici separati da virgola, così l'interfaccia offre solo le lingue installate e le selezioni non supportate falliscono con un errore descrittivo. Per un output PDF ricercabile completamente offline, imposta anche `VITE_OCR_FONT_BASE_URL` sulla directory interna che serve i font OCR inclusi.

Gli utenti possono anche sovrascrivere questi valori predefiniti in qualsiasi momento tramite le **Impostazioni avanzate** nell'interfaccia: le sovrascritture dell'utente salvate nel browser hanno la priorità sui valori predefiniti dell'ambiente.

### Deploy air-gapped / offline

Per le reti senza accesso a internet (enti pubblici, sanità, finanza, ecc.). Gli URL WASM sono incorporati nel JavaScript **in fase di build**, mentre i file WASM veri e propri vengono scaricati dal **browser dell'utente** a runtime. Quindi devi preparare tutto su una macchina con accesso a internet e poi trasferirlo nella rete isolata.

#### Script automatico (consigliato)

Lo script `prepare-airgap.sh` incluso automatizza l'intero processo: scarica i pacchetti WASM, compila l'immagine Docker e produce un bundle autonomo con uno script di setup.

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

Questo produce una directory bundle:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Trasferisci il bundle nella rete air-gapped tramite USB, repository di artefatti interno o altro metodo approvato. Poi esegui lo script di setup incluso:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Lo script di setup carica l'immagine Docker, estrae i file WASM e, facoltativamente, avvia il container.

**Opzioni dello script:**

| Flag                           | Descrizione                                             | Predefinito                          |
| ------------------------------ | ------------------------------------------------------- | ------------------------------------ |
| `--wasm-base-url <url>`        | Dove verranno ospitati internamente i WASM              | _(obbligatorio, richiesto se manca)_ |
| `--image-name <name>`          | Tag dell'immagine Docker                                | `bentopdf`                           |
| `--output-dir <path>`          | Directory di output del bundle                          | `./bentopdf-airgap-bundle`           |
| `--simple-mode`                | Abilita Simple Mode                                     | off                                  |
| `--base-url <path>`            | Base URL della sottodirectory (ad es. `/pdf/`)          | `/`                                  |
| `--language <code>`            | Lingua predefinita dell'interfaccia (ad es. `fr`, `de`) | _(nessuno)_                          |
| `--brand-name <name>`          | Nome del brand personalizzato                           | _(nessuno)_                          |
| `--brand-logo <path>`          | Percorso del logo relativo a `public/`                  | _(nessuno)_                          |
| `--footer-text <text>`         | Testo personalizzato del piè di pagina                  | _(nessuno)_                          |
| `--ocr-languages <list>`       | Lingue OCR da includere, separate da virgola            | `eng`                                |
| `--list-ocr-languages`         | Stampa i codici e i nomi OCR supportati, poi esce       | off                                  |
| `--search-ocr-language <term>` | Cerca i codici OCR per nome o abbreviazione             | off                                  |
| `--dockerfile <path>`          | Dockerfile da usare                                     | `Dockerfile`                         |
| `--skip-docker`                | Salta la build e l'esportazione di Docker               | off                                  |
| `--skip-wasm`                  | Salta il download WASM (riusa i file `.tgz` esistenti)  | off                                  |

Il prompt interattivo accetta anche `list` per stampare l'elenco completo dei codici Tesseract supportati e `search <term>` per trovare corrispondenze come `search german` o `search chi`.

::: warning Requisito di stessa origine
I file WASM devono essere serviti dalla **stessa origine** dell'app BentoPDF. I Web Worker usano `importScripts()`, che non può caricare script cross-origin. Ad esempio, se BentoPDF gira su `https://internal.example.com`, anche il base URL WASM deve essere `https://internal.example.com/wasm`.
:::

#### Passaggi manuali

<details>
<summary>Se preferisci procedere manualmente senza lo script</summary>

**Passaggio 1: scarica i pacchetti WASM e OCR** (su una macchina con accesso a internet)

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

**Passaggio 2: compila l'immagine Docker con gli URL interni**

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

**Passaggio 3: esporta l'immagine Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**Passaggio 4: trasferisci nella rete air-gapped**

Copia tramite USB, repository di artefatti interno o altro metodo di trasferimento approvato:

- `bentopdf.tar`: l'immagine Docker
- I cinque pacchetti `.tgz` WASM/OCR del Passaggio 1
- La directory `tesseract-langdata/` del Passaggio 1
- La directory `ocr-fonts/` del Passaggio 1

**Passaggio 5: configura all'interno della rete air-gapped**

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

Assicurati che i file siano accessibili agli URL configurati nel Passaggio 2, inclusi `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data`, and `.../ocr/fonts`.

</details>

::: info Compili dal sorgente invece di usare Docker?
Imposta le variabili in `.env.production` prima di eseguire `npm run build`:

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

### Ospitare il tuo proxy WASM

Se devi servire i file WASM AGPL con gli header CORS corretti, puoi distribuire un semplice proxy. Consulta la [guida al proxy WASM di Cloudflare](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md) per un esempio di implementazione.

::: tip Perché separati?
Questa separazione garantisce:

- Chiara conformità legale per gli utenti commerciali
- Il nucleo di BentoPDF resta sotto la sua doppia licenza (AGPL-3.0 / Commercial)
- I file WASM vengono caricati a runtime, non inclusi nel sorgente
  :::

## Requisiti di sistema

| Requisito | Minimo                             |
| --------- | ---------------------------------- |
| Spazio    | ~100 MB (nucleo senza moduli AGPL) |
| RAM       | 512 MB                             |
| CPU       | Qualsiasi processore moderno       |

::: tip
BentoPDF è un sito statico: non servono database né server backend!
:::
