# Руководство по самостоятельному размещению

BentoPDF можно разместить на собственной инфраструктуре. В этом руководстве описаны разные варианты развертывания.

## Быстрый старт с Docker / Podman

Самый быстрый способ разместить BentoPDF у себя:

> [!TIP]
> BentoPDF поставляется в двух сборках:
>
> - **Сборка для самостоятельного размещения**: `ghcr.io/alam00000/bentopdf-simple:latest`. Все инструменты PDF, **без** маркетингового оформления (без главного экрана, FAQ, отзывов и подвала). Используйте ее для внутренних развертываний в команде или организации. Это **не** урезанная «облегченная» версия.
> - **Коммерческая сборка**: `ghcr.io/alam00000/bentopdf:latest`. Полный маркетинговый сайт, который использует сам bentopdf.com и держатели коммерческих лицензий для публичных развертываний.
>
> Если сомневаетесь, берите сборку для самостоятельного размещения.

> [!IMPORTANT]
> Для конвертации офисных файлов нужен `SharedArrayBuffer`, а значит, приложение должно быть изолировано между источниками (cross-origin isolated) и раздаваться из защищенного контекста. Официальный образ уже отправляет нужные заголовки COOP/COEP, но браузеры все равно отключают `SharedArrayBuffer` на обычных HTTP-адресах в локальной сети, например `http://192.168.x.x`.
>
> Используйте `http://localhost` только для проверки на одном устройстве. Если пользователи открывают BentoPDF по IP-адресу или имени хоста в локальной сети, настройте HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Или с помощью Docker Compose / Podman Compose:

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

Запустите BentoPDF как службу systemd. Создайте `~/.config/containers/systemd/bentopdf.container`:

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

Полную документацию по Quadlet смотрите в [руководстве по развертыванию Docker](/ru/self-hosting/docker).

## Сборка из исходного кода

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Параметры конфигурации

### Сборка для самостоятельного размещения (Simple Mode)

Сборка для самостоятельного размещения (образ `bentopdf-simple`, также называемая Simple Mode) **функционально идентична** коммерческой сборке: все инструменты PDF на месте и работают одинаково. Она лишь скрывает маркетинговое оформление, которое имеет смысл только на самом bentopdf.com или в коммерческом публичном развертывании. **Это не урезанная и не «облегченная» версия.**

**Что скрывает сборка для самостоятельного размещения** (только оформление, функции PDF не удаляются):

- Панель навигации, главный экран, раздел возможностей, FAQ, отзывы, подвал
- Заголовок страницы меняется на «Инструменты PDF»

**Что сохраняет сборка для самостоятельного размещения** (все, что реально работает с PDF):

- Все инструменты PDF (объединение, разделение, редактирование, подпись, OCR, конвертация офисных файлов и т. д.)
- Поддержку собственного брендинга, всю конфигурацию на этапе сборки и во время работы

Коммерческая сборка (`ghcr.io/alam00000/bentopdf:latest`) лежит в основе самого bentopdf.com, и ее используют держатели коммерческих лицензий для публичных развертываний. Она добавляет главный экран, FAQ, отзывы и подвал, которые не нужны во внутреннем инструменте.

Если вы размещаете BentoPDF для своей команды, организации или как внутренний инструмент, берите сборку для самостоятельного размещения:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Подробности смотрите в [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md).

### Коммерческая сборка (публичные развертывания под вашим брендом)

Коммерческая сборка (образ `bentopdf`, без суффикса `-simple`) лежит в основе самого bentopdf.com. Она включает полный маркетинговый сайт (главный экран, возможности, FAQ, отзывы, подвал) в дополнение ко всем инструментам PDF. Используйте эту сборку, когда хотите **развернуть BentoPDF как публичный сервис PDF под собственным брендом**, например:

- Вы запускаете BentoPDF как размещаемый SaaS для конечных пользователей на своем домене
- Вам нужна посадочная страница (маркетинговые разделы плюс инструменты), а не только сами инструменты
- Вы держатель коммерческой лицензии и встраиваете BentoPDF в коммерческий продукт

**Запустите как есть** (с брендингом BentoPDF, удобно для предпросмотра сборки):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Соберите со своим брендом** (типичный коммерческий сценарий):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Все остальные параметры времени сборки (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, переопределения URL для WASM и т. д.) работают так же, как в сборке для самостоятельного размещения.

::: warning Лицензирование
Запуск коммерческой сборки разрешен по любому из двух вариантов лицензии BentoPDF:

- **AGPL-3.0** (бесплатно): допускается, если ваше развертывание публикует весь исходный код под AGPL, включая любые изменения брендинга и окружающую бизнес-логику.
- **Коммерческая лицензия** (79 $ навсегда): требуется для закрытых и проприетарных развертываний, где вы не публикуете исходный код своего форка с брендингом или бизнес-код.

