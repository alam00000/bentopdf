# Розгортання з Docker / Podman

Найпростіший спосіб самостійно розгорнути BentoPDF у робочому середовищі.

> [!IMPORTANT]
> **Обов'язкові заголовки для конвертації офісних файлів**
>
> Інструменти на основі LibreOffice (конвертація Word, Excel, PowerPoint) потребують таких HTTP-заголовків для підтримки `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Сторінка також має віддаватися з безпечного контексту. `http://localhost` підходить для локального тестування, але `http://192.168.x.x` та інші LAN-адреси зазвичай не відповідають вимогам, тому конвертація Office через звичайний HTTP не працюватиме, навіть якщо заголовки присутні.
>
> Офіційні образи контейнерів містять ці заголовки. Якщо ви використовуєте зворотний проксі (Traefik, Caddy тощо), переконайтеся, що ці заголовки зберігаються або додаються, і використовуйте HTTPS для доступу не з loopback.

> [!TIP]
> **Користувачам Podman:** усі команди `docker` працюють з Podman, якщо замінити `docker` на `podman`, а `docker-compose` на `podman-compose`.

## Швидкий старт

> [!TIP]
> BentoPDF постачається у двох збірках:
>
> - **Self-Hosted build**: `ghcr.io/alam00000/bentopdf-simple:latest`. Усі PDF-інструменти, **без** маркетингових елементів (без головного екрана, FAQ, відгуків і футера). Використовуйте для внутрішніх розгортань у командах і організаціях. Це **не** урізана "lite"-версія.
> - **Commercial build**: `ghcr.io/alam00000/bentopdf:latest`. Повний маркетинговий сайт, який використовує сам bentopdf.com і власники комерційної ліцензії для публічних розгортань.
>
> Якщо вагаєтеся, беріть Self-Hosted build.

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

Створіть `docker-compose.yml`:

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

Запустіть:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Збірка власного образу

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

Зберіть і запустіть:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Змінні середовища

| Змінна                               | Опис                                                                                                                                                                              | Типове значення                                                |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Зібрати варіант Self-Hosted (ховає маркетингові елементи bentopdf.com: головний екран, FAQ, відгуки, футер). Усі PDF-інструменти залишаються.                                     | `false`                                                        |
| `BASE_URL`                           | Розгортання в підкаталозі                                                                                                                                                         | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL модуля PyMuPDF WASM                                                                                                                                                           | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL модуля Ghostscript WASM                                                                                                                                                       | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL модуля CoherentPDF WASM                                                                                                                                                       | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL скрипта OCR worker                                                                                                                                                            | _(порожньо; CDN Tesseract.js за замовчуванням)_                |
| `VITE_TESSERACT_CORE_URL`            | Каталог основного runtime OCR                                                                                                                                                     | _(порожньо; CDN Tesseract.js за замовчуванням)_                |
| `VITE_TESSERACT_LANG_URL`            | Каталог traineddata OCR                                                                                                                                                           | _(порожньо; CDN Tesseract.js за замовчуванням)_                |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Мови OCR через кому, що відображаються в інтерфейсі                                                                                                                               | _(порожньо; показати повний каталог)_                          |
| `VITE_OCR_FONT_BASE_URL`             | Каталог шрифтів текстового шару OCR                                                                                                                                               | _(порожньо; використовувати віддалені URL шрифтів Noto)_       |
| `VITE_DEFAULT_LANGUAGE`              | Типова мова інтерфейсу                                                                                                                                                            | `en`                                                           |
| `VITE_BRAND_NAME`                    | Власна назва бренду                                                                                                                                                               | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Шлях до логотипа відносно `public/`                                                                                                                                               | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Власний текст футера/авторських прав                                                                                                                                              | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | ID інструментів через кому, які потрібно сховати                                                                                                                                  | _(порожньо; усі інструменти ввімкнено)_                        |
| `DISABLE_GITHUB_STARS`               | Пропустити отримання кількості зірок GitHub під час завантаження сторінки та прибрати `api.github.com` із CSP. Збірки Simple Mode завжди це пропускають.                          | `false`                                                        |
| `SITE_URL`                           | Публічний URL, що записується в canonical, hreflang і посилання sitemap. Залиште типовим, якщо не хочете, щоб пошукові системи сприймали ваше розгортання як окремий сайт.        | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | Із власним `SITE_URL` кожну сторінку позначено `noindex`, щоб ваша копія не конкурувала з bentopdf.com у пошуку. Задайте `true`, щоб дозволити пошуковим системам її індексувати. | `false`                                                        |

