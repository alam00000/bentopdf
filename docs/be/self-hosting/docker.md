# Разгортванне з Docker / Podman

Самы просты спосаб размясціць BentoPDF у сябе ў працоўным асяроддзі.

> [!IMPORTANT]
> **Неабходныя загалоўкі для канвертацыі офісных файлаў**
>
> Інструменты на аснове LibreOffice (канвертацыя Word, Excel, PowerPoint) патрабуюць гэтых HTTP-загалоўкаў для падтрымкі `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Старонка таксама павінна аддавацца ў бяспечным кантэксце. `http://localhost` падыходзіць для лакальнага тэсціравання, але `http://192.168.x.x` і іншыя IP-адрасы лакальнай сеткі звычайна не, таму канвертацыя офісных файлаў праз звычайны HTTP не спрацуе нават пры наяўнасці загалоўкаў.
>
> Афіцыйныя вобразы кантэйнераў уключаюць гэтыя загалоўкі. Калі вы выкарыстоўваеце зваротны проксі (Traefik, Caddy і г.д.), пераканайцеся, што гэтыя загалоўкі захоўваюцца або дадаюцца, і выкарыстоўвайце HTTPS для доступу не праз loopback.

> [!TIP]
> **Карыстальнікам Podman:** усе каманды `docker` працуюць з Podman, калі замяніць `docker` на `podman`, а `docker-compose` на `podman-compose`.

## Хуткі старт

> [!TIP]
> BentoPDF пастаўляецца ў дзвюх зборках:
>
> - **Self-Hosted build**: `ghcr.io/alam00000/bentopdf-simple:latest`. Усе інструменты PDF **без** маркетынгавага афармлення (без галоўнага блока, FAQ, водгукаў, футэра). Выкарыстоўвайце яе для ўнутраных, камандных і арганізацыйных разгортванняў. Гэта **не** скарочаная "lite" версія.
> - **Commercial build**: `ghcr.io/alam00000/bentopdf:latest`. Поўны маркетынгавы сайт, які выкарыстоўвае сам bentopdf.com і ўладальнікі камерцыйнай ліцэнзіі для публічных разгортванняў.
>
> Калі сумняваецеся, выкарыстоўвайце Self-Hosted build.

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

Стварыце `docker-compose.yml`:

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

Запусціце:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Зборка ўласнага вобраза

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

Збярыце і запусціце:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Зменныя асяроддзя

| Зменная                              | Апісанне                                                                                                                                                                | Па змаўчанні                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Зборка варыянта Self-Hosted (хавае маркетынгавае афармленне bentopdf.com: галоўны блок, FAQ, водгукі, футэр). Усе інструменты PDF застаюцца.                            | `false`                                                        |
| `BASE_URL`                           | Разгортванне ў падкаталог                                                                                                                                               | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL модуля PyMuPDF WASM                                                                                                                                                 | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL модуля Ghostscript WASM                                                                                                                                             | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL модуля CoherentPDF WASM                                                                                                                                             | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL скрыпта воркера OCR                                                                                                                                                 | _(пуста; CDN Tesseract.js па змаўчанні)_                       |
| `VITE_TESSERACT_CORE_URL`            | Каталог асноўнага асяроддзя выканання OCR                                                                                                                               | _(пуста; CDN Tesseract.js па змаўчанні)_                       |
| `VITE_TESSERACT_LANG_URL`            | Каталог traineddata OCR                                                                                                                                                 | _(пуста; CDN Tesseract.js па змаўчанні)_                       |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Мовы OCR праз коску, даступныя ў інтэрфейсе                                                                                                                             | _(пуста; поўны каталог)_                                       |
| `VITE_OCR_FONT_BASE_URL`             | Каталог шрыфтоў тэкставага слоя OCR                                                                                                                                     | _(пуста; аддаленыя URL шрыфтоў Noto)_                          |
| `VITE_DEFAULT_LANGUAGE`              | Мова інтэрфейсу па змаўчанні                                                                                                                                            | `en`                                                           |
| `VITE_BRAND_NAME`                    | Уласная назва брэнда                                                                                                                                                    | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Шлях да лагатыпа адносна `public/`                                                                                                                                      | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Уласны тэкст футэра/аўтарскіх правоў                                                                                                                                    | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | ID інструментаў праз коску, якія трэба схаваць                                                                                                                          | _(пуста; усе інструменты ўключаны)_                            |
| `DISABLE_GITHUB_STARS`               | Не загружаць колькасць зорак GitHub пры загрузцы старонкі і прыбраць `api.github.com` з CSP. Зборкі Simple Mode заўсёды гэта прапускаюць.                               | `false`                                                        |
| `SITE_URL`                           | Публічны URL для спасылак canonical, hreflang і sitemap. Пакіньце значэнне па змаўчанні, калі не хочаце, каб пошукавыя сістэмы лічылі ваша разгортванне асобным сайтам. | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | З уласным `SITE_URL` кожная старонка пазначаецца `noindex`, каб ваша копія не канкурыравала з bentopdf.com у выніках пошуку. Задайце `true`, каб дазволіць індэксацыю.  | `false`                                                        |

