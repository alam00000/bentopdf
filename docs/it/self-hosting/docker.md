# Distribuzione con Docker / Podman

Il modo più semplice per ospitare BentoPDF in autonomia in un ambiente di produzione.

> [!IMPORTANT]
> **Header richiesti per la conversione dei file Office**
>
> Gli strumenti basati su LibreOffice (conversione di Word, Excel, PowerPoint) richiedono questi header HTTP per il supporto a `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> La pagina deve inoltre essere servita da un contesto sicuro. `http://localhost` funziona per i test in locale, ma `http://192.168.x.x` o altri IP di rete locale di solito non lo qualificano, quindi la conversione Office tramite HTTP semplice fallirà anche se gli header sono presenti.
>
> Le immagini container ufficiali includono questi header. Se usi un reverse proxy (Traefik, Caddy, ecc.), assicurati che gli header vengano mantenuti o aggiunti e usa HTTPS per gli accessi diversi dal loopback.

> [!TIP]
> **Utenti Podman:** tutti i comandi `docker` funzionano con Podman sostituendo `docker` con `podman` e `docker-compose` con `podman-compose`.

## Avvio rapido

> [!TIP]
> BentoPDF è disponibile in due build:
>
> - **Build self-hosted**: `ghcr.io/alam00000/bentopdf-simple:latest`. Tutti gli strumenti PDF, **senza** la parte di marketing (niente hero, FAQ, testimonianze, footer). Usala per installazioni interne, di team o di organizzazioni. **Non** è una versione "lite" con meno funzionalità.
> - **Build commerciale**: `ghcr.io/alam00000/bentopdf:latest`. Il sito di marketing completo, usato da bentopdf.com stesso e dai titolari di una licenza commerciale che gestiscono installazioni pubbliche.
>
> Se hai dubbi: scarica la build self-hosted.

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

Crea `docker-compose.yml`:

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

Esegui:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Crea la tua immagine

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

Compila ed esegui:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Variabili d'ambiente

| Variabile                            | Descrizione                                                                                                                                                                                                    | Predefinito                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Compila la variante self-hosted (nasconde la parte di marketing di bentopdf.com: hero, FAQ, testimonianze, footer). Tutti gli strumenti PDF restano.                                                           | `false`                                                        |
| `BASE_URL`                           | Distribuzione in una sottodirectory                                                                                                                                                                            | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL del modulo WASM di PyMuPDF                                                                                                                                                                                 | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL del modulo WASM di Ghostscript                                                                                                                                                                             | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL del modulo WASM di CoherentPDF                                                                                                                                                                             | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL dello script worker OCR                                                                                                                                                                                    | _(vuoto; usa la CDN predefinita di Tesseract.js)_              |
| `VITE_TESSERACT_CORE_URL`            | Directory del runtime core OCR                                                                                                                                                                                 | _(empty; use Tesseract.js default CDN)_                        |
| `VITE_TESSERACT_LANG_URL`            | Directory dei traineddata OCR                                                                                                                                                                                  | _(empty; use Tesseract.js default CDN)_                        |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Lingue OCR separate da virgole mostrate nell'interfaccia                                                                                                                                                       | _(vuoto; mostra il catalogo completo)_                         |
| `VITE_OCR_FONT_BASE_URL`             | Directory dei font del livello di testo OCR                                                                                                                                                                    | _(vuoto; usa gli URL remoti dei font Noto)_                    |
| `VITE_DEFAULT_LANGUAGE`              | Lingua predefinita dell'interfaccia                                                                                                                                                                            | `en`                                                           |
| `VITE_BRAND_NAME`                    | Nome del marchio personalizzato                                                                                                                                                                                | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Percorso del logo relativo a `public/`                                                                                                                                                                         | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Testo personalizzato del footer/copyright                                                                                                                                                                      | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | ID degli strumenti da nascondere, separati da virgole                                                                                                                                                          | _(vuoto; tutti gli strumenti abilitati)_                       |
| `DISABLE_GITHUB_STARS`               | Salta il recupero del numero di stelle GitHub al caricamento della pagina e rimuove `api.github.com` dalla CSP. Le build in Simple Mode lo saltano sempre.                                                     | `false`                                                        |
| `SITE_URL`                           | URL pubblico scritto nei link canonical, hreflang e sitemap. Lascia il valore predefinito, a meno che tu non voglia che i motori di ricerca trattino la tua installazione come un sito a sé.                   | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Con un `SITE_URL` personalizzato, ogni pagina è marcata `noindex` così la tua copia non compete con bentopdf.com nei risultati di ricerca. Imposta `true` per permettere ai motori di ricerca di indicizzarla. | `false`                                                        |

