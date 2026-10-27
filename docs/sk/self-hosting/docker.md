# Nasadenie s Docker / Podman

Najjednoduchší spôsob, ako BentoPDF hosťovať sami v produkčnom prostredí.

> [!IMPORTANT]
> **Potrebné hlavičky pre prevod súborov Office**
>
> Nástroje založené na LibreOffice (prevod Word, Excel, PowerPoint) vyžadujú pre podporu `SharedArrayBuffer` tieto HTTP hlavičky:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Stránka sa musí poskytovať aj v zabezpečenom kontexte. `http://localhost` funguje na lokálne testovanie, ale `http://192.168.x.x` ani iné IP adresy v LAN zvyčajne nevyhovujú, takže prevod Office cez obyčajné HTTP zlyhá, aj keď hlavičky existujú.
>
> Oficiálne obrazy kontajnerov tieto hlavičky obsahujú. Ak používate reverznú proxy (Traefik, Caddy a pod.), zaistite, aby sa hlavičky zachovali alebo pridali, a pre prístup mimo loopback používajte HTTPS.

> [!TIP]
> **Používatelia Podman:** Všetky príkazy `docker` fungujú s Podman, ak nahradíte `docker` za `podman` a `docker-compose` za `podman-compose`.

## Rýchly štart

> [!TIP]
> BentoPDF sa dodáva v dvoch zostaveniach:
>
> - **Zostavenie Self-Hosted**: `ghcr.io/alam00000/bentopdf-simple:latest`. Všetky PDF nástroje **bez** marketingových prvkov (bez úvodnej sekcie, FAQ, referencií a päty). Použite ho na interné, tímové a firemné nasadenia. **Nie je** to ochudobnená „lite“ verzia.
> - **Komerčné zostavenie**: `ghcr.io/alam00000/bentopdf:latest`. Úplná marketingová stránka, ktorú používa samotné bentopdf.com a držitelia komerčnej licencie s verejnými nasadeniami.
>
> Ak si nie ste istí, stiahnite zostavenie Self-Hosted.

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

Vytvorte `docker-compose.yml`:

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

Spustite:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Zostavenie vlastného obrazu

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

Zostavte a spustite:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Premenné prostredia

| Premenná                             | Popis                                                                                                                                                                                  | Predvolené                                                     |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Zostaví variant Self-Hosted (skryje marketingové prvky bentopdf.com: úvodnú sekciu, FAQ, referencie, pätu). Všetky PDF nástroje zostanú.                                               | `false`                                                        |
| `BASE_URL`                           | Nasadenie do podadresára                                                                                                                                                               | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL modulu PyMuPDF WASM                                                                                                                                                                | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL modulu Ghostscript WASM                                                                                                                                                            | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL modulu CoherentPDF WASM                                                                                                                                                            | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL skriptu OCR workera                                                                                                                                                                | _(prázdne; použije sa predvolené CDN Tesseract.js)_            |
| `VITE_TESSERACT_CORE_URL`            | Priečinok základného runtime OCR                                                                                                                                                       | _(prázdne; použije sa predvolené CDN Tesseract.js)_            |
| `VITE_TESSERACT_LANG_URL`            | Priečinok OCR traineddata                                                                                                                                                              | _(prázdne; použije sa predvolené CDN Tesseract.js)_            |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Jazyky OCR zobrazené v rozhraní, oddelené čiarkou                                                                                                                                      | _(prázdne; zobrazí sa celý katalóg)_                           |
| `VITE_OCR_FONT_BASE_URL`             | Priečinok písiem textovej vrstvy OCR                                                                                                                                                   | _(prázdne; použijú sa vzdialené URL písiem Noto)_              |
| `VITE_DEFAULT_LANGUAGE`              | Predvolený jazyk rozhrania                                                                                                                                                             | `en`                                                           |
| `VITE_BRAND_NAME`                    | Vlastný názov značky                                                                                                                                                                   | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Cesta k logu relatívne k `public/`                                                                                                                                                     | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Vlastný text päty/copyrightu                                                                                                                                                           | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | ID nástrojov na skrytie, oddelené čiarkou                                                                                                                                              | _(prázdne; všetky nástroje zapnuté)_                           |
| `DISABLE_GITHUB_STARS`               | Vynechá získanie počtu hviezdičiek GitHub pri načítaní stránky a odstráni `api.github.com` z CSP. Zostavenia Simple Mode ho vynechávajú vždy.                                          | `false`                                                        |
| `SITE_URL`                           | Verejná URL zapísaná do odkazov canonical, hreflang a sitemap. Nechajte predvolenú hodnotu, pokiaľ nechcete, aby vyhľadávače považovali vaše nasadenie za samostatnú stránku.          | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | S vlastnou `SITE_URL` je každá stránka označená `noindex`, aby vaša kópia nekonkurovala bentopdf.com vo výsledkoch vyhľadávania. Nastavte na `true`, ak ju majú vyhľadávače indexovať. | `false`                                                        |