URL модуляў WASM загадзя настроены на CDN па змаўчанні: усе пашыраныя функцыі працуюць адразу. Перавызначце іх для ізаляваных або ўласных разгортванняў.

### Пошукавыя сістэмы

Па змаўчанні кожная старонка паказвае пошукавым сістэмам bentopdf.com як арыгінал, таму ваша разгортванне не з'яўляецца як дублікат. Для прыватнага або ўнутранага экзэмпляра нічога мяняць не трэба.

- **Цалкам выключыць экзэмпляр з вынікаў пошуку:** запусціце кантэйнер з `-e ROBOTS_NOINDEX=true`. Патрэбны толькі перазапуск, без перазборкі.
- **Зрабіць экзэмпляр асобным сайтам у выніках пошуку:** збярыце з `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Без `ALLOW_INDEXING=true` уласны `SITE_URL` пазначае кожную старонку як `noindex`.

### Content-Security-Policy

Вобраз nginx пастаўляецца з актыўным загалоўкам `Content-Security-Policy`. Дырэктывы CSP `script-src`, `connect-src` і `font-src` **генеруюцца падчас зборкі** з URL-зменных `VITE_*` вышэй: усе хасты, перададзеныя праз `--build-arg`, аўтаматычна дадаюцца ў палітыку.

У выніку:

- Калі вы перавызначаеце `VITE_CORS_PROXY_URL` або `VITE_WASM_*_URL` падчас зборкі, CSP аўтаматычна дазваляе гэтыя крыніцы, дадатковая наладка не патрэбна.
- Для URL на `cdn.jsdelivr.net` `script-src` дазваляе толькі дакладную тэчку пакета з версіяй, напрыклад `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, а не ўвесь CDN. jsDelivr аддае любы публічны пакет npm або рэпазіторый GitHub, таму дазвол на ўвесь хост дазволіў бы любому з іх выконвацца ў вашым экзэмпляры. URL на іншых хастах дазваляюцца па крыніцы (origin).
- Калі вы наладжваеце ўласныя URL WASM _падчас выканання_ на старонцы пашыраных налад праграмы, гэтых крыніц **няма** ў CSP, і браўзер заблакіруе запыты да іх. Гэта датычыцца і іншай версіі таго ж пакета на `cdn.jsdelivr.net`, бо дазволена толькі версія, зададзеная падчас зборкі. Наладка падчас выканання прызначана для эксперыментаў; для пастаянных уласных URL задайце адпаведны build arg `VITE_*`.
- У ізаляваных разгортваннях, якія перавызначаюць усе тры значэнні `VITE_WASM_*_URL`, гэтыя тэчкі пакетаў `cdn.jsdelivr.net` таксама выдаляюцца з CSP (кожнае значэнне па змаўчанні замяняецца, а не дапаўняецца). Значэнні Tesseract OCR па змаўчанні на `cdn.jsdelivr.net` застаюцца ў палітыцы, пакуль вы не зададзіце і тры значэнні `VITE_TESSERACT_*`. Аналагічна, `VITE_CORS_PROXY_URL` замяняе публічнае значэнне па змаўчанні `bentopdf-cors-proxy.bentopdf.workers.dev`.

CSP уключае `'unsafe-eval'` у `script-src`, бо асяроддзе выканання LibreOffice WASM (выкарыстоўваецца інструментамі канвертацыі Word/Excel/PowerPoint) і бібліятэка відарысаў wasm-vips (выкарыстоўваецца PDF у TIFF) кампілююць унутраны код дыспетчарызацыі праз `new Function()`. Яго выдаленне зламае гэтыя інструменты. Калі вы збіраеце ў `SIMPLE_MODE` (без LibreOffice) і вам не патрэбны PDF у TIFF, можна ўручную адрэдагаваць згенераваны `security-headers.conf` і прыбраць `'unsafe-eval'` для больш строгай палітыкі.

