# Desplega amb Docker / Podman

La manera més fàcil d'autoallotjar BentoPDF en un entorn de producció.

> [!IMPORTANT]
> **Capçaleres necessàries per a la conversió de fitxers d'Office**
>
> Les eines basades en LibreOffice (conversió de Word, Excel i PowerPoint) requereixen aquestes capçaleres HTTP per admetre `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> La pàgina també s'ha de servir des d'un context segur. `http://localhost` funciona per a proves locals, però `http://192.168.x.x` o altres IP de la xarxa local normalment no ho compleixen, de manera que la conversió d'Office per HTTP sense xifrar fallarà encara que les capçaleres hi siguin.
>
> Les imatges de contenidor oficials inclouen aquestes capçaleres. Si utilitzes un proxy invers (Traefik, Caddy, etc.), assegura't que aquestes capçaleres es conserven o s'afegeixen, i utilitza HTTPS per a l'accés fora del bucle local.

> [!TIP]
> **Usuaris de Podman:** totes les ordres `docker` funcionen amb Podman substituint `docker` per `podman` i `docker-compose` per `podman-compose`.

## Inici ràpid

> [!TIP]
> BentoPDF s'ofereix en dues versions:
>
> - **Versió autoallotjada**: `ghcr.io/alam00000/bentopdf-simple:latest`. Totes les eines PDF, **sense** els elements de màrqueting (sense portada, preguntes freqüents, testimonis ni peu de pàgina). Utilitza-la per a desplegaments interns, d'equip o d'organització. **No** és una versió "lite" amb menys funcions.
> - **Versió comercial**: `ghcr.io/alam00000/bentopdf:latest`. El lloc de màrqueting complet, que utilitza el mateix bentopdf.com i els titulars de llicència comercial amb desplegaments públics.
>
> Si tens dubtes, descarrega la versió autoallotjada.

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

Executa:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Compila la teva pròpia imatge

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

Compila i executa:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Variables d'entorn

| Variable                             | Descripció                                                                                                                                                                                                     | Per defecte                                                    |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Compila la variant autoallotjada (amaga els elements de màrqueting de bentopdf.com: portada, preguntes freqüents, testimonis i peu de pàgina). Es mantenen totes les eines PDF.                                | `false`                                                        |
| `BASE_URL`                           | Desplega en un subdirectori                                                                                                                                                                                    | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL del mòdul WASM de PyMuPDF                                                                                                                                                                                  | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL del mòdul WASM de Ghostscript                                                                                                                                                                              | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL del mòdul WASM de CoherentPDF                                                                                                                                                                              | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL del script del worker d'OCR                                                                                                                                                                                | _(buit; utilitza el CDN per defecte de Tesseract.js)_          |
| `VITE_TESSERACT_CORE_URL`            | Directori del runtime principal d'OCR                                                                                                                                                                          | _(buit; utilitza el CDN per defecte de Tesseract.js)_          |
| `VITE_TESSERACT_LANG_URL`            | Directori de traineddata d'OCR                                                                                                                                                                                 | _(buit; utilitza el CDN per defecte de Tesseract.js)_          |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Idiomes d'OCR separats per comes que es mostren a la interfície                                                                                                                                                | _(buit; mostra el catàleg complet)_                            |
| `VITE_OCR_FONT_BASE_URL`             | Directori de fonts de la capa de text d'OCR                                                                                                                                                                    | _(buit; utilitza les URL remotes de fonts Noto)_               |
| `VITE_DEFAULT_LANGUAGE`              | Idioma per defecte de la interfície                                                                                                                                                                            | `en`                                                           |
| `VITE_BRAND_NAME`                    | Nom de marca personalitzat                                                                                                                                                                                     | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Ruta del logotip relativa a `public/`                                                                                                                                                                          | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Text personalitzat del peu de pàgina/copyright                                                                                                                                                                 | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | ID d'eines separats per comes que s'han d'amagar                                                                                                                                                               | _(buit; totes les eines activades)_                            |
| `DISABLE_GITHUB_STARS`               | Omet la consulta del nombre d'estrelles de GitHub en carregar la pàgina i elimina `api.github.com` de la CSP. Les compilacions en mode simple sempre l'ometen.                                                 | `false`                                                        |
| `SITE_URL`                           | URL pública escrita als enllaços canonical, hreflang i del mapa del lloc. Deixa-la per defecte tret que vulguis que els cercadors tractin el teu desplegament com un lloc propi.                               | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Amb un `SITE_URL` personalitzat, totes les pàgines es marquen com a `noindex` perquè la teva còpia no competeixi amb bentopdf.com als resultats de cerca. Defineix-ho a `true` perquè els cercadors l'indexin. | `false`                                                        |

