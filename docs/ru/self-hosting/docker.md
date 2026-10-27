# Развёртывание с Docker / Podman

Самый простой способ развернуть BentoPDF у себя в рабочей среде.

> [!IMPORTANT]
> **Обязательные заголовки для конвертации файлов Office**
>
> Инструментам на основе LibreOffice (конвертация Word, Excel, PowerPoint) для поддержки `SharedArrayBuffer` нужны такие HTTP-заголовки:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Страница также должна отдаваться из безопасного контекста. `http://localhost` подходит для локального тестирования, а `http://192.168.x.x` и другие адреса локальной сети обычно под это не подпадают, поэтому конвертация Office по обычному HTTP не сработает, даже если заголовки есть.
>
> Официальные образы контейнеров включают эти заголовки. Если вы используете обратный прокси (Traefik, Caddy и т. д.), убедитесь, что эти заголовки сохраняются или добавляются, и используйте HTTPS для доступа не через loopback.

> [!TIP]
> **Пользователям Podman:** все команды `docker` работают и с Podman, если заменить `docker` на `podman`, а `docker-compose` на `podman-compose`.

## Быстрый старт

> [!TIP]
> BentoPDF выпускается в двух сборках:
>
> - **Сборка Self-Hosted**: `ghcr.io/alam00000/bentopdf-simple:latest`. Все PDF-инструменты **без** маркетинговой обвязки (без главного экрана, FAQ, отзывов и подвала). Используйте её для внутренних, командных и корпоративных развёртываний. Это **не** урезанная «лёгкая» версия.
> - **Сборка Commercial**: `ghcr.io/alam00000/bentopdf:latest`. Полный маркетинговый сайт, который использует сам bentopdf.com и владельцы коммерческой лицензии для публичных развёртываний.
>
> Если сомневаетесь, берите сборку Self-Hosted.

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

Создайте `docker-compose.yml`:

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

Запустите:

```bash
# Docker Compose
docker compose up -d

# Podman Compose
podman-compose up -d
```

## Собственный образ

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

Соберите и запустите:

```bash
docker build -t bentopdf:custom .
docker run -d -p 3000:8080 bentopdf:custom
```

## Переменные окружения

| Переменная                           | Описание                                                                                                                                                                                 | По умолчанию                                                   |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `SIMPLE_MODE`                        | Собрать вариант Self-Hosted (скрывает маркетинговую обвязку bentopdf.com: главный экран, FAQ, отзывы, подвал). Все PDF-инструменты остаются.                                             | `false`                                                        |
| `BASE_URL`                           | Развёртывание в подкаталог                                                                                                                                                               | `/`                                                            |
| `VITE_WASM_PYMUPDF_URL`              | URL модуля PyMuPDF WASM                                                                                                                                                                  | `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/` |
| `VITE_WASM_GS_URL`                   | URL модуля Ghostscript WASM                                                                                                                                                              | `https://cdn.jsdelivr.net/npm/@bentopdf/gs-wasm@0.1.1/assets/` |
| `VITE_WASM_CPDF_URL`                 | URL модуля CoherentPDF WASM                                                                                                                                                              | `https://cdn.jsdelivr.net/npm/coherentpdf@2.5.5/dist/`         |
| `VITE_TESSERACT_WORKER_URL`          | URL скрипта воркера OCR                                                                                                                                                                  | _(пусто; CDN Tesseract.js по умолчанию)_                       |
| `VITE_TESSERACT_CORE_URL`            | Каталог основного рантайма OCR                                                                                                                                                           | _(пусто; CDN Tesseract.js по умолчанию)_                       |
| `VITE_TESSERACT_LANG_URL`            | Каталог traineddata для OCR                                                                                                                                                              | _(пусто; CDN Tesseract.js по умолчанию)_                       |
| `VITE_TESSERACT_AVAILABLE_LANGUAGES` | Языки OCR через запятую, показываемые в интерфейсе                                                                                                                                       | _(пусто; показать весь каталог)_                               |
| `VITE_OCR_FONT_BASE_URL`             | Каталог шрифтов текстового слоя OCR                                                                                                                                                      | _(пусто; удалённые URL шрифтов Noto)_                          |
| `VITE_DEFAULT_LANGUAGE`              | Язык интерфейса по умолчанию                                                                                                                                                             | `en`                                                           |
| `VITE_BRAND_NAME`                    | Своё название бренда                                                                                                                                                                     | `BentoPDF`                                                     |
| `VITE_BRAND_LOGO`                    | Путь к логотипу относительно `public/`                                                                                                                                                   | `images/favicon-no-bg.svg`                                     |
| `VITE_FOOTER_TEXT`                   | Свой текст подвала/копирайта                                                                                                                                                             | `© 2026 BentoPDF. All rights reserved.`                        |
| `DISABLE_TOOLS`                      | ID инструментов через запятую, которые нужно скрыть                                                                                                                                      | _(пусто; все инструменты включены)_                            |
| `DISABLE_GITHUB_STARS`               | Пропускать запрос числа звёзд GitHub при загрузке страницы и убирать `api.github.com` из CSP. Сборки Simple Mode всегда его пропускают.                                                  | `false`                                                        |
| `SITE_URL`                           | Публичный URL, записываемый в canonical, hreflang и ссылки sitemap. Оставьте значение по умолчанию, если не хотите, чтобы поисковые системы считали ваше развёртывание отдельным сайтом. | `https://www.bentopdf.com`                                     |
| `ALLOW_INDEXING`                     | При собственном `SITE_URL` каждая страница помечается `noindex`, чтобы ваша копия не конкурировала с bentopdf.com в поисковой выдаче. Задайте `true`, чтобы разрешить индексацию.        | `false`                                                        |