Для OCR пакіньце зменныя `VITE_TESSERACT_*` пустымі, каб выкарыстоўваць анлайн-рэсурсы па змаўчанні, або задайце ўсе тры разам для ўласнага/аўтаномнага OCR. Частковыя перавызначэнні OCR адхіляюцца, бо воркер, асноўнае асяроддзе выканання і каталог traineddata павінны адпавядаць адно аднаму. Для цалкам аўтаномнага PDF з магчымасцю пошуку таксама задайце `VITE_OCR_FONT_BASE_URL`, каб шрыфты тэкставага слоя OCR загружаліся з вашага ўнутранага сервера, а не з публічных URL шрыфтоў Noto.

`VITE_DEFAULT_LANGUAGE` задае мову інтэрфейсу для новых наведвальнікаў. Падтрымліваемыя значэнні: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Карыстальнікі ўсё роўна могуць пераключаць мову, гэта змяняе толькі значэнне па змаўчанні.

Прыклад:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Уласны брэндынг

Замяніце лагатып, назву і тэкст футэра BentoPDF па змаўчанні на свае. Змясціце файл лагатыпа ў тэчку `public/` (або выкарыстайце існуючы відарыс), затым перадайце зменныя брэндынгу падчас зборкі:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Брэндынг працуе і ў поўным рэжыме, і ў Simple Mode, і можа спалучацца з усімі іншымі параметрамі зборкі.

### Адключэнне асобных інструментаў

Хавайце інструменты з інтэрфейсу дзеля адпаведнасці патрабаванням або бяспекі. Адключаныя інструменты выдаляюцца з галоўнай старонкі, вынікаў пошуку, спалучэнняў клавіш і канструктара працоўных працэсаў. Пры прамым пераходзе па URL паказваецца старонка "інструмент недаступны".

ID інструмента гэта URL старонкі без `.html`. Напрыклад, калі інструмент знаходзіцца па адрасе `bentopdf.com/edit-pdf.html`, яго ID `edit-pdf`.

#### Як знайсці ID інструментаў

Самы просты спосаб: адкрыйце любы інструмент у BentoPDF і паглядзіце на URL. Апошняя частка шляху (без `.html`) і ёсць ID інструмента.

<details>
<summary>Поўны спіс ID інструментаў</summary>

**Рэдагаванне і анатацыі:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Канвертаваць у PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Канвертаваць з PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Арганізацыя і кіраванне:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Аптымізацыя і аднаўленне:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Бяспека:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Варыянт 1: Падчас зборкі (Docker build arg)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Спіс адключаных інструментаў убудоўваецца ў JavaScript-бандл. Для змены патрэбна перазборка.

#### Варыянт 2: Падчас выканання (config.json)

Падключыце файл `config.json` у каталог, які аддаецца серверам, перазборка не патрэбна:

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

Або з Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Абодва спосабы можна спалучаць: спісы аб'ядноўваюцца. Калі інструмент ёсць хоць у адным, ён адключаны.

#### Адключэнне функцый рэдактара