Les URL dels mòduls WASM vénen preconfigurades amb CDN per defecte, així que totes les funcions avançades funcionen directament. Substitueix-les en desplegaments aïllats de la xarxa o autoallotjats.

### Cercadors

Per defecte, totes les pàgines indiquen als cercadors que l'original és bentopdf.com, de manera que el teu desplegament no apareix com a duplicat. No cal canviar res per a una instància privada o interna.

- **Mantenir la instància fora dels resultats de cerca:** executa el contenidor amb `-e ROBOTS_NOINDEX=true`. Només cal reiniciar-lo, no tornar a compilar.
- **Fer que la instància sigui un lloc propi als resultats de cerca:** compila amb `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Sense `ALLOW_INDEXING=true`, un `SITE_URL` personalitzat marca totes les pàgines com a `noindex`.

### Content-Security-Policy

La imatge d'nginx inclou una capçalera `Content-Security-Policy` d'aplicació obligatòria. Les directives `script-src`, `connect-src` i `font-src` de la CSP es **generen en el moment de la compilació** a partir de les variables d'URL `VITE_*` anteriors: els servidors que passis amb `--build-arg` s'afegeixen automàticament a la política.

Com a resultat:

- Si substitueixes `VITE_CORS_PROXY_URL` o `VITE_WASM_*_URL` en compilar, la CSP permet aquests orígens automàticament, sense cap configuració addicional.
- Per a les URL de `cdn.jsdelivr.net`, `script-src` només permet la carpeta exacta del paquet amb versió, per exemple `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, no tot el CDN. jsDelivr serveix qualsevol paquet npm públic o repositori de GitHub, així que permetre tot el servidor deixaria executar-los a la teva instància. Les URL de qualsevol altre servidor es permeten per origen.
- Si configures URL WASM personalitzades _en execució_ a la pàgina de configuració avançada de l'aplicació, aquests orígens **no** són a la CSP i el navegador en bloquejarà les peticions. Això també val per a una versió diferent del mateix paquet a `cdn.jsdelivr.net`, perquè només es permet la versió definida en compilar. La configuració en execució és per experimentar; per a URL personalitzades permanents, defineix l'argument de compilació `VITE_*` corresponent.
- Als desplegaments aïllats de la xarxa que substitueixen els tres valors `VITE_WASM_*_URL`, també s'eliminen de la CSP aquestes carpetes de paquets de `cdn.jsdelivr.net` (cada valor per defecte se substitueix, no s'afegeix). Els valors per defecte d'OCR de Tesseract a `cdn.jsdelivr.net` es queden a la política fins que també defineixis els tres valors `VITE_TESSERACT_*`. De la mateixa manera, definir `VITE_CORS_PROXY_URL` substitueix el valor públic per defecte `bentopdf-cors-proxy.bentopdf.workers.dev`.

La CSP inclou `'unsafe-eval'` a `script-src` perquè el runtime de LibreOffice WASM (utilitzat per les eines de conversió de Word/Excel/PowerPoint) i la biblioteca d'imatges wasm-vips (utilitzada per PDF a TIFF) compilen codi de distribució intern mitjançant `new Function()`. Eliminar-lo trencaria aquestes eines. Si compiles en `SIMPLE_MODE` (sense LibreOffice) i no necessites PDF a TIFF, pots editar manualment el `security-headers.conf` generat per treure `'unsafe-eval'` i obtenir una política més estricta.