Полное сравнение смотрите на [странице лицензирования](https://www.bentopdf.com/licensing). Модули WASM под лицензией AGPL (PyMuPDF, Ghostscript, CoherentPDF) загружаются из CDN во время работы, поэтому они не попадают в ваш образ и не меняют ваш лицензионный статус.
:::

### Базовый URL

Развертывание в подкаталоге:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Собственный брендинг

Замените стандартные логотип, название и текст подвала BentoPDF на свои при сборке:

| Переменная         | Описание                               | По умолчанию                            |
| ------------------ | -------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Название бренда в заголовке и подвале  | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Путь к логотипу относительно `public/` | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Свой текст подвала и авторских прав    | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Или через Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Брендинг работает как в полном режиме, так и в Simple Mode и сочетается со всеми остальными параметрами времени сборки (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Отключение отдельных инструментов

Скрывайте отдельные инструменты ради соответствия требованиям или безопасности. Отключенные инструменты удаляются с главной страницы, из поиска, быстрых клавиш, конструктора рабочих процессов и недоступны по прямому URL.

Идентификаторы инструментов совпадают с URL страницы без `.html`: откройте любой инструмент и посмотрите на адрес (например, `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Во время сборки** (вшивается в бандл):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Во время работы** (пересборка не нужна, смонтируйте `config.json`):

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

Оба способа можно сочетать: списки объединяются.

Вы также можете отключить отдельные функции внутри редактора PDF (например, редактирование с удалением данных), не отключая инструмент целиком, добавив `editorDisabledCategories` в `config.json`. Полный список категорий смотрите в [руководстве по Docker](/ru/self-hosting/docker#отключение-функции-редактора).

## Руководства по развертыванию

Выберите платформу:

- [Vercel](/ru/self-hosting/vercel)
- [Netlify](/ru/self-hosting/netlify)
- [Cloudflare Pages](/ru/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/ru/self-hosting/aws)
- [Hostinger](/ru/self-hosting/hostinger)
- [Nginx](/ru/self-hosting/nginx)
- [Apache](/ru/self-hosting/apache)
- [Docker](/ru/self-hosting/docker)
- [Kubernetes](/ru/self-hosting/kubernetes)
- [CORS-прокси](/ru/self-hosting/cors-proxy) - необходим для цифровых подписей

## Частые проблемы

### Конвертация Word / ODT / Excel / PowerPoint в PDF зависает (SharedArrayBuffer недоступен)

**Симптом**: конвертация документов через LibreOffice (Word, ODT, Excel, PowerPoint в PDF) зависает примерно на 55% или не запускается. В консоли браузера может быть:

> `ReferenceError: SharedArrayBuffer is not defined`

…или `window.crossOriginIsolated` возвращает `false`, или компиляция WASM сообщает `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Причина**: LibreOffice WASM требует `SharedArrayBuffer`, который браузер включает, только когда страница **изолирована между источниками (cross-origin isolated)** И раздается из **защищенного контекста**. Для этого должны выполняться два условия:

1. В каждом ответе есть оба заголовка:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. Страница раздается по `https://...` или `http://localhost`. Обычный HTTP на IP-адресе в локальной сети (например, `http://192.168.x.x`) защищенным НЕ считается: браузеры отключают там `SharedArrayBuffer`.

Несовпадение `00 61 73 6d / 1f 8b 08 08` является отдельным подсимптомом: у предварительно сжатых файлов `.wasm.gz` / `.data.gz` нет заголовка ответа `Content-Encoding: gzip`, поэтому браузер получает необработанные байты gzip вместо распакованного WASM.

**Решение**: точную конфигурацию смотрите в руководстве для вашей платформы:

- [Nginx →](/ru/self-hosting/nginx#конвертация-word-odt-excel-в-pdf-не-работает)
- [Apache →](/ru/self-hosting/apache#конвертация-word-odt-excel-в-pdf-не-работает)
- [AWS S3 + CloudFront →](/ru/self-hosting/aws#шаг-3b-политика-заголовков-ответа-обязательна-для-libreoffice-wasm)
- [Cloudflare Pages →](/ru/self-hosting/cloudflare#фаил-конфигурации) (файл `_headers`)
- [Netlify →](/ru/self-hosting/netlify#конвертация-word-odt-excel-в-pdf-зависает-на-55) (`netlify.toml`)
- [Vercel →](/ru/self-hosting/vercel#конвертация-word-odt-excel-в-pdf-не-работает) (`vercel.json`)
- [Hostinger →](/ru/self-hosting/hostinger#инструменты-libreoffice-не-работают) (`.htaccess`)
- [Kubernetes →](/ru/self-hosting/kubernetes#сохранение-заголовков-sharedarraybuffer-ingress-gateway)
- **Docker**: обрабатывается автоматически встроенной конфигурацией nginx, никаких действий не требуется.

**Проверка**: откройте консоль DevTools на любой странице BentoPDF и выполните:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Если страница раздается по HTTPS или `http://localhost` И оба заголовка COEP/COOP присутствуют в каждом ответе, обе проверки пройдут. Если вы открываете `http://192.168.x.x` или другой HTTP-адрес не из loopback, настройте HTTPS: решения только через заголовки не существует.

### Файлы `.mjs` отдаются как `application/octet-stream`

**Симптом**: Sign PDF / Form Filler и некоторые другие инструменты показывают пустой просмотрщик или не загружаются. В консоли браузера:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Причина**: в вашем веб-сервере или обратном прокси нет соответствия MIME-типа для файлов `.mjs` (встроенный просмотрщик PDF поставляется с ES-модулями с таким расширением). Во многих стандартных конфигурациях для неизвестных расширений по умолчанию используется `application/octet-stream`, и браузеры отказываются выполнять такие файлы как ES-модули.

**Решение**: нужный фрагмент смотрите в руководстве для вашей платформы:

- [Nginx →](/ru/self-hosting/nginx#sign-pdf-или-form-filler-показывает-пустои-просмотрщик-ошибка-mime-для-mjs)
- [Apache →](/ru/self-hosting/apache#sign-pdf-или-form-filler-показывают-пустои-просмотрщик-ошибка-mime-для-mjs)
- [AWS S3 + CloudFront →](/ru/self-hosting/aws#шаг-2-сборка-и-загрузка) (см. `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/ru/self-hosting/kubernetes#ошибки-mime-типа-mjs-пустои-iframe-в-sign-pdf-form-filler)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: обрабатывается автоматически, никаких действий не требуется.

**Проверка**: откройте DevTools → вкладка Network, найдите неудавшийся запрос `.mjs` и проверьте заголовок ответа `Content-Type`. Там должно быть `application/javascript`. Если по-прежнему `application/octet-stream`, возможно, внешний обратный прокси или CDN заново определяет тип: проверьте каждый уровень вашей цепочки.

## Конфигурация WASM (компоненты AGPL)

BentoPDF **не включает** библиотеки обработки под лицензией AGPL в свой исходный код, но **заранее настраивает URL CDN**, поэтому все функции работают сразу, без ручной настройки.

::: tip Работает без настройки
Начиная с v2.0.0, модули WASM заранее настроены на загрузку из CDN jsDelivr через переменные окружения. Все расширенные функции работают сразу, без какой-либо настройки пользователем.
:::

| Компонент       | Лицензия | Возможности                                                    |
| --------------- | -------- | -------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | Конвертация EPUB/MOBI/FB2/XPS, извлечение изображений и таблиц |
| **Ghostscript** | AGPL-3.0 | Конвертация в PDF/A, сжатие, выравнивание, растрирование       |
| **CoherentPDF** | AGPL-3.0 | Оглавление, вложения, объединение PDF с закладками             |

### Переменные окружения по умолчанию

Они заданы в `.env.production` и вшиваются в сборку:

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

### Переопределение URL для WASM

Значения по умолчанию можно переопределить при сборке для нестандартных развертываний:

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

Чтобы полностью отключить модуль (пользователю придется настраивать его вручную в расширенных настройках), задайте его переменной пустую строку.

Для OCR либо оставьте все переменные `VITE_TESSERACT_*` пустыми и используйте стандартные онлайн-ресурсы, либо задайте URL воркера, ядра и языковых данных вместе для автономного OCR на своей инфраструктуре. Если вы включаете в сборку только некоторые языки OCR, задайте также `VITE_TESSERACT_AVAILABLE_LANGUAGES` с теми же кодами через запятую, чтобы интерфейс предлагал только установленные языки, а неподдерживаемый выбор завершался понятной ошибкой. Для полностью автономного создания PDF с возможностью поиска задайте также `VITE_OCR_FONT_BASE_URL` с адресом внутренней директории, где лежат встроенные шрифты OCR.

Пользователи также могут в любой момент переопределить эти значения через **расширенные настройки** в интерфейсе: пользовательские настройки, сохраненные в браузере, имеют приоритет над значениями окружения по умолчанию.

### Развертывание в изолированной сети / офлайн

Для сетей без доступа в интернет (госсектор, здравоохранение, финансы и т. д.). URL для WASM вшиваются в JavaScript **при сборке**, а сами файлы WASM скачивает **браузер пользователя** во время работы. Поэтому все нужно подготовить на машине с интернетом, а затем перенести во внутреннюю сеть.

#### Автоматический скрипт (рекомендуется)

Входящий в состав скрипт `prepare-airgap.sh` автоматизирует весь процесс: скачивает пакеты WASM, собирает образ Docker и создает самодостаточный пакет со скриптом установки.

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

В результате создается директория с пакетом:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Перенесите пакет в изолированную сеть через USB, внутренний репозиторий артефактов или другим разрешенным способом. Затем запустите входящий в него скрипт установки:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Скрипт установки загружает образ Docker, распаковывает файлы WASM и при желании запускает контейнер.

**Параметры скрипта:**

| Флаг                           | Описание                                                       | По умолчанию                                  |
| ------------------------------ | -------------------------------------------------------------- | --------------------------------------------- |
| `--wasm-base-url <url>`        | Где файлы WASM будут размещены внутри сети                     | _(обязателен, запрашивается, если не указан)_ |
| `--image-name <name>`          | Тег образа Docker                                              | `bentopdf`                                    |
| `--output-dir <path>`          | Директория для итогового пакета                                | `./bentopdf-airgap-bundle`                    |
| `--simple-mode`                | Включить Simple Mode                                           | выкл.                                         |
| `--base-url <path>`            | Базовый URL подкаталога (например, `/pdf/`)                    | `/`                                           |
| `--language <code>`            | Язык интерфейса по умолчанию (например, `fr`, `de`)            | _(нет)_                                       |
| `--brand-name <name>`          | Свое название бренда                                           | _(нет)_                                       |
| `--brand-logo <path>`          | Путь к логотипу относительно `public/`                         | _(нет)_                                       |
| `--footer-text <text>`         | Свой текст подвала                                             | _(нет)_                                       |
| `--ocr-languages <list>`       | Языки OCR для включения в пакет через запятую                  | `eng`                                         |
| `--list-ocr-languages`         | Вывести поддерживаемые коды и названия OCR и выйти             | выкл.                                         |
| `--search-ocr-language <term>` | Поиск кодов OCR по названию или сокращению                     | выкл.                                         |
| `--dockerfile <path>`          | Используемый Dockerfile                                        | `Dockerfile`                                  |
| `--skip-docker`                | Пропустить сборку и экспорт Docker                             | выкл.                                         |
| `--skip-wasm`                  | Пропустить загрузку WASM (использовать имеющиеся файлы `.tgz`) | выкл.                                         |

Интерактивный режим также принимает `list`, чтобы вывести полный список поддерживаемых кодов Tesseract, и `search <term>`, чтобы найти совпадения, например `search german` или `search chi`.

::: warning Требование одного источника
Файлы WASM должны раздаваться с **того же источника** (origin), что и приложение BentoPDF. Веб-воркеры используют `importScripts()`, который не может загружать скрипты с другого источника. Например, если BentoPDF работает на `https://internal.example.com`, базовый URL для WASM тоже должен быть `https://internal.example.com/wasm`.
:::

#### Ручные шаги

<details>
<summary>Если вы предпочитаете выполнить все вручную, без скрипта</summary>

**Шаг 1: Скачайте пакеты WASM и OCR** (на машине с интернетом)

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

**Шаг 2: Соберите образ Docker с внутренними URL**

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

**Шаг 3: Экспортируйте образ Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**Шаг 4: Перенесите во внутреннюю изолированную сеть**

Скопируйте через USB, внутренний репозиторий артефактов или другой разрешенный способ передачи:

- `bentopdf.tar`: образ Docker
- Пять пакетов `.tgz` WASM/OCR из шага 1
- Директорию `tesseract-langdata/` из шага 1
- Директорию `ocr-fonts/` из шага 1

**Шаг 5: Настройте внутри изолированной сети**

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

Убедитесь, что файлы доступны по URL, настроенным на шаге 2, включая `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` и `.../ocr/fonts`.

</details>

::: info Собираете из исходного кода, а не через Docker?
Задайте переменные в `.env.production` перед запуском `npm run build`:

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

### Собственный прокси для WASM

Если нужно раздавать файлы WASM под лицензией AGPL с правильными заголовками CORS, можно развернуть простой прокси. Пример реализации смотрите в [руководстве по Cloudflare WASM Proxy](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md).

::: tip Зачем разделять?
Такое разделение обеспечивает:

- Юридическую ясность для коммерческих пользователей
- Ядро BentoPDF остается под двойной лицензией (AGPL-3.0 / коммерческая)
- Файлы WASM загружаются во время работы и не входят в исходный код
  :::

## Системные требования

| Требование | Минимум                         |
| ---------- | ------------------------------- |
| Диск       | ~100 МБ (ядро без модулей AGPL) |
| ОЗУ        | 512 МБ                          |
| Процессор  | Любой современный               |

::: tip
BentoPDF является статическим сайтом: база данных и серверная часть не нужны!
:::