URL модулей WASM заранее настроены на значения CDN по умолчанию, поэтому все расширенные функции работают сразу. Переопределите их для изолированных (air-gapped) или самостоятельно размещаемых развёртываний.

### Поисковые системы

По умолчанию каждая страница указывает поисковым системам на bentopdf.com как на оригинал, поэтому ваше развёртывание не считается дубликатом. Для частного или внутреннего экземпляра ничего менять не нужно.

- **Полностью скрыть экземпляр из поисковой выдачи:** запустите контейнер с `-e ROBOTS_NOINDEX=true`. Нужен только перезапуск, пересборка не требуется.
- **Сделать экземпляр отдельным сайтом в поисковой выдаче:** соберите с `--build-arg SITE_URL=https://your-domain.example --build-arg ALLOW_INDEXING=true`. Без `ALLOW_INDEXING=true` собственный `SITE_URL` помечает каждую страницу как `noindex`.

### Content-Security-Policy

Образ nginx поставляется с действующим заголовком `Content-Security-Policy`. Директивы CSP `script-src`, `connect-src` и `font-src` **генерируются при сборке** из перечисленных выше переменных URL `VITE_*`: все хосты, которые вы передаёте через `--build-arg`, автоматически добавляются в политику.

Как следствие:

- Если вы переопределяете `VITE_CORS_PROXY_URL` или `VITE_WASM_*_URL` при сборке, CSP автоматически разрешает эти источники, дополнительная настройка не нужна.
- Для URL на `cdn.jsdelivr.net` директива `script-src` разрешает только точную папку пакета с версией, например `https://cdn.jsdelivr.net/npm/@bentopdf/pymupdf-wasm@0.11.16/`, а не весь CDN. jsDelivr раздаёт любой публичный пакет npm или репозиторий GitHub, поэтому разрешение всего хоста позволило бы запускать любой из них на вашем экземпляре. URL на любых других хостах разрешаются по источнику (origin).
- Если вы задаёте собственные URL WASM во _время работы_ на странице расширенных настроек приложения, эти источники **не** попадают в CSP, и браузер заблокирует запросы к ним. Это относится и к другой версии того же пакета на `cdn.jsdelivr.net`, так как разрешена только версия, заданная при сборке. Настройка во время работы предназначена для экспериментов; для постоянных собственных URL задайте соответствующий аргумент сборки `VITE_*`.
- В изолированных развёртываниях, где переопределены все три значения `VITE_WASM_*_URL`, из CSP также удаляются эти папки пакетов `cdn.jsdelivr.net` (каждое значение по умолчанию заменяется, а не дополняется). Значения Tesseract OCR по умолчанию на `cdn.jsdelivr.net` остаются в политике, пока вы не зададите и три значения `VITE_TESSERACT_*`. Аналогично, задание `VITE_CORS_PROXY_URL` заменяет публичное значение по умолчанию `bentopdf-cors-proxy.bentopdf.workers.dev`.

CSP включает `'unsafe-eval'` в `script-src`, потому что среда LibreOffice WASM (используется инструментами конвертации Word/Excel/PowerPoint) и библиотека изображений wasm-vips (используется для PDF в TIFF) компилируют внутренний диспетчерский код через `new Function()`. Если убрать его, эти инструменты перестанут работать. Если вы собираете в `SIMPLE_MODE` (без LibreOffice) и PDF в TIFF вам не нужен, можно вручную отредактировать сгенерированный `security-headers.conf` и убрать `'unsafe-eval'` для более строгой политики.