URL модулів WASM попередньо налаштовано з типовими значеннями CDN, тому всі розширені функції працюють одразу. Перевизначте їх для ізольованих (air-gapped) або самостійно розгорнутих середовищ.

### Пошукові системи

За замовчуванням кожна сторінка вказує пошуковим системам на bentopdf.com як на оригінал, тож ваше розгортання не з'являється як дублікат. Для приватного чи внутрішнього екземпляра нічого змінювати не потрібно.

- **Повністю сховати екземпляр із результатів пошуку:** запустіть контейнер із `-e ROBOTS_NOINDEX=true`. Для цього потрібен лише перезапуск, без перезбирання.
- **Зробити екземпляр окремим сайтом у результатах пошуку:** зберіть із `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Без `ALLOW_INDEXING=true` власний `SITE_URL` позначає кожну сторінку як `noindex`.

### Content-Security-Policy

Образ nginx постачається із заголовком `Content-Security-Policy` у режимі примусового застосування. Директиви CSP `script-src`, `connect-src` і `font-src` **генеруються під час збірки** зі змінних URL `VITE_*` вище: усі хости, які ви передаєте через `--build-arg`, автоматично додаються до політики.

Отже:

- Якщо ви перевизначаєте `VITE_CORS_PROXY_URL` або `VITE_WASM_*_URL` під час збірки, CSP автоматично дозволяє ці origin, додаткове налаштування не потрібне.
- Для URL на `cdn.jsdelivr.net` `script-src` дозволяє лише точну версійну папку пакета, наприклад `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, а не весь CDN. jsDelivr віддає будь-який публічний пакет npm або репозиторій GitHub, тож дозвіл усього хоста дав би змогу запускати будь-який із них на вашому екземплярі. URL на будь-яких інших хостах дозволяються за origin.
- Якщо ви налаштовуєте власні URL WASM під час _роботи_ через сторінку «Додаткові налаштування» у застосунку, ці origin **не** потрапляють до CSP, і браузер блокуватиме запити до них. Це також стосується іншої версії того самого пакета на `cdn.jsdelivr.net`, бо дозволено лише версію, задану під час збірки. Налаштування під час роботи призначене для експериментів; для постійних власних URL задайте відповідний build arg `VITE_*`.
- Ізольовані розгортання, що перевизначають усі три значення `VITE_WASM_*_URL`, також позбуваються цих папок пакетів `cdn.jsdelivr.net` у CSP (кожне типове значення замінюється, а не доповнюється). Типові значення Tesseract OCR на `cdn.jsdelivr.net` залишаються в політиці, доки ви також не задасте три значення `VITE_TESSERACT_*`. Так само задання `VITE_CORS_PROXY_URL` замінює публічне типове значення `bentopdf-cors-proxy.bentopdf.workers.dev`.

CSP містить `'unsafe-eval'` у `script-src`, тому що runtime LibreOffice WASM (використовується інструментами конвертації Word/Excel/PowerPoint) і бібліотека зображень wasm-vips (використовується для PDF у TIFF) компілюють внутрішній диспетчерський код через `new Function()`. Його видалення зламало б ці інструменти. Якщо ви збираєте в `SIMPLE_MODE` (без LibreOffice) і не потребуєте PDF у TIFF, можна вручну відредагувати згенерований `security-headers.conf`, прибравши `'unsafe-eval'` для суворішої політики.