Gli URL dei moduli WASM sono preconfigurati con i valori CDN predefiniti: tutte le funzionalità avanzate funzionano subito. Sostituiscili per installazioni air-gapped o self-hosted.

### Motori di ricerca

Per impostazione predefinita, ogni pagina indica ai motori di ricerca bentopdf.com come originale, così la tua installazione non appare come duplicato. Non devi cambiare nulla per un'istanza privata o interna.

- **Tieni la tua istanza fuori dai risultati di ricerca:** esegui il container con `-e ROBOTS_NOINDEX=true`. Basta un riavvio, non serve ricompilare.
- **Rendi la tua istanza un sito a sé nei risultati di ricerca:** compila con `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Senza `ALLOW_INDEXING=true`, un `SITE_URL` personalizzato marca ogni pagina `noindex`.

### Content-Security-Policy

L'immagine nginx include un header `Content-Security-Policy` in modalità enforcing. Le direttive `script-src`, `connect-src` e `font-src` della CSP sono **generate in fase di build** a partire dalle variabili URL `VITE_*` qui sopra: tutti gli host che passi con `--build-arg` vengono aggiunti automaticamente alla policy.

Di conseguenza:

- Se sovrascrivi `VITE_CORS_PROXY_URL` o `VITE_WASM_*_URL` in fase di build, la CSP consente automaticamente quelle origini, senza configurazioni aggiuntive.
- Per gli URL su `cdn.jsdelivr.net`, `script-src` consente solo l'esatta cartella del pacchetto con versione, ad esempio `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, non l'intera CDN. jsDelivr serve qualsiasi pacchetto npm pubblico o repository GitHub, quindi consentire l'intero host permetterebbe a ciascuno di essi di essere eseguito sulla tua istanza. Gli URL su qualsiasi altro host sono consentiti per origine.
- Se configuri URL WASM personalizzati in _runtime_ dalla pagina Impostazioni avanzate dell'app, quelle origini **non** sono nella CSP e il browser bloccherà le richieste verso di esse. Vale anche per una versione diversa dello stesso pacchetto su `cdn.jsdelivr.net`, perché è consentita solo la versione impostata in fase di build. La configurazione in runtime serve per sperimentare; per URL personalizzati permanenti imposta il corrispondente build arg `VITE_*`.
- Nelle installazioni air-gapped che sovrascrivono tutti e tre i valori `VITE_WASM_*_URL`, anche le cartelle dei pacchetti su `cdn.jsdelivr.net` vengono rimosse dalla CSP (ogni valore predefinito viene sostituito, non aggiunto). I valori predefiniti di Tesseract OCR su `cdn.jsdelivr.net` restano nella policy finché non imposti anche i tre valori `VITE_TESSERACT_*`. Allo stesso modo, impostare `VITE_CORS_PROXY_URL` sostituisce il valore pubblico predefinito `bentopdf-cors-proxy.bentopdf.workers.dev`.

La CSP include `'unsafe-eval'` in `script-src` perché il runtime LibreOffice WASM (usato dagli strumenti di conversione Word/Excel/PowerPoint) e la libreria di immagini wasm-vips (usata da PDF in TIFF) compilano codice di dispatch interno tramite `new Function()`. Rimuoverlo renderebbe inutilizzabili quegli strumenti. Se compili in `SIMPLE_MODE` (senza LibreOffice) e non ti serve PDF in TIFF, puoi modificare a mano il file generato `security-headers.conf` per eliminare `'unsafe-eval'` e ottenere una policy più restrittiva.