Для OCR оставьте переменные `VITE_TESSERACT_*` пустыми, чтобы использовать онлайн-ресурсы по умолчанию, или задайте все три вместе для OCR на своём сервере или офлайн. Частичное переопределение отклоняется, потому что воркер, основной рантайм и каталог traineddata должны соответствовать друг другу. Для полностью офлайнового вывода PDF с возможностью поиска также задайте `VITE_OCR_FONT_BASE_URL`, чтобы шрифты текстового слоя OCR загружались с вашего внутреннего сервера, а не по публичным URL Noto.

`VITE_DEFAULT_LANGUAGE` задаёт язык интерфейса для новых посетителей. Поддерживаемые значения: `en`, `ar`, `be`, `fr`, `de`, `es`, `zh`, `zh-TW`, `vi`, `tr`, `id`, `it`, `pt`, `nl`, `da`. Пользователи по-прежнему могут переключать язык: меняется только значение по умолчанию.

Пример:

```bash
# Build with French as the default language
docker build --build-arg VITE_DEFAULT_LANGUAGE=fr -t bentopdf .
docker run -d -p 3000:8080 bentopdf
```

### Свой брендинг

Замените стандартные логотип, название и текст подвала BentoPDF своими. Поместите файл логотипа в папку `public/` (или используйте существующее изображение), затем передайте переменные брендинга при сборке:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Брендинг работает и в полном режиме, и в Simple Mode, и сочетается со всеми остальными параметрами сборки.

### Отключение отдельных инструментов

Скройте инструменты в интерфейсе по требованиям соответствия или безопасности. Отключённые инструменты удаляются с главной страницы, из результатов поиска, сочетаний клавиш и конструктора рабочих процессов. При прямом переходе по URL показывается страница «инструмент недоступен».

ID инструмента: URL страницы без `.html`. Например, если инструмент находится по адресу `bentopdf.com/edit-pdf.html`, его ID равен `edit-pdf`.

#### Как найти ID инструментов

Проще всего открыть любой инструмент в BentoPDF и посмотреть на URL. Последняя часть пути (без `.html`) и есть ID инструмента.

<details>
<summary>Полный список ID инструментов</summary>

**Правка и аннотации:** `edit-pdf`, `bookmark`, `table-of-contents`, `page-numbers`, `add-page-labels`, `bates-numbering`, `add-watermark`, `header-footer`, `invert-colors`, `scanner-effect`, `adjust-colors`, `background-color`, `text-color`, `sign-pdf`, `add-stamps`, `remove-annotations`, `crop-pdf`, `form-filler`, `form-creator`, `remove-blank-pages`

**Конвертация в PDF:** `image-to-pdf`, `jpg-to-pdf`, `png-to-pdf`, `webp-to-pdf`, `svg-to-pdf`, `bmp-to-pdf`, `heic-to-pdf`, `tiff-to-pdf`, `txt-to-pdf`, `markdown-to-pdf`, `json-to-pdf`, `csv-to-pdf`, `rtf-to-pdf`, `odt-to-pdf`, `word-to-pdf`, `excel-to-pdf`, `powerpoint-to-pdf`, `xps-to-pdf`, `mobi-to-pdf`, `epub-to-pdf`, `fb2-to-pdf`, `cbz-to-pdf`, `wpd-to-pdf`, `wps-to-pdf`, `xml-to-pdf`, `pages-to-pdf`, `odg-to-pdf`, `ods-to-pdf`, `odp-to-pdf`, `pub-to-pdf`, `vsd-to-pdf`, `psd-to-pdf`, `email-to-pdf`

**Конвертация из PDF:** `pdf-to-jpg`, `pdf-to-png`, `pdf-to-webp`, `pdf-to-bmp`, `pdf-to-tiff`, `pdf-to-cbz`, `pdf-to-svg`, `pdf-to-csv`, `pdf-to-excel`, `pdf-to-greyscale`, `pdf-to-json`, `pdf-to-docx`, `extract-images`, `pdf-to-markdown`, `prepare-pdf-for-ai`, `pdf-to-text`