URL WASM modulov sú vopred nastavené na predvolené CDN, takže všetky pokročilé funkcie fungujú hneď. Pri izolovaných (air-gapped) alebo vlastných nasadeniach ich prepíšte.

### Vyhľadávače

Predvolene každá stránka označuje pre vyhľadávače bentopdf.com ako originál, takže sa vaše nasadenie nezobrazí ako duplikát. Pri súkromnej alebo internej inštancii nemusíte nič meniť.

- **Úplne vylúčiť inštanciu z výsledkov vyhľadávania:** spustite kontajner s `-e ROBOTS_NOINDEX=true`. Stačí reštart, nie nové zostavenie.
- **Zobrazovať inštanciu vo výsledkoch vyhľadávania ako samostatnú stránku:** zostavte s `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Bez `ALLOW_INDEXING=true` vlastná `SITE_URL` označí každú stránku ako `noindex`.

### Content-Security-Policy

Obraz nginx obsahuje vynucovanú hlavičku `Content-Security-Policy`. Direktívy CSP `script-src`, `connect-src` a `font-src` sa **generujú pri zostavení** z vyššie uvedených URL premenných `VITE_*`, takže hostitelia, ktorých odovzdáte cez `--build-arg`, sa do politiky pridajú automaticky.

Výsledok:

- Ak pri zostavení prepíšete `VITE_CORS_PROXY_URL` alebo `VITE_WASM_*_URL`, CSP tieto pôvody automaticky povolí, bez ďalšej konfigurácie.
- Pri URL na `cdn.jsdelivr.net` povoľuje `script-src` len presný priečinok balíka s verziou, napríklad `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, nie celé CDN. jsDelivr poskytuje akýkoľvek verejný npm balík alebo GitHub repozitár, takže povolenie celého hostiteľa by umožnilo spustiť na vašej inštancii ktorýkoľvek z nich. URL na iných hostiteľoch sa povoľujú podľa pôvodu.
- Ak nastavíte vlastné WASM URL _za behu_ na stránke Rozšírené nastavenia v aplikácii, tieto pôvody **nie sú** v CSP a prehliadač požiadavky na ne zablokuje. Platí to aj pre inú verziu toho istého balíka na `cdn.jsdelivr.net`, pretože povolená je len verzia nastavená pri zostavení. Konfigurácia za behu je určená na experimenty; pre trvalé vlastné URL nastavte zodpovedajúci build arg `VITE_*`.
- Izolované nasadenia, ktoré prepíšu všetky tri hodnoty `VITE_WASM_*_URL`, majú tieto priečinky balíkov na `cdn.jsdelivr.net` z CSP odstránené (každá predvolená hodnota sa nahradí, nepridá). Predvolené hodnoty Tesseract OCR na `cdn.jsdelivr.net` zostávajú v politike, kým nenastavíte aj tri hodnoty `VITE_TESSERACT_*`. Podobne nastavenie `VITE_CORS_PROXY_URL` nahradí verejnú predvolenú `bentopdf-cors-proxy.bentopdf.workers.dev`.

CSP obsahuje `'unsafe-eval'` v `script-src`, pretože runtime LibreOffice WASM (používaný nástrojmi na prevod Word/Excel/PowerPoint) a knižnica obrázkov wasm-vips (používaná pri PDF do TIFF) kompilujú interný kód cez `new Function()`. Jeho odstránenie by tieto nástroje pokazilo. Ak zostavujete v `SIMPLE_MODE` (bez LibreOffice) a nepotrebujete PDF do TIFF, môžete ručne upraviť vygenerovaný `security-headers.conf` a `'unsafe-eval'` odstrániť pre prísnejšiu politiku.