Per l'OCR, lascia vuote le variabili `VITE_TESSERACT_*` per usare le risorse online predefinite, oppure impostale tutte e tre insieme per un OCR self-hosted/offline. Le sostituzioni parziali dell'OCR vengono rifiutate perché worker, runtime core e directory dei traineddata devono corrispondere. Per un output PDF ricercabile completamente offline, imposta anche `VITE_OCR_FONT_BASE_URL` in modo che i font del livello di testo OCR vengano caricati dal tuo server interno invece che dagli URL pubblici dei font Noto.

`VITE_DEFAULT_LANGUAGE` imposta la lingua dell'interfaccia per i nuovi visitatori. Valori supportati: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Gli utenti possono comunque cambiare lingua: questo modifica solo il valore predefinito.

Esempio:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Marchio personalizzato

Sostituisci il logo, il nome e il testo del footer predefiniti di BentoPDF con i tuoi. Metti il file del logo nella cartella `public/` (o usa un'immagine esistente), poi passa le variabili del marchio in fase di build:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

La personalizzazione del marchio funziona sia in modalità completa sia in Simple Mode e si può combinare con tutte le altre opzioni di build.

### Disattivare strumenti specifici

Nascondi strumenti dall'interfaccia per esigenze di conformità o sicurezza. Gli strumenti disattivati vengono rimossi dalla homepage, dai risultati di ricerca, dalle scorciatoie da tastiera e dal workflow builder. L'accesso diretto tramite URL mostra una pagina "strumento non disponibile".

Gli ID degli strumenti sono l'URL della pagina senza `.html`. Ad esempio, se lo strumento si trova in `bentopdf.com/edit-pdf.html`, l'ID è `edit-pdf`.

#### Trovare gli ID degli strumenti

Il modo più semplice: apri uno strumento qualsiasi in BentoPDF e guarda l'URL. L'ultima parte del percorso (senza `.html`) è l'ID dello strumento.

<details>
<summary>Elenco completo degli ID degli strumenti</summary>

**Modifica e annota:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Converti in PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Converti da PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organizza e gestisci:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Ottimizza e ripara:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Sicurezza:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Opzione 1: in fase di build (build arg di Docker)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Questo incorpora l'elenco degli strumenti disattivati nel bundle JavaScript. Per modificarlo serve ricompilare.

#### Opzione 2: in runtime (config.json)

Monta un file `config.json` nella directory servita, senza bisogno di ricompilare:

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

Oppure con Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

I due metodi si possono combinare: gli elenchi vengono uniti. Se uno strumento compare in uno dei due, viene disattivato.

#### Disattivare le funzionalità dell'editor

Puoi anche disattivare funzionalità specifiche all'interno dell'editor PDF (ad es. oscuramento, annotazioni, moduli) senza disattivare l'intero strumento. Aggiungi `editorDisabledCategories` al tuo `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Elenco completo delle categorie dell'editor</summary>

**Zoom:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Annotazioni:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Forme:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Moduli:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Oscuramento:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Documento:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Pagina:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Pannelli:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Strumenti:** `tools`, `pan`, `pointer`, `capture`

**Selezione:** `selection`, `selection-copy`

**Cronologia:** `history`, `history-undo`, `history-redo`

</details>

Le categorie sono gerarchiche: disattivando una categoria padre (ad es. `annotation`) si disattivano tutte le sue figlie.

### Disattivare il contatore di stelle GitHub

La barra di navigazione mostra il numero di stelle GitHub in tempo reale, recuperato da `api.github.com` al caricamento della pagina. È l'unica richiesta esterna che non serve a una funzionalità PDF. Disattivalo in fase di build per rimuovere il codice di recupero dal bundle ed eliminare `api.github.com` dalla Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Le build in Simple Mode (`bentopdf-simple`) saltano sempre il contatore di stelle: questo flag serve solo sulla build commerciale o sulle build complete personalizzate.

### URL WASM personalizzati (air-gapped / self-hosted)

> [!IMPORTANT]
> Gli URL WASM sono incorporati nel JavaScript in **fase di build**. I file WASM vengono scaricati dal **browser dell'utente** in runtime: Docker non li scarica durante la build. Per le reti air-gapped, devi ospitare i file WASM su un server interno raggiungibile dai browser.

**Flusso di lavoro air-gapped completo:**

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

Usa i codici stampati da `bash scripts/prepare-airgap.sh --list-ocr-languages`, oppure cercali per nome con `bash scripts/prepare-airgap.sh --search-ocr-language <term>`, per `--ocr-languages`. Quando compili con un sottoinsieme limitato di lingue OCR, passa gli stessi codici a `VITE_TESSERACT_AVAILABLE_LANGUAGES` in modo che l'app mostri solo le lingue incluse. Per un output OCR completamente offline, ospita anche la cartella inclusa `ocr-fonts/` e punta `VITE_OCR_FONT_BASE_URL` verso di essa.

Imposta una variabile su stringa vuota per disattivare quel modulo (gli utenti dovranno configurarlo manualmente da Impostazioni avanzate).

## Porta personalizzata

Per impostazione predefinita, BentoPDF è in ascolto sulla porta `8080` all'interno del container. Per cambiarla, imposta la variabile d'ambiente `PORT` in runtime:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Variabile | Descrizione                             | Predefinito |
| --------- | --------------------------------------- | ----------- |
| `PORT`    | Porta di ascolto di Nginx nel container | `8080`      |

Funziona sia con il Dockerfile standard sia con quello nonroot.

## ID utente personalizzato (PUID/PGID)

Per gli ambienti che richiedono l'esecuzione come utente non root specifico (dispositivi NAS, Kubernetes con security context, policy organizzative), BentoPDF fornisce un Dockerfile separato con supporto PUID/PGID in stile LSIO.

### Compila ed esegui

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

### Variabili d'ambiente

| Variabile      | Descrizione                | Predefinito |
| -------------- | -------------------------- | ----------- |
| `PUID`         | ID utente con cui eseguire | `1000`      |
| `PGID`         | ID gruppo con cui eseguire | `1000`      |
| `PORT`         | Porta di ascolto di Nginx  | `8080`      |
| `DISABLE_IPV6` | Disattiva il listener IPv6 | `false`     |

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

### Come funziona

Il container si avvia come root, crea un utente con il PUID/PGID specificato, regola la proprietà di tutte le directory scrivibili e poi abbassa i privilegi con `su-exec`. Il processo nginx viene eseguito interamente come l'utente specificato.

> [!NOTE]
> Il `Dockerfile` standard usa `nginx-unprivileged` (UID 101) ed è consigliato per la maggior parte delle installazioni. Usa `Dockerfile.nonroot` solo quando ti serve un UID/GID specifico.

> [!WARNING]
> PUID/PGID non possono essere `0` (root). L'entrypoint convalida i valori e termina con un errore se non sono validi.

## Con Traefik (reverse proxy)

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

## Con Caddy (reverse proxy)

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

## Limiti di risorse

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

## Podman Quadlet (integrazione con systemd)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) permette di eseguire i container Podman come servizi systemd. È ideale per le installazioni di produzione su sistemi Linux.

### Configurazione base di Quadlet

Crea un file di unità container in `~/.config/containers/systemd/bentopdf.container` (utente) oppure `/etc/containers/systemd/bentopdf.container` (sistema):

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

### Abilita e avvia

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
> Per un'installazione a livello di sistema, usa `systemctl` senza il flag `--user` e metti il file in `/etc/containers/systemd/`.

### Quadlet con health check

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

### Aggiornamento automatico con Quadlet

Podman può aggiornare automaticamente i container quando sono disponibili nuove immagini:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Configurazione di rete di Quadlet

Per una configurazione di rete personalizzata, crea un file di rete `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Poi fai riferimento ad esso nel tuo file container:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Aggiornamento

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