Per a l'OCR, deixa buides les variables `VITE_TESSERACT_*` per utilitzar els recursos en línia per defecte, o defineix-les totes tres alhora per a l'OCR autoallotjat o sense connexió. Les substitucions parcials d'OCR es rebutgen perquè el worker, el runtime principal i el directori de traineddata han de coincidir. Per generar PDF cercables totalment sense connexió, defineix també `VITE_OCR_FONT_BASE_URL` perquè les fonts de la capa de text d'OCR es carreguin des del teu servidor intern i no des de les URL públiques de fonts Noto.

`VITE_DEFAULT_LANGUAGE` defineix l'idioma de la interfície per als visitants que hi entren per primera vegada. Valors admesos: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Els usuaris poden canviar d'idioma igualment: això només canvia el valor per defecte.

Exemple:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Marca personalitzada

Substitueix el logotip, el nom i el text del peu de pàgina de BentoPDF pels teus. Posa el fitxer del logotip a la carpeta `public/` (o utilitza una imatge existent) i passa les variables de marca en compilar:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

La marca funciona tant en mode complet com en mode simple, i es pot combinar amb totes les altres opcions de compilació.

### Desactivar eines concretes

Amaga eines de la interfície per requisits de compliment o seguretat. Les eines desactivades s'eliminen de la pàgina d'inici, dels resultats de cerca, de les dreceres de teclat i del creador de fluxos de treball. L'accés directe per URL mostra una pàgina d'"eina no disponible".

Els ID d'eina són la URL de la pàgina sense `.html`. Per exemple, si l'eina és a `bentopdf.com/edit-pdf.html`, l'ID és `edit-pdf`.

#### Trobar els ID d'eina

La manera més fàcil: obre qualsevol eina de BentoPDF i mira la URL. L'última part de la ruta (sense `.html`) és l'ID de l'eina.

<details>
<summary>Llista completa d'ID d'eina</summary>

**Edita i anota:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Converteix a PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Converteix des de PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organitza i gestiona:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optimitza i repara:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Seguretat:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Opció 1: en compilar (argument de compilació de Docker)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Això incorpora la llista de desactivades al paquet de JavaScript. Per canviar-la cal tornar a compilar.

#### Opció 2: en execució (config.json)

Munta un fitxer `config.json` al directori servit, sense necessitat de tornar a compilar:

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

O amb Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Els dos mètodes es poden combinar: les llistes es fusionen. Si una eina apareix en qualsevol de les dues, es desactiva.

#### Desactivar funcions de l'editor

També pots desactivar funcions concretes de l'editor de PDF (p. ex., censura, anotacions, formularis) sense desactivar tota l'eina d'edició. Afegeix `editorDisabledCategories` al teu `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Llista completa de categories de l'editor</summary>

**Zoom:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Anotació:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Formes:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Formulari:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Censura:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Document:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Pàgina:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Tauler:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Eines:** `tools`, `pan`, `pointer`, `capture`

**Selecció:** `selection`, `selection-copy`

**Historial:** `history`, `history-undo`, `history-redo`

</details>

Les categories són jeràrquiques: desactivar una categoria pare (p. ex., `annotation`) desactiva tots els seus fills.

### Desactivar el comptador d'estrelles de GitHub

La barra de navegació mostra el nombre d'estrelles de GitHub en directe, obtingut de `api.github.com` en carregar la pàgina. És l'única petició externa que no serveix una funció de PDF. Desactiva-ho en compilar per eliminar el codi de consulta del paquet i treure `api.github.com` de la Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Les compilacions en mode simple (`bentopdf-simple`) sempre ometen el comptador d'estrelles: aquesta opció només cal a la versió comercial o a compilacions completes personalitzades.

### URL WASM personalitzades (aïllat de la xarxa / autoallotjat)