Pre OCR nechajte premenné `VITE_TESSERACT_*` prázdne, ak chcete použiť predvolené online zdroje, alebo nastavte všetky tri naraz pre vlastné či offline OCR. Čiastočné prepísanie OCR sa odmietne, pretože worker, základný runtime a priečinok traineddata musia zodpovedať. Pre úplne offline prehľadávateľné PDF nastavte aj `VITE_OCR_FONT_BASE_URL`, aby sa písma textovej vrstvy OCR načítali z vášho interného servera namiesto verejných URL písiem Noto.

`VITE_DEFAULT_LANGUAGE` nastavuje jazyk rozhrania pre nových návštevníkov. Podporované hodnoty: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Používatelia môžu jazyk stále prepnúť, mení sa len predvolená hodnota.

Príklad:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Vlastná značka

Nahraďte predvolené logo, názov a text päty BentoPDF vlastnými. Vložte súbor loga do priečinka `public/` (alebo použite existujúci obrázok) a pri zostavení odovzdajte premenné značky:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Značka funguje v plnom režime aj v Simple Mode a dá sa kombinovať so všetkými ostatnými možnosťami zostavenia.

### Vypnutie konkrétnych nástrojov

Skryte nástroje z rozhrania kvôli požiadavkám na súlad alebo bezpečnosť. Vypnuté nástroje sa odstránia z domovskej stránky, výsledkov vyhľadávania, klávesových skratiek a tvorcu pracovných postupov. Priamy prístup cez URL zobrazí stránku „nástroj nie je dostupný“.

ID nástroja je URL stránky bez `.html`. Napríklad ak je nástroj na `bentopdf.com/edit-pdf.html`, ID je `edit-pdf`.

#### Zistenie ID nástrojov

Najjednoduchšie: otvorte ľubovoľný nástroj v BentoPDF a pozrite sa na URL. Posledná časť cesty (bez `.html`) je ID nástroja.

<details>
<summary>Úplný zoznam ID nástrojov</summary>

**Úpravy a anotácie:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Prevod do PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Prevod z PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Organizácia a správa:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Optimalizácia a oprava:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Zabezpečenie:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Možnosť 1: Pri zostavení (Docker build arg)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Zoznam vypnutých nástrojov sa zapečie do JavaScript balíka. Zmena vyžaduje nové zostavenie.

#### Možnosť 2: Za behu (config.json)

Pripojte súbor `config.json` do poskytovaného priečinka, nové zostavenie netreba:

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

Alebo s Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Obe metódy sa dajú kombinovať, zoznamy sa zlúčia. Ak je nástroj v ktoromkoľvek z nich, je vypnutý.

#### Vypnutie funkcií editora

