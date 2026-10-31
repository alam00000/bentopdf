# Príručka pre vlastný hosting

BentoPDF môžete hostovať na vlastnej infraštruktúre. Táto príručka pokrýva rôzne možnosti nasadenia.

## Rýchly štart s Docker / Podman

Najrýchlejší spôsob, ako hostovať BentoPDF vo vlastnej réžii:

> [!TIP]
> BentoPDF sa dodáva v dvoch zostaveniach:
>
> - **Zostavenie Self-Hosted**: `ghcr.io/alam00000/bentopdf-simple:latest`. Všetky PDF nástroje, **bez** marketingových prvkov (bez úvodnej sekcie, FAQ, referencií a päty). Použite ho pre interné, tímové a organizačné nasadenia. **Nie je** to funkčne obmedzená verzia „lite“.
> - **Komerčné zostavenie**: `ghcr.io/alam00000/bentopdf:latest`. Kompletný marketingový web, ktorý používa samotný bentopdf.com a držitelia komerčnej licencie pri verejných nasadeniach.
>
> Ak si nie ste istí, stiahnite zostavenie Self-Hosted.

> [!IMPORTANT]
> Konverzia súborov Office vyžaduje `SharedArrayBuffer`, čo znamená, že aplikácia musí byť izolovaná z hľadiska cross-origin a zároveň poskytovaná zo zabezpečeného kontextu. Oficiálny obraz už posiela potrebné hlavičky COOP/COEP, prehliadače však `SharedArrayBuffer` stále vypínajú na obyčajných HTTP pôvodoch v lokálnej sieti, ako je `http://192.168.x.x`.
>
> `http://localhost` používajte len na testovanie na tom istom zariadení. Ak používatelia pristupujú k BentoPDF cez IP adresu alebo názov hostiteľa v LAN, zabezpečte ho cez HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Alebo pomocou Docker Compose / Podman Compose:

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

Spustite BentoPDF ako službu systemd. Vytvorte `~/.config/containers/systemd/bentopdf.container`:

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

Kompletnú dokumentáciu ku Quadlet nájdete v [príručke nasadenia Docker](/sk/self-hosting/docker).

## Zostavenie zo zdrojového kódu

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Možnosti konfigurácie

### Zostavenie Self-Hosted (Simple Mode)

Zostavenie Self-Hosted (obraz `bentopdf-simple`, nazývaný aj Simple Mode) je **funkčne identické** s komerčným zostavením: obsahuje všetky PDF nástroje a tie sa správajú rovnako. Iba skrýva marketingové prvky, ktoré dávajú zmysel len na samotnom bentopdf.com alebo pri komerčnom verejnom nasadení. **Nie je to funkčne obmedzená ani „lite“ verzia.**

**Čo zostavenie Self-Hosted skrýva** (len kozmetické zmeny, žiadne PDF funkcie sa neodstraňujú):

- Navigačnú lištu, úvodnú sekciu, sekciu funkcií, FAQ, referencie, pätu
- Mení titulok stránky na „Nástroje PDF“

**Čo zostavenie Self-Hosted zachováva** (všetko, čo skutočne pracuje s PDF):

- Všetky PDF nástroje (spájanie, rozdeľovanie, úpravy, podpisovanie, OCR, konverzia Office atď.)
- Podporu vlastnej značky, všetku konfiguráciu pri zostavení aj za behu

Komerčné zostavenie (`ghcr.io/alam00000/bentopdf:latest`) poháňa samotný bentopdf.com a používajú ho držitelia komerčnej licencie pri verejných nasadeniach. Pridáva úvodnú sekciu, FAQ, referencie a pätu, ktoré by pri internom nástroji nedávali zmysel.

Ak hostujete BentoPDF pre svoj tím, organizáciu alebo ako interný nástroj, stiahnite zostavenie Self-Hosted:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Všetky podrobnosti nájdete v [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md).

### Komerčné zostavenie (verejné nasadenia pod vlastnou značkou)

Komerčné zostavenie (obraz `bentopdf`, bez prípony `-simple`) poháňa samotný bentopdf.com. Okrem všetkých PDF nástrojov obsahuje kompletný marketingový web (úvodná sekcia, funkcie, FAQ, referencie, päta). Toto zostavenie použite, keď chcete **nasadiť BentoPDF ako verejnú PDF službu pod vlastnou značkou**, napríklad:

- Prevádzkujete BentoPDF ako hostovanú SaaS službu pre koncových používateľov na vlastnej doméne
- Chcete zážitok úvodnej stránky (marketingové sekcie + nástroje), nie len samotné nástroje
- Ste držiteľom komerčnej licencie a integrujete BentoPDF do komerčného produktu

**Spustenie bez úprav** (so značkou BentoPDF, užitočné na náhľad zostavenia):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Zostavenie s vlastnou značkou** (typický komerčný postup):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Všetky ostatné možnosti pri zostavení (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, prepísanie URL pre WASM atď.) fungujú rovnako ako pri zostavení Self-Hosted.

::: warning Licencovanie
Prevádzka komerčného zostavenia je povolená v rámci ktorejkoľvek z dvoch licenčných možností BentoPDF:

- **AGPL-3.0** (zadarmo): povolené, ak vaše nasadenie zverejní celý svoj zdrojový kód pod AGPL vrátane všetkých úprav značky a súvisiacej obchodnej logiky.
- **Komerčná licencia** (79 $ doživotne): potrebná pre uzavreté / proprietárne nasadenia, kde nezverejňujete svoj fork so značkou ani obchodný kód.

Úplné porovnanie nájdete na [stránke licencovania](https://www.bentopdf.com/licensing). WASM moduly pod licenciou AGPL (PyMuPDF, Ghostscript, CoherentPDF) sa načítavajú z CDN za behu, takže sa nedostanú do vášho obrazu a nemenia vašu licenčnú pozíciu.
:::

### Základná URL

Nasadenie do podadresára:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Vlastná značka

Pri zostavení nahraďte predvolené logo, názov a text päty BentoPDF vlastnými:

| Premenná           | Popis                               | Predvolené                              |
| ------------------ | ----------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Názov značky v hlavičke a päte      | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Cesta k logu relatívne k `public/`  | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Vlastný text päty / autorských práv | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Alebo cez Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Vlastná značka funguje v plnom režime aj v Simple Mode a dá sa kombinovať so všetkými ostatnými možnosťami pri zostavení (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Vypnutie konkrétnych nástrojov

Skryte jednotlivé nástroje z dôvodu súladu s predpismi alebo bezpečnosti. Vypnuté nástroje sa odstránia z domovskej stránky, vyhľadávania, skratiek, nástroja na tvorbu workflow aj z priameho prístupu cez URL.

ID nástroja je URL stránky bez `.html`: otvorte ľubovoľný nástroj a pozrite sa na URL (napr. `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Pri zostavení** (zapečené do balíka):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Za behu** (bez nového zostavenia, stačí pripojiť `config.json`):

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

Obe metódy sa dajú kombinovať, zoznamy sa zlúčia.

V PDF editore môžete vypnúť aj konkrétne funkcie (napr. redigovanie) bez vypnutia celého nástroja, a to pridaním `editorDisabledCategories` do `config.json`. Úplný zoznam kategórií nájdete v [príručke Docker](/sk/self-hosting/docker#vypnutie-funkcii-editora).

## Príručky nasadenia

Vyberte si platformu:

- [Vercel](/sk/self-hosting/vercel)
- [Netlify](/sk/self-hosting/netlify)
- [Cloudflare Pages](/sk/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/sk/self-hosting/aws)
- [Hostinger](/sk/self-hosting/hostinger)
- [Nginx](/sk/self-hosting/nginx)
- [Apache](/sk/self-hosting/apache)
- [Docker](/sk/self-hosting/docker)
- [Kubernetes](/sk/self-hosting/kubernetes)
- [CORS proxy](/sk/self-hosting/cors-proxy) - Potrebný pre digitálne podpisy

## Časté problémy

### Konverzia Word / ODT / Excel / PowerPoint do PDF zamrzne (SharedArrayBuffer nie je dostupný)

**Príznak**: Konverzie dokumentov založené na LibreOffice (Word, ODT, Excel, PowerPoint do PDF) zamrznú na ~55 % alebo sa vôbec nespustia. Konzola prehliadača môže zobraziť:

> `ReferenceError: SharedArrayBuffer is not defined`

…alebo `window.crossOriginIsolated` hlási `false`, alebo kompilácia WASM hlási `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Príčina**: LibreOffice WASM vyžaduje `SharedArrayBuffer`, ktorý prehliadač povolí, len keď je stránka **izolovaná z hľadiska cross-origin** A ZÁROVEŇ poskytovaná zo **zabezpečeného kontextu**. Musia teda platiť dve veci:

1. Každá odpoveď obsahuje obe hlavičky:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. Stránka sa poskytuje z `https://...` alebo `http://localhost`. Obyčajné HTTP na IP adrese v LAN (napr. `http://192.168.x.x`) sa NEPOVAŽUJE za zabezpečené, prehliadače tam `SharedArrayBuffer` vypínajú.

Nezhoda `00 61 73 6d / 1f 8b 08 08` je samostatný čiastkový príznak: vopred skomprimovaným súborom `.wasm.gz` / `.data.gz` chýba hlavička odpovede `Content-Encoding: gzip`, takže prehliadač dostane surové gzip bajty namiesto dekomprimovaného WASM.

**Riešenie**: presnú konfiguráciu nájdete v príručke nasadenia pre vašu platformu:

- [Nginx →](/sk/self-hosting/nginx#konverzia-word-odt-excel-do-pdf-nefunguje)
- [Apache →](/sk/self-hosting/apache#prevod-word-odt-excel-do-pdf-nefunguje)
- [AWS S3 + CloudFront →](/sk/self-hosting/aws#krok-3b-politika-hlaviciek-odpovede-potrebna-pre-libreoffice-wasm)
- [Cloudflare Pages →](/sk/self-hosting/cloudflare#konfiguracny-subor) (súbor `_headers`)
- [Netlify →](/sk/self-hosting/netlify#konverzia-word-odt-excel-do-pdf-sa-zasekne-na-55) (`netlify.toml`)
- [Vercel →](/sk/self-hosting/vercel#konverzia-word-odt-excel-do-pdf-nefunguje) (`vercel.json`)
- [Hostinger →](/sk/self-hosting/hostinger#nastroje-libreoffice-nefunguju) (`.htaccess`)
- [Kubernetes →](/sk/self-hosting/kubernetes#ako-zabezpecit-aby-hlavicky-sharedarraybuffer-stale-fungovali-ingress-gateway)
- **Docker**: rieši sa automaticky pribalenou konfiguráciou nginx, nie je potrebný žiadny zásah.

**Overenie**: otvorte konzolu DevTools na ľubovoľnej stránke BentoPDF a spustite:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Ak je stránka na HTTPS alebo `http://localhost` A ZÁROVEŇ sú na každej odpovedi prítomné obe hlavičky COEP/COOP, obe kontroly prejdú. Ak ste na `http://192.168.x.x` alebo inom HTTP pôvode mimo loopback, zabezpečte ho cez HTTPS, riešenie len pomocou hlavičiek neexistuje.

### Súbory `.mjs` sa poskytujú ako `application/octet-stream`

**Príznak**: Podpísať PDF / Vyplňovač formulárov / niektoré ďalšie nástroje zobrazia prázdny prehliadač alebo sa nenačítajú. Konzola prehliadača hlási:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Príčina**: Váš webový server alebo reverzný proxy nemá mapovanie MIME typu pre súbory `.mjs` (pribalený PDF prehliadač dodáva ES moduly s touto príponou). Mnohé štandardné konfigurácie serverov používajú pre neznáme prípony predvolene `application/octet-stream` a prehliadače ich odmietnu spustiť ako ES moduly.

**Riešenie**: presný úryvok nájdete v príručke nasadenia pre vašu platformu:

- [Nginx →](/sk/self-hosting/nginx#podpisat-pdf-alebo-vyplnovac-formularov-zobrazuje-prazdny-prehliadac-chyba-mime-mjs)
- [Apache →](/sk/self-hosting/apache#podpisat-pdf-alebo-vyplnanie-formularov-zobrazuje-prazdny-prehliadac-chyba-mime-pri-mjs)
- [AWS S3 + CloudFront →](/sk/self-hosting/aws#krok-2-zostavenie-a-nahranie) (pozri `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/sk/self-hosting/kubernetes#chyby-mime-typu-mjs-prazdny-iframe-v-podpisat-pdf-vyplnovac-formularov)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: rieši sa automaticky, nie je potrebný žiadny zásah.

**Overenie**: otvorte DevTools → kartu Network, nájdite zlyhávajúcu požiadavku `.mjs` a skontrolujte hlavičku odpovede `Content-Type`. Mala by byť `application/javascript`. Ak je stále `application/octet-stream`, typ môže znova určovať vonkajší reverzný proxy alebo CDN, skontrolujte každú vrstvu v reťazci.

## Konfigurácia WASM (komponenty AGPL)

BentoPDF **nepribaľuje** knižnice na spracovanie pod licenciou AGPL do svojho zdrojového kódu, ale **má predkonfigurované URL adresy CDN**, takže všetky funkcie fungujú hneď po inštalácii, bez ručného nastavovania.

::: tip Predvolene bez konfigurácie
Od verzie v2.0.0 sú WASM moduly predkonfigurované tak, aby sa načítavali z CDN jsDelivr cez premenné prostredia. Všetky pokročilé funkcie fungujú okamžite bez akejkoľvek konfigurácie zo strany používateľa.
:::

| Komponent       | Licencia | Funkcie                                                             |
| --------------- | -------- | ------------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | Konverzia EPUB/MOBI/FB2/XPS, extrakcia obrázkov, extrakcia tabuliek |
| **Ghostscript** | AGPL-3.0 | Konverzia do PDF/A, kompresia, vyrovnanie, rasterizácia             |
| **CoherentPDF** | AGPL-3.0 | Obsah, prílohy, spájanie PDF so záložkami                           |

### Predvolené premenné prostredia

Sú nastavené v `.env.production` a zapečené do zostavenia:

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

### Prepísanie URL adries WASM

Pre vlastné nasadenia môžete predvolené hodnoty prepísať pri zostavení:

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

Ak chcete modul úplne vypnúť (vyžaduje ručnú konfiguráciu používateľom v Pokročilých nastaveniach), nastavte jeho premennú na prázdny reťazec.

Pre OCR buď nechajte všetky premenné `VITE_TESSERACT_*` prázdne a ponechajte predvolené online zdroje, alebo nastavte URL pre worker/core/lang spolu pre vlastné hostované / offline OCR. Ak pribalíte len konkrétne jazyky OCR, nastavte aj `VITE_TESSERACT_AVAILABLE_LANGUAGES` na rovnaké kódy oddelené čiarkami, aby rozhranie ponúkalo len nainštalované jazyky a nepodporovaný výber zlyhal s popisnou chybou. Pre úplne offline výstup prehľadávateľného PDF nastavte aj `VITE_OCR_FONT_BASE_URL` na interný adresár, ktorý poskytuje pribalené OCR písma.

Používatelia môžu tieto predvolené hodnoty kedykoľvek prepísať aj v **Pokročilých nastaveniach** v rozhraní: používateľské nastavenia uložené v prehliadači majú prednosť pred predvolenými hodnotami prostredia.

### Nasadenie v izolovanej sieti (air-gapped) / offline

Pre siete bez prístupu na internet (štátna správa, zdravotníctvo, financie atď.). URL adresy WASM sa zapečú do JavaScriptu **pri zostavení**, samotné WASM súbory sťahuje **prehliadač používateľa** za behu. Preto musíte všetko pripraviť na počítači s internetom a potom to preniesť do izolovanej siete.

#### Automatizovaný skript (odporúčané)

Priložený skript `prepare-airgap.sh` automatizuje celý proces: stiahne WASM balíky, zostaví Docker obraz a vytvorí samostatný balík s inštalačným skriptom.

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

Vznikne adresár s balíkom:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Preneste balík do izolovanej siete cez USB, interný repozitár artefaktov alebo schválenou metódou. Potom spustite priložený inštalačný skript:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Inštalačný skript načíta Docker obraz, rozbalí WASM súbory a voliteľne spustí kontajner.

**Možnosti skriptu:**

| Prepínač                       | Popis                                                | Predvolené                        |
| ------------------------------ | ---------------------------------------------------- | --------------------------------- |
| `--wasm-base-url <url>`        | Kde budú WASM súbory interne hostované               | _(povinné, ak chýba, vyžiada sa)_ |
| `--image-name <name>`          | Tag Docker obrazu                                    | `bentopdf`                        |
| `--output-dir <path>`          | Výstupný adresár balíka                              | `./bentopdf-airgap-bundle`        |
| `--simple-mode`                | Zapnúť Simple Mode                                   | vypnuté                           |
| `--base-url <path>`            | Základná URL podadresára (napr. `/pdf/`)             | `/`                               |
| `--language <code>`            | Predvolený jazyk rozhrania (napr. `fr`, `de`)        | _(žiadne)_                        |
| `--brand-name <name>`          | Vlastný názov značky                                 | _(žiadne)_                        |
| `--brand-logo <path>`          | Cesta k logu relatívne k `public/`                   | _(žiadne)_                        |
| `--footer-text <text>`         | Vlastný text päty                                    | _(žiadne)_                        |
| `--ocr-languages <list>`       | Jazyky OCR na pribalenie, oddelené čiarkami          | `eng`                             |
| `--list-ocr-languages`         | Vypíše podporované kódy a názvy OCR a skončí         | vypnuté                           |
| `--search-ocr-language <term>` | Vyhľadá kódy OCR podľa názvu alebo skratky           | vypnuté                           |
| `--dockerfile <path>`          | Použitý Dockerfile                                   | `Dockerfile`                      |
| `--skip-docker`                | Preskočiť zostavenie a export Docker obrazu          | vypnuté                           |
| `--skip-wasm`                  | Preskočiť sťahovanie WASM (použiť existujúce `.tgz`) | vypnuté                           |

Interaktívna výzva prijíma aj `list` na vypísanie celého zoznamu podporovaných kódov Tesseract a `search <term>` na hľadanie zhôd, napríklad `search german` alebo `search chi`.

::: warning Požiadavka na rovnaký pôvod
WASM súbory musia byť poskytované z **rovnakého pôvodu** ako aplikácia BentoPDF. Web Workers používajú `importScripts()`, ktorý nedokáže načítať skripty z iného pôvodu. Ak napríklad BentoPDF beží na `https://internal.example.com`, základná URL pre WASM by mala byť tiež `https://internal.example.com/wasm`.
:::

#### Ručný postup

<details>
<summary>Ak to chcete urobiť ručne bez skriptu</summary>

**Krok 1: Stiahnite balíky WASM a OCR** (na počítači s internetom)

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

**Krok 2: Zostavte Docker obraz s internými URL adresami**

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

**Krok 3: Exportujte Docker obraz**

```bash
docker save bentopdf -o bentopdf.tar
```

**Krok 4: Preneste súbory do izolovanej siete**

Skopírujte cez USB, interný repozitár artefaktov alebo schválenou metódou prenosu:

- `bentopdf.tar`: Docker obraz
- Päť balíkov WASM/OCR `.tgz` z kroku 1
- Adresár `tesseract-langdata/` z kroku 1
- Adresár `ocr-fonts/` z kroku 1

**Krok 5: Nastavenie v izolovanej sieti**

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

Uistite sa, že súbory sú dostupné na URL adresách nastavených v kroku 2 vrátane `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` a `.../ocr/fonts`.

</details>

::: info Zostavujete zo zdrojového kódu namiesto Docker?
Pred spustením `npm run build` nastavte premenné v `.env.production`:

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

### Hostovanie vlastného WASM proxy

Ak potrebujete poskytovať AGPL WASM súbory so správnymi hlavičkami CORS, môžete nasadiť jednoduchý proxy. Príklad implementácie nájdete v [príručke Cloudflare WASM Proxy](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md).

::: tip Prečo oddelene?
Toto oddelenie zaručuje:

- Jasný súlad s licenciami pre komerčných používateľov
- Jadro BentoPDF zostáva pod duálnou licenciou (AGPL-3.0 / komerčná)
- WASM súbory sa načítavajú za behu, nie sú pribalené v zdrojovom kóde
  :::

## Systémové požiadavky

| Požiadavka | Minimum                          |
| ---------- | -------------------------------- |
| Úložisko   | ~100 MB (jadro bez modulov AGPL) |
| RAM        | 512 MB                           |
| CPU        | Akýkoľvek moderný procesor       |

::: tip
BentoPDF je statický web, nepotrebuje žiadnu databázu ani backendový server!
:::