> [!IMPORTANT]
> Les URL WASM s'incorporen al JavaScript **en compilar**. Els fitxers WASM els descarrega el **navegador de l'usuari** en execució: Docker no els descarrega durant la compilació. En xarxes aïllades, has d'allotjar els fitxers WASM en un servidor intern al qual arribin els navegadors.

**Flux de treball complet en xarxa aïllada:**

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

Utilitza per a `--ocr-languages` els codis que mostra `bash scripts/prepare-airgap.sh --list-ocr-languages`, o cerca per nom amb `bash scripts/prepare-airgap.sh --search-ocr-language <term>`. Quan compiles amb un subconjunt restringit d'OCR, passa els mateixos codis a `VITE_TESSERACT_AVAILABLE_LANGUAGES` perquè l'aplicació només mostri els idiomes inclosos. Per a una sortida d'OCR totalment sense connexió, allotja també el directori `ocr-fonts/` inclòs i fes que `VITE_OCR_FONT_BASE_URL` hi apunti.

Defineix una variable amb una cadena buida per desactivar aquest mòdul (els usuaris l'hauran de configurar manualment a la configuració avançada).

## Port personalitzat

Per defecte, BentoPDF escolta al port `8080` dins del contenidor. Per canviar-ho, defineix la variable d'entorn `PORT` en execució:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Variable | Descripció                           | Per defecte |
| -------- | ------------------------------------ | ----------- |
| `PORT`   | Port d'escolta d'Nginx al contenidor | `8080`      |

Això funciona tant amb el Dockerfile estàndard com amb el nonroot.

## ID d'usuari personalitzat (PUID/PGID)

Per a entorns que requereixen executar-se com un usuari concret que no sigui root (dispositius NAS, Kubernetes amb contextos de seguretat, polítiques de l'organització), BentoPDF ofereix un Dockerfile independent amb suport de PUID/PGID a l'estil LSIO.

### Compila i executa

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

### Variables d'entorn

| Variable       | Descripció                    | Per defecte |
| -------------- | ----------------------------- | ----------- |
| `PUID`         | ID d'usuari amb què s'executa | `1000`      |
| `PGID`         | ID de grup amb què s'executa  | `1000`      |
| `PORT`         | Port d'escolta d'Nginx        | `8080`      |
| `DISABLE_IPV6` | Desactiva l'escoltador IPv6   | `false`     |

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

### Com funciona

El contenidor s'inicia com a root, crea un usuari amb el PUID/PGID especificat, ajusta la propietat de tots els directoris escrivibles i després retira els privilegis mitjançant `su-exec`. El procés d'nginx s'executa íntegrament com l'usuari que has indicat.

> [!NOTE]
> El `Dockerfile` estàndard utilitza `nginx-unprivileged` (UID 101) i es recomana per a la majoria de desplegaments. Utilitza `Dockerfile.nonroot` només quan necessitis un UID/GID concret.

> [!WARNING]
> PUID/PGID no poden ser `0` (root). El punt d'entrada valida els valors i sortirà amb un error si no són vàlids.

## Amb Traefik (proxy invers)

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

## Amb Caddy (proxy invers)

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

## Límits de recursos

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

## Podman Quadlet (integració amb systemd)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) permet executar contenidors de Podman com a serveis de systemd. És ideal per a desplegaments de producció en sistemes Linux.

### Configuració bàsica de Quadlet

Crea un fitxer d'unitat de contenidor a `~/.config/containers/systemd/bentopdf.container` (usuari) o `/etc/containers/systemd/bentopdf.container` (sistema):

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

### Activa i inicia

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
> Per a un desplegament a nivell de sistema, utilitza `systemctl` sense l'opció `--user` i posa el fitxer a `/etc/containers/systemd/`.

### Quadlet amb comprovació d'estat

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

### Actualització automàtica amb Quadlet

Podman pot actualitzar els contenidors automàticament quan hi ha imatges noves disponibles:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Configuració de xarxa de Quadlet

Per a una configuració de xarxa personalitzada, crea un fitxer de xarxa `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Després fes-hi referència al fitxer del contenidor:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Actualització

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