**Организация и управление:** `ocr-pdf`, `merge-pdf`, `alternate-merge`, `organize-pdf`, `add-attachments`, `extract-attachments`, `edit-attachments`, `pdf-multi-tool`, `pdf-layers`, `extract-tables`, `split-pdf`, `divide-pages`, `extract-pages`, `delete-pages`, `add-blank-page`, `reverse-pages`, `rotate-pdf`, `rotate-custom`, `n-up-pdf`, `pdf-booklet`, `combine-single-page`, `view-metadata`, `edit-metadata`, `pdf-to-zip`, `compare-pdfs`, `posterize-pdf`, `page-dimensions`

**Оптимизация и восстановление:** `compress-pdf`, `pdf-to-pdfa`, `fix-page-size`, `linearize-pdf`, `remove-restrictions`, `repair-pdf`, `rasterize-pdf`, `deskew-pdf`, `font-to-outline`

**Безопасность:** `encrypt-pdf`, `sanitize-pdf`, `decrypt-pdf`, `flatten-pdf`, `remove-metadata`, `change-permissions`, `digital-sign-pdf`, `validate-signature-pdf`, `timestamp-pdf`

</details>

#### Вариант 1: при сборке (аргумент сборки Docker)

```bash
docker build \
  --build-arg DISABLE_TOOLS="edit-pdf,sign-pdf,encrypt-pdf" \
  -t bentopdf .
```

Список отключённых инструментов встраивается в JavaScript-бандл. Для изменения нужна пересборка.

#### Вариант 2: во время работы (config.json)

Смонтируйте файл `config.json` в раздаваемый каталог, пересборка не нужна:

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

Или с Docker Compose:

```yaml
services:
  bentopdf:
    image: ghcr.io/alam00000/bentopdf-simple:latest
    ports:
      - '3000:8080'
    volumes:
      - ./config.json:/usr/share/nginx/html/config.json:ro
```

Оба способа можно сочетать: списки объединяются. Если инструмент указан в любом из них, он отключён.

#### Отключение функций редактора

Можно также отключить отдельные функции внутри PDF-редактора (например, скрытие данных, аннотации, формы), не отключая весь инструмент редактора. Добавьте `editorDisabledCategories` в свой `config.json`:

```json
{
  "editorDisabledCategories": ["redaction", "annotation-stamp"]
}
```

<details>
<summary>Полный список категорий редактора</summary>

**Масштаб:** `zoom`, `zoom-in`, `zoom-out`, `zoom-fit-page`, `zoom-fit-width`, `zoom-marquee`, `zoom-level`

**Аннотации:** `annotation`, `annotation-markup`, `annotation-highlight`, `annotation-underline`, `annotation-strikeout`, `annotation-squiggly`, `annotation-ink`, `annotation-text`, `annotation-stamp`

**Фигуры:** `annotation-shape`, `annotation-rectangle`, `annotation-circle`, `annotation-line`, `annotation-arrow`, `annotation-polygon`, `annotation-polyline`

**Формы:** `form`, `form-textfield`, `form-checkbox`, `form-radio`, `form-select`, `form-listbox`, `form-fill-mode`

**Скрытие данных:** `redaction`, `redaction-area`, `redaction-text`, `redaction-apply`, `redaction-clear`

**Документ:** `document`, `document-open`, `document-close`, `document-print`, `document-capture`, `document-export`, `document-fullscreen`, `document-protect`

**Страница:** `page`, `spread`, `rotate`, `scroll`, `navigation`

**Панель:** `panel`, `panel-sidebar`, `panel-search`, `panel-comment`

**Инструменты:** `tools`, `pan`, `pointer`, `capture`

**Выделение:** `selection`, `selection-copy`

**История:** `history`, `history-undo`, `history-redo`

</details>

Категории иерархичны: отключение родительской (например, `annotation`) отключает все дочерние.

### Отключение счётчика звёзд GitHub

В навигационной панели показывается актуальное число звёзд GitHub, которое запрашивается с `api.github.com` при загрузке страницы. Это единственный внешний запрос, не связанный с PDF-функциями. Отключите его при сборке, чтобы убрать код запроса из бандла и исключить `api.github.com` из Content-Security-Policy:

```bash
docker build --build-arg DISABLE_GITHUB_STARS=true -t bentopdf .
```

Сборки Simple Mode (`bentopdf-simple`) всегда пропускают счётчик звёзд: этот флаг нужен только для сборки Commercial или собственных полных сборок.

### Собственные URL WASM (изолированная среда / свой хостинг)