Вы таксама можаце адключыць асобныя функцыі ў Рэдактары PDF (напрыклад, рэдагаванне канфідэнцыйных даных, анатацыі, формы), не адключаючы ўвесь інструмент. Дадайце `editorDisabledCategories` у ваш `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Поўны спіс катэгорый рэдактара</summary>

**Маштаб:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Анатацыі:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Фігуры:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Формы:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Рэдагаванне даных:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Дакумент:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Старонка:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Панэль:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Інструменты:** `tools`, `pan`, `pointer`, `capture`

**Вылучэнне:** `selection`, `selection-copy`

**Гісторыя:** `history`, `history-undo`, `history-redo`

</details>

Катэгорыі іерархічныя: адключэнне бацькоўскай (напрыклад, `annotation`) адключае ўсе даччыныя.

### Адключэнне лічыльніка зорак GitHub

Панэль навігацыі паказвае актуальную колькасць зорак GitHub, якая загружаецца з `api.github.com` пры загрузцы старонкі. Гэта адзіны знешні запыт, не звязаны з функцыямі PDF. Адключыце яго падчас зборкі, каб выдаліць код запыту з бандла і прыбраць `api.github.com` з Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Зборкі Simple Mode (`bentopdf-simple`) заўсёды прапускаюць лічыльнік зорак; гэты сцяг патрэбны толькі для Commercial build або ўласных поўных зборак.

### Уласныя URL WASM (ізаляваныя / уласныя разгортванні)

> [!IMPORTANT]
> URL WASM убудоўваюцца ў JavaScript **падчас зборкі**. Файлы WASM спампоўвае **браўзер карыстальніка** падчас выканання, Docker не спампоўвае іх падчас зборкі. Для ізаляваных сетак вы павінны размясціць файлы WASM на ўнутраным серверы, даступным для браўзераў.

**Поўны працэс для ізаляванай сеткі:**

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

Для `--ocr-languages` выкарыстоўвайце коды, якія выводзіць `bash scripts/prepare-airgap.sh --list-ocr-languages`, або шукайце па назве з `bash scripts/prepare-airgap.sh --search-ocr-language <term>`. Калі збіраеце з абмежаваным наборам моў OCR, перадайце тыя ж коды ў `VITE_TESSERACT_AVAILABLE_LANGUAGES`, каб праграма паказвала толькі ўключаныя мовы. Для цалкам аўтаномнага OCR таксама размясціце ўбудаваны каталог `ocr-fonts/` і ўкажыце на яго ў `VITE_OCR_FONT_BASE_URL`.

Задайце зменнай пусты радок, каб адключыць адпаведны модуль (карыстальнікам давядзецца наладзіць яго ўручную ў пашыраных наладах).

## Уласны порт

Па змаўчанні BentoPDF слухае порт `8080` унутры кантэйнера. Каб змяніць яго, задайце зменную асяроддзя `PORT` пры запуску:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Зменная | Апісанне                | Па змаўчанні |
| ------- | ----------------------- | ------------ |
| `PORT`  | Порт Nginx у кантэйнеры | `8080`       |

Гэта працуе і са стандартным, і з nonroot Dockerfile.

## Уласны ID карыстальніка (PUID/PGID)

Для асяроддзяў, дзе патрабуецца запуск ад пэўнага карыстальніка без правоў root (NAS-прылады, Kubernetes з security contexts, палітыкі арганізацыі), BentoPDF мае асобны Dockerfile з падтрымкай PUID/PGID у стылі LSIO.

### Зборка і запуск

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

### Зменныя асяроддзя

| Зменная        | Апісанне                      | Па змаўчанні |
| -------------- | ----------------------------- | ------------ |
| `PUID`         | ID карыстальніка для запуску  | `1000`       |
| `PGID`         | ID групы для запуску          | `1000`       |
| `PORT`         | Порт Nginx                    | `8080`       |
| `DISABLE_IPV6` | Адключыць праслухоўванне IPv6 | `false`      |

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

### Як гэта працуе

Кантэйнер запускаецца ад root, стварае карыстальніка з зададзенымі PUID/PGID, змяняе ўладальніка ўсіх каталогаў з правам запісу, затым скідае прывілеі з дапамогай `su-exec`. Працэс nginx цалкам працуе ад указанага вамі карыстальніка.

> [!NOTE]
> Стандартны `Dockerfile` выкарыстоўвае `nginx-unprivileged` (UID 101) і рэкамендуецца для большасці разгортванняў. Выкарыстоўвайце `Dockerfile.nonroot`, толькі калі вам патрэбны пэўны UID/GID.

> [!WARNING]
> PUID/PGID не можа быць `0` (root). Entrypoint правярае ўваходныя даныя і завяршаецца з памылкай пры няправільных значэннях.

## З Traefik (зваротны проксі)

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

## З Caddy (зваротны проксі)

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

## Ліміты рэсурсаў

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

## Podman Quadlet (інтэграцыя з systemd)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) дазваляе запускаць кантэйнеры Podman як сэрвісы systemd. Гэта ідэальна для працоўных разгортванняў на Linux.

### Базавая наладка Quadlet

Стварыце файл юніта кантэйнера ў `~/.config/containers/systemd/bentopdf.container` (карыстальнік) або `/etc/containers/systemd/bentopdf.container` (сістэма):

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

### Уключэнне і запуск

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
> Для агульнасістэмнага разгортвання выкарыстоўвайце `systemctl` без сцяга `--user` і змясціце файл у `/etc/containers/systemd/`.

### Quadlet з праверкай стану

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

### Аўтаабнаўленне з Quadlet

Podman можа аўтаматычна абнаўляць кантэйнеры, калі з'яўляюцца новыя вобразы:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Сеткавая канфігурацыя Quadlet

Для ўласнай сеткавай канфігурацыі стварыце сеткавы файл `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Затым спашліцеся на яго ў файле кантэйнера:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Абнаўленне

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