Для OCR залиште змінні `VITE_TESSERACT_*` порожніми, щоб використовувати типові онлайн-ресурси, або задайте всі три разом для самостійного/офлайн OCR. Часткові перевизначення OCR відхиляються, бо worker, основний runtime і каталог traineddata мають збігатися. Для повністю офлайн-виводу пошукового PDF також задайте `VITE_OCR_FONT_BASE_URL`, щоб шрифти текстового шару OCR завантажувалися з вашого внутрішнього сервера, а не з публічних URL шрифтів Noto.

`VITE_DEFAULT_LANGUAGE` задає мову інтерфейсу для нових відвідувачів. Підтримувані значення: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Користувачі й далі можуть змінювати мову: це змінює лише типове значення.

Приклад:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Власний брендинг

Замініть типовий логотип BentoPDF, назву та текст футера на свої. Помістіть файл логотипа в папку `public/` (або використайте наявне зображення), а потім передайте змінні брендингу під час збірки:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Брендинг працює і в повному режимі, і в Simple Mode, і його можна поєднувати з усіма іншими параметрами збірки.

### Вимкнення окремих інструментів

Ховайте інструменти з інтерфейсу з міркувань відповідності вимогам або безпеки. Вимкнені інструменти прибираються з головної сторінки, результатів пошуку, клавіатурних скорочень і конструктора робочих процесів. Прямий доступ за URL показує сторінку "інструмент недоступний".

ID інструмента це URL сторінки без `.html`. Наприклад, якщо інструмент розташований за адресою `bentopdf.com/edit-pdf.html`, ID це `edit-pdf`.

#### Як знайти ID інструментів

Найпростіше: відкрийте будь-який інструмент у BentoPDF і подивіться на URL. Остання частина шляху (без `.html`) це ID інструмента.

<details>
<summary>Повний список ID інструментів</summary>

**Редагування й анотації:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Конвертація в PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Конвертація з PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Організація й керування:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Оптимізація й відновлення:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Безпека:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Варіант 1: під час збірки (build arg Docker)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Це вшиває список вимкнених інструментів у JavaScript-бандл. Для зміни потрібне перезбирання.

#### Варіант 2: під час роботи (config.json)

Змонтуйте файл `config.json` у каталог, що віддається, перезбирання не потрібне:

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

Обидва способи можна поєднувати: списки об'єднуються. Якщо інструмент є в будь-якому з них, його вимкнено.

#### Вимкнення функцій редактора