> [!IMPORTANT]
> URL WASM встраиваются в JavaScript **при сборке**. Файлы WASM скачиваются **браузером пользователя** во время работы: Docker не загружает их при сборке. Для изолированных сетей нужно разместить файлы WASM на внутреннем сервере, доступном браузерам.

**Полный процесс для изолированной среды:**

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

Используйте коды, которые выводит `bash scripts/prepare-airgap.sh --list-ocr-languages`, или ищите по названию через `bash scripts/prepare-airgap.sh --search-ocr-language <term>`, для `--ocr-languages`. Когда вы собираете с ограниченным набором языков OCR, передайте те же коды в `VITE_TESSERACT_AVAILABLE_LANGUAGES`, чтобы приложение показывало только включённые языки. Для полностью офлайнового вывода OCR также разместите поставляемый каталог `ocr-fonts/` и укажите на него `VITE_OCR_FONT_BASE_URL`.

Задайте переменной пустую строку, чтобы отключить этот модуль (пользователям придётся настроить его вручную в расширенных настройках).

## Свой порт

По умолчанию BentoPDF слушает порт `8080` внутри контейнера. Чтобы изменить его, задайте переменную окружения `PORT` во время работы:

```bash
docker run -p 3000:9090 -e PORT=9090 ghcr.io/alam00000/bentopdf-simple:latest
```

| Переменная | Описание                | По умолчанию |
| ---------- | ----------------------- | ------------ |
| `PORT`     | Порт Nginx в контейнере | `8080`       |

Это работает и со стандартным, и с nonroot-Dockerfile.

## Свой ID пользователя (PUID/PGID)

Для сред, где нужен запуск от конкретного непривилегированного пользователя (NAS-устройства, Kubernetes с контекстами безопасности, организационные политики), BentoPDF предоставляет отдельный Dockerfile с поддержкой PUID/PGID в стиле LSIO.

### Сборка и запуск

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

### Переменные окружения

| Переменная     | Описание                    | По умолчанию |
| -------------- | --------------------------- | ------------ |
| `PUID`         | ID пользователя для запуска | `1000`       |
| `PGID`         | ID группы для запуска       | `1000`       |
| `PORT`         | Порт Nginx                  | `8080`       |
| `DISABLE_IPV6` | Отключить слушатель IPv6    | `false`      |

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

### Как это работает

Контейнер стартует от root, создаёт пользователя с заданными PUID/PGID, меняет владельца всех каталогов с правом записи, затем сбрасывает привилегии через `su-exec`. Процесс nginx работает целиком от указанного вами пользователя.

> [!NOTE]
> Стандартный `Dockerfile` использует `nginx-unprivileged` (UID 101) и рекомендуется для большинства развёртываний. Используйте `Dockerfile.nonroot` только когда нужен конкретный UID/GID.

> [!WARNING]
> PUID/PGID не могут быть равны `0` (root). Точка входа проверяет значения и завершится с ошибкой при недопустимых.

## С Traefik (обратный прокси)

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

## С Caddy (обратный прокси)

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

## Ограничения ресурсов

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

## Podman Quadlet (интеграция с systemd)

[Quadlet](https://docs.podman.io/en/latest/markdown/podman-systemd.unit.5.html) позволяет запускать контейнеры Podman как службы systemd. Это идеально подходит для рабочих развёртываний в Linux.

### Базовая настройка Quadlet

Создайте файл юнита контейнера `~/.config/containers/systemd/bentopdf.container` (пользовательский) или `/etc/containers/systemd/bentopdf.container` (системный):

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

### Включение и запуск

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
> Для общесистемного развёртывания используйте `systemctl` без флага `--user` и поместите файл в `/etc/containers/systemd/`.

### Quadlet с проверкой работоспособности

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

### Автообновление с Quadlet

Podman может автоматически обновлять контейнеры, когда появляются новые образы:

```bash
# Enable auto-update timer
systemctl --user enable --now podman-auto-update.timer

# Check for updates manually
podman auto-update

# Dry run (check without updating)
podman auto-update --dry-run
```

### Сетевая конфигурация Quadlet

Для собственной сетевой конфигурации создайте файл сети `bentopdf.network`:

```ini
[Network]
Subnet=10.89.0.0/24
Gateway=10.89.0.1
```

Затем сошлитесь на него в файле контейнера:

```ini
[Container]
Image=ghcr.io/alam00000/bentopdf-simple:latest
ContainerName=bentopdf
PublishPort=3000:8080
Network=bentopdf.network
```

## Обновление

```bash
# Pull latest image
docker compose pull

# Recreate container
docker compose up -d
```