Môžete vypnúť aj konkrétne funkcie v PDF editore (napr. začiernenie, anotácie, formuláre) bez vypnutia celého editora. Pridajte `editorDisabledCategories` do svojho `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Úplný zoznam kategórií editora</summary>

**Priblíženie:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Anotácie:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Tvary:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Formuláre:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Začiernenie:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Dokument:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Strana:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Panel:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Nástroje:** `tools`, `pan`, `pointer`, `capture`

**Výber:** `selection`, `selection-copy`

**História:** `history`, `history-undo`, `history-redo`

</details>

Kategórie sú hierarchické: vypnutie nadradenej (napr. `annotation`) vypne všetky podradené.

### Vypnutie počítadla hviezdičiek GitHub

Navigačná lišta zobrazuje aktuálny počet hviezdičiek na GitHub, ktorý sa pri načítaní stránky získava z `api.github.com`. Je to jediná externá požiadavka, ktorá neslúži žiadnej PDF funkcii. Vypnite ju pri zostavení, čím sa kód požiadavky odstráni z balíka a `api.github.com` z Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Zostavenia Simple Mode (`bentopdf-simple`) počítadlo hviezdičiek vždy vynechávajú, tento prepínač je potrebný len pri komerčnom zostavení alebo vlastných plných zostaveniach.

### Vlastné WASM URL (izolované / vlastné hosťovanie)

> [!IMPORTANT]
> WASM URL sa zapečú do JavaScriptu **pri zostavení**. Súbory WASM sťahuje za behu **prehliadač používateľa**, Docker ich počas zostavenia nesťahuje. V izolovaných sieťach musíte súbory WASM hosťovať na internom serveri, ktorý je pre prehliadače dostupný.

**Úplný postup pre izolované prostredie:**

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

Pre `--ocr-languages` použite kódy, ktoré vypíše `bash scripts/prepare-airgap.sh --list-ocr-languages`, alebo vyhľadávajte podľa názvu cez `bash scripts/prepare-airgap.sh --search-ocr-language <term>`. Keď zostavujete s obmedzenou podmnožinou OCR, odovzdajte rovnaké kódy do `VITE_TESSERACT_AVAILABLE_LANGUAGES`, aby aplikácia zobrazovala len pribalené jazyky. Pre úplne offline výstup OCR hosťujte aj pribalený priečinok `ocr-fonts/` a nasmerujte naň `VITE_OCR_FONT_BASE_URL`.

Nastavením premennej na prázdny reťazec daný modul vypnete (používatelia ho musia nastaviť ručne v Rozšírených nastaveniach).

## Vlastný port

Predvolene BentoPDF v kontajneri počúva na porte `8080`. Ak to chcete zmeniť, nastavte za behu premennú prostredia `PORT`:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Premenná | Popis                                     | Predvolené |
| -------- | ----------------------------------------- | ---------- |
| `PORT`   | Port, na ktorom nginx počúva v kontajneri | `8080`     |

Funguje to so štandardným aj s nonroot Dockerfile.

## Vlastné ID používateľa (PUID/PGID)

Pre prostredia, ktoré vyžadujú beh pod konkrétnym používateľom bez root práv (zariadenia NAS, Kubernetes s bezpečnostnými kontextmi, firemné politiky), BentoPDF poskytuje samostatný Dockerfile s podporou PUID/PGID v štýle LSIO.

### Zostavenie a spustenie

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

### Premenné prostredia

| Premenná       | Popis                        | Predvolené |
| -------------- | ---------------------------- | ---------- |
| `PUID`         | ID používateľa pre beh       | `1000`     |
| `PGID`         | ID skupiny pre beh           | `1000`     |
| `PORT`         | Port, na ktorom nginx počúva | `8080`     |
| `DISABLE_IPV6` | Vypne IPv6 listener          | `false`    |

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

### Ako to funguje

Kontajner sa spustí ako root, vytvorí používateľa so zadaným PUID/PGID, upraví vlastníctvo všetkých zapisovateľných priečinkov a potom sa cez `su-exec` vzdá oprávnení. Proces nginx beží celý pod vami zadaným používateľom.

> [!NOTE]
> Štandardný `Dockerfile` používa `nginx-unprivileged` (UID 101) a odporúča sa pre väčšinu nasadení. `Dockerfile.nonroot` použite, len ak potrebujete konkrétne UID/GID.

> [!WARNING]
> PUID/PGID nemôže byť `0` (root). Vstupný bod overuje vstupy a pri neplatných hodnotách skončí s chybou.

## S Traefik (reverzná proxy)

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

## S Caddy (reverzná proxy)

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

## Limity zdrojov

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

## Podman Quadlet (integrácia so systemd)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) umožňuje spúšťať kontajnery Podman ako služby systemd. Je to ideálne pre produkčné nasadenia na systémoch Linux.

### Základné nastavenie Quadlet

Vytvorte súbor jednotky kontajnera v `~/.config/containers/systemd/bentopdf.container` (používateľ) alebo `/etc/containers/systemd/bentopdf.container` (systém):

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

### Zapnutie a spustenie

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
> Pri celosystémovom nasadení použite `systemctl` bez prepínača `--user` a súbor umiestnite do `/etc/containers/systemd/`.

### Quadlet s kontrolou stavu

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

### Automatická aktualizácia s Quadlet

Podman dokáže automaticky aktualizovať kontajnery, keď sú dostupné nové obrazy:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Sieťová konfigurácia Quadlet

Pre vlastnú sieťovú konfiguráciu vytvorte sieťový súbor `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Potom sa naň odkážte v súbore kontajnera:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Aktualizácia

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