Ви також можете вимкнути окремі функції всередині PDF-редактора (наприклад, редагування (redaction), анотації, форми), не вимикаючи весь інструмент редактора. Додайте `editorDisabledCategories` до `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Повний список категорій редактора</summary>

**Масштаб:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Анотації:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Фігури:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Форми:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Приховування даних:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Документ:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Сторінка:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Панель:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Інструменти:** `tools`, `pan`, `pointer`, `capture`

**Виділення:** `selection`, `selection-copy`

**Історія:** `history`, `history-undo`, `history-redo`

</details>

Категорії ієрархічні: вимкнення батьківської (наприклад, `annotation`) вимикає всі її дочірні.

### Вимкнення лічильника зірок GitHub

Навігаційна панель показує актуальну кількість зірок GitHub, яку отримують з `api.github.com` під час завантаження сторінки. Це єдиний зовнішній запит, що не обслуговує жодну функцію PDF. Вимкніть його під час збірки, щоб прибрати код отримання з бандла та `api.github.com` із Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Збірки Simple Mode (`bentopdf-simple`) завжди пропускають лічильник зірок: цей прапорець потрібен лише для Commercial build або власних повних збірок.

### Власні URL WASM (ізольовані / самостійно розгорнуті середовища)

> [!IMPORTANT]
> URL WASM вшиваються в JavaScript **під час збірки**. Файли WASM завантажує **браузер користувача** під час роботи: Docker не завантажує їх під час збірки. Для ізольованих мереж потрібно розмістити файли WASM на внутрішньому сервері, доступному для браузерів.

**Повний процес для ізольованого середовища:**

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

Для `--ocr-languages` використовуйте коди, які виводить `bash scripts/prepare-airgap.sh --list-ocr-languages`, або шукайте за назвою через `bash scripts/prepare-airgap.sh --search-ocr-language <term>`. Коли ви збираєте з обмеженим набором мов OCR, передайте ті самі коди в `VITE_TESSERACT_AVAILABLE_LANGUAGES`, щоб застосунок показував лише вбудовані мови. Для повного офлайн-виводу OCR також розмістіть вбудований каталог `ocr-fonts/` і вкажіть на нього `VITE_OCR_FONT_BASE_URL`.

Задайте змінній порожній рядок, щоб вимкнути відповідний модуль (користувачі мають налаштувати його вручну через «Додаткові налаштування»).

## Власний порт

За замовчуванням BentoPDF слухає порт `8080` усередині контейнера. Щоб його змінити, задайте змінну середовища `PORT` під час запуску:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Змінна | Опис                                 | Типове значення |
| ------ | ------------------------------------ | --------------- |
| `PORT` | Порт, який слухає Nginx у контейнері | `8080`          |

Це працює і зі стандартним, і з nonroot Dockerfile.

## Власний ID користувача (PUID/PGID)

Для середовищ, які вимагають запуску від конкретного користувача без прав root (NAS-пристрої, Kubernetes із контекстами безпеки, організаційні політики), BentoPDF надає окремий Dockerfile з підтримкою PUID/PGID у стилі LSIO.

### Збірка і запуск

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

### Змінні середовища

| Змінна         | Опис                       | Типове значення |
| -------------- | -------------------------- | --------------- |
| `PUID`         | ID користувача для запуску | `1000`          |
| `PGID`         | ID групи для запуску       | `1000`          |
| `PORT`         | Порт, який слухає Nginx    | `8080`          |
| `DISABLE_IPV6` | Вимкнути слухача IPv6      | `false`         |

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

### Як це працює

Контейнер запускається від root, створює користувача із заданими PUID/PGID, налаштовує власника для всіх каталогів із правом запису, а потім скидає привілеї за допомогою `su-exec`. Процес nginx повністю працює від указаного вами користувача.

> [!NOTE]
> Стандартний `Dockerfile` використовує `nginx-unprivileged` (UID 101) і рекомендований для більшості розгортань. Використовуйте `Dockerfile.nonroot` лише тоді, коли потрібен конкретний UID/GID.

> [!WARNING]
> PUID/PGID не можуть бути `0` (root). Точка входу перевіряє вхідні дані та завершиться з помилкою для недійсних значень.

## З Traefik (зворотний проксі)

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

## З Caddy (зворотний проксі)

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

## Обмеження ресурсів

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

## Podman Quadlet (інтеграція із systemd)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) дає змогу запускати контейнери Podman як сервіси systemd. Це ідеально для робочих розгортань на системах Linux.

### Базове налаштування Quadlet

Створіть файл юніта контейнера в `~/.config/containers/systemd/bentopdf.container` (користувацький) або `/etc/containers/systemd/bentopdf.container` (системний):

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

### Увімкнення і запуск

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
> Для розгортання на рівні системи використовуйте `systemctl` без прапорця `--user` і помістіть файл у `/etc/containers/systemd/`.

### Quadlet із перевіркою стану

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

### Автоматичне оновлення з Quadlet

Podman може автоматично оновлювати контейнери, коли з'являються нові образи:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Налаштування мережі Quadlet

Для власної конфігурації мережі створіть файл мережі `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Потім послайтеся на нього у файлі контейнера:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Оновлення

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
