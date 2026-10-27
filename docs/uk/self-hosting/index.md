# Посібник із самостійного розміщення

BentoPDF можна розмістити на власній інфраструктурі. Цей посібник описує різні варіанти розгортання.

## Швидкий старт із Docker / Podman

Найшвидший спосіб розмістити BentoPDF самостійно:

> [!TIP]
> BentoPDF постачається у двох збірках:
>
> - **Збірка для самостійного розміщення** (Self-Hosted): `ghcr.io/alam00000/bentopdf-simple:latest`. Усі PDF-інструменти, **без** маркетингового оформлення (без hero-блоку, FAQ, відгуків і футера). Використовуйте її для внутрішніх розгортань у команді чи організації. Це **не** урізана "lite"-версія.
> - **Комерційна збірка** (Commercial): `ghcr.io/alam00000/bentopdf:latest`. Повний маркетинговий сайт, який використовує сам bentopdf.com і власники комерційної ліцензії з публічними розгортаннями.
>
> Якщо вагаєтеся, беріть збірку для самостійного розміщення.

> [!IMPORTANT]
> Перетворення офісних файлів потребує `SharedArrayBuffer`, а отже застосунок має бути і ізольованим між походженнями (cross-origin isolated), і обслуговуватися з безпечного контексту. Офіційний образ уже надсилає потрібні заголовки COOP/COEP, але браузери все одно вимикають `SharedArrayBuffer` на звичайних HTTP-адресах локальної мережі, як-от `http://192.168.x.x`.
>
> Використовуйте `http://localhost` лише для тестування на одному пристрої. Якщо користувачі відкривають BentoPDF через LAN IP або ім’я хоста, налаштуйте HTTPS.

```bash
# Docker
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Podman
podman run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest
```

Або з Docker Compose / Podman Compose:

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

Запустіть BentoPDF як службу systemd. Створіть `~/.config/containers/systemd/bentopdf.container`:

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

Повну документацію щодо Quadlet дивіться в [посібнику з розгортання Docker](/uk/self-hosting/docker).

## Збірка з вихідного коду

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Параметри конфігурації

### Збірка для самостійного розміщення (Simple Mode)

Збірка для самостійного розміщення (образ `bentopdf-simple`, також званий Simple Mode) **функціонально ідентична** комерційній збірці: усі PDF-інструменти на місці й працюють однаково. Вона лише приховує маркетингове оформлення, яке має сенс тільки на самому bentopdf.com або в комерційному публічному розгортанні. **Це не урізана чи "lite"-версія.**

**Що приховує збірка для самостійного розміщення** (лише косметика, жодні функції PDF не вилучаються):

- Панель навігації, hero-секцію, секцію переваг, FAQ, відгуки, футер
- Змінює заголовок сторінки на "PDF інструменти"

**Що зберігає збірка для самостійного розміщення** (усе, що справді працює з PDF):

- Усі PDF-інструменти (об’єднання, розділення, редагування, підпис, OCR, перетворення офісних файлів тощо)
- Підтримку власного брендингу, усі налаштування часу збірки та виконання

Комерційна збірка (`ghcr.io/alam00000/bentopdf:latest`) живить сам bentopdf.com і використовується власниками комерційної ліцензії з публічними розгортаннями. Вона додає hero-блок, FAQ, відгуки та футер, які не мають сенсу у внутрішньому інструменті.

Якщо ви розміщуєте BentoPDF для своєї команди, організації або як внутрішній інструмент, беріть збірку для самостійного розміщення:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Повну інформацію дивіться в [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md).

### Комерційна збірка (публічні розгортання з вашим брендом)

Комерційна збірка (образ `bentopdf` без суфікса `-simple`) живить сам bentopdf.com. Вона містить повний маркетинговий сайт (hero, переваги, FAQ, відгуки, футер) на додачу до всіх PDF-інструментів. Використовуйте цю збірку, коли хочете **розгорнути BentoPDF як публічний PDF-сервіс під власним брендом**, наприклад:

- Ви запускаєте BentoPDF як хмарний сервіс (SaaS) для кінцевих користувачів на власному домені
- Вам потрібен досвід лендингу (маркетингові секції + інструменти), а не лише голий набір інструментів
- Ви власник комерційної ліцензії та вбудовуєте BentoPDF у комерційний продукт

**Запуск як є** (бренд BentoPDF, зручно для перегляду збірки):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Збірка з власним брендом** (типовий комерційний сценарій):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Усі інші параметри часу збірки (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, перевизначення URL для WASM тощо) працюють так само, як і в збірці для самостійного розміщення.

::: warning Ліцензування
Запуск комерційної збірки дозволений за будь-яким із двох варіантів ліцензії BentoPDF:

- **AGPL-3.0** (безкоштовно): дозволено, якщо ваше розгортання публікує повний вихідний код під AGPL, включно з будь-якими змінами брендингу та навколишньою бізнес-логікою.
- **Комерційна ліцензія** ($79 довічно): потрібна для закритих/пропрієтарних розгортань, де ви не відкриваєте вихідний код свого форка з брендингом чи бізнес-код.

Повне порівняння дивіться на [сторінці ліцензування](https://www.bentopdf.com/licensing). WASM-модулі під AGPL (PyMuPDF, Ghostscript, CoherentPDF) завантажуються з CDN під час виконання, тому вони не потрапляють у ваш образ і не змінюють вашого ліцензійного статусу.
:::

### Базовий URL

Розгортання в підкаталозі:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Власний брендинг

Замініть стандартний логотип, назву й текст футера BentoPDF на власні під час збірки:

| Змінна             | Опис                                 | За замовчуванням                        |
| ------------------ | ------------------------------------ | --------------------------------------- |
| `VITE_BRAND_NAME`  | Назва бренду в заголовку та футері   | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Шлях до логотипа відносно `public/`  | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Власний текст футера/авторських прав | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Або через Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Брендинг працює і в повному режимі, і в Simple Mode та поєднується з усіма іншими параметрами часу збірки (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Вимкнення окремих інструментів

Приховуйте окремі інструменти з міркувань відповідності вимогам або безпеки. Вимкнені інструменти вилучаються з головної сторінки, пошуку, ярликів, конструктора робочих процесів і прямого доступу за URL.

Ідентифікатори інструментів є URL сторінки без `.html`: відкрийте будь-який інструмент і подивіться на URL (наприклад, `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Під час збірки** (вбудовується в бандл):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Під час виконання** (без перебудови, змонтуйте `config.json`):

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

Обидва способи можна поєднувати: списки об’єднуються.

Також можна вимкнути окремі функції всередині редактора PDF (наприклад, редагування вмісту) без вимкнення всього інструмента, додавши `editorDisabledCategories` до `config.json`. Повний перелік категорій дивіться в [посібнику з Docker](/uk/self-hosting/docker#вимкнення-функціи-редактора).

## Посібники з розгортання

Виберіть свою платформу:

- [Vercel](/uk/self-hosting/vercel)
- [Netlify](/uk/self-hosting/netlify)
- [Cloudflare Pages](/uk/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/uk/self-hosting/aws)
- [Hostinger](/uk/self-hosting/hostinger)
- [Nginx](/uk/self-hosting/nginx)
- [Apache](/uk/self-hosting/apache)
- [Docker](/uk/self-hosting/docker)
- [Kubernetes](/uk/self-hosting/kubernetes)
- [CORS-проксі](/uk/self-hosting/cors-proxy) - потрібен для цифрових підписів

## Поширені проблеми

### Перетворення Word / ODT / Excel / PowerPoint у PDF зависає (SharedArrayBuffer недоступний)

**Симптом**: перетворення документів через LibreOffice (Word, ODT, Excel, PowerPoint у PDF) зависає приблизно на 55% або не запускається. У консолі браузера може бути:

> `ReferenceError: SharedArrayBuffer is not defined`

...або `window.crossOriginIsolated` повертає `false`, або компіляція WASM повідомляє `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Причина**: LibreOffice WASM потребує `SharedArrayBuffer`, який браузер вмикає лише тоді, коли сторінка **ізольована між походженнями** І обслуговується з **безпечного контексту**. Тобто мають виконуватися дві умови:

1. Кожна відповідь містить обидва заголовки:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. Сторінка обслуговується через `https://...` або `http://localhost`. Звичайний HTTP на LAN IP (наприклад, `http://192.168.x.x`) безпечним НЕ вважається: браузери вимикають там `SharedArrayBuffer`.

Невідповідність `00 61 73 6d / 1f 8b 08 08` є окремим підсимптомом: у попередньо стиснутих файлів `.wasm.gz` / `.data.gz` відсутній заголовок відповіді `Content-Encoding: gzip`, тож браузер отримує сирі байти gzip замість розпакованого WASM.

**Рішення**: точну конфігурацію дивіться в посібнику для вашої платформи:

- [Nginx →](/uk/self-hosting/nginx#не-працює-перетворення-word-odt-excel-у-pdf)
- [Apache →](/uk/self-hosting/apache#конвертація-word-odt-excel-у-pdf-не-працює)
- [AWS S3 + CloudFront →](/uk/self-hosting/aws#крок-3b-політика-заголовків-відповіді-обов-язково-для-libreoffice-wasm)
- [Cloudflare Pages →](/uk/self-hosting/cloudflare#фаил-конфігураціі) (файл `_headers`)
- [Netlify →](/uk/self-hosting/netlify#перетворення-word-odt-excel-у-pdf-зависає-на-55) (`netlify.toml`)
- [Vercel →](/uk/self-hosting/vercel#не-працює-перетворення-word-odt-excel-у-pdf) (`vercel.json`)
- [Hostinger →](/uk/self-hosting/hostinger#інструменти-libreoffice-не-працюють) (`.htaccess`)
- [Kubernetes →](/uk/self-hosting/kubernetes#як-переконатися-що-заголовки-sharedarraybuffer-працюють-ingress-gateway)
- **Docker**: обробляється автоматично вбудованою конфігурацією nginx, жодних дій не потрібно.

**Перевірка**: відкрийте консоль DevTools на будь-якій сторінці BentoPDF і виконайте:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Якщо сторінка працює через HTTPS або `http://localhost` І обидва заголовки COEP/COOP присутні в кожній відповіді, обидві перевірки пройдуть. Якщо ви на `http://192.168.x.x` чи іншому не-loopback HTTP-походженні, налаштуйте HTTPS: рішення лише через заголовки не існує.

### Файли `.mjs` віддаються як `application/octet-stream`

**Симптом**: Sign PDF / Form Filler / деякі інші інструменти показують порожній переглядач або не завантажуються. Консоль браузера повідомляє:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Причина**: у вашого вебсервера або зворотного проксі немає зіставлення MIME-типу для файлів `.mjs` (вбудований PDF-переглядач постачає ES-модулі з таким розширенням). Багато стандартних конфігурацій серверів за замовчуванням віддають невідомі розширення як `application/octet-stream`, і браузери відмовляються виконувати їх як ES-модулі.

**Рішення**: точний фрагмент дивіться в посібнику для вашої платформи:

- [Nginx →](/uk/self-hosting/nginx#sign-pdf-або-form-filler-показує-порожніи-переглядач-помилка-mime-для-mjs)
- [Apache →](/uk/self-hosting/apache#sign-pdf-або-form-filler-показує-порожніи-переглядач-помилка-mime-для-mjs)
- [AWS S3 + CloudFront →](/uk/self-hosting/aws#крок-2-зберіть-і-завантажте) (дивіться `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/uk/self-hosting/kubernetes#помилки-mime-типу-mjs-порожніи-iframe-у-sign-pdf-form-filler)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: обробляється автоматично, жодних дій не потрібно.

**Перевірка**: відкрийте DevTools → вкладка Network, знайдіть запит `.mjs`, що завершився помилкою, і перевірте заголовок відповіді `Content-Type`. Він має бути `application/javascript`. Якщо там досі `application/octet-stream`, зовнішній зворотний проксі чи CDN, можливо, повторно визначає тип: перевірте кожен рівень у ланцюжку обслуговування.

## Конфігурація WASM (компоненти під AGPL)

BentoPDF **не вбудовує** бібліотеки обробки під ліцензією AGPL у свій вихідний код, але **попередньо налаштовує URL-адреси CDN**, тож усі функції працюють одразу, без ручного налаштування.

::: tip Нульова конфігурація за замовчуванням
Починаючи з v2.0.0 модулі WASM попередньо налаштовані на завантаження з CDN jsDelivr через змінні середовища. Усі розширені функції працюють одразу без жодного налаштування користувачем.
:::

| Компонент       | Ліцензія | Функції                                                            |
| --------------- | -------- | ------------------------------------------------------------------ |
| **PyMuPDF**     | AGPL-3.0 | Перетворення EPUB/MOBI/FB2/XPS, витяг зображень, витяг таблиць     |
| **Ghostscript** | AGPL-3.0 | Перетворення в PDF/A, стиснення, вирівнювання нахилу, растеризація |
| **CoherentPDF** | AGPL-3.0 | Зміст, вкладення, об’єднання PDF із закладками                     |

### Змінні середовища за замовчуванням

Вони задані в `.env.production` і вбудовані в збірку:

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

### Перевизначення URL для WASM

Значення за замовчуванням можна перевизначити під час збірки для власних розгортань:

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

Щоб повністю вимкнути модуль (вимагається ручне налаштування користувачем через «Додаткові налаштування»), задайте його змінній порожній рядок.

Для OCR або залиште всі змінні `VITE_TESSERACT_*` порожніми й використовуйте онлайнові ресурси за замовчуванням, або задайте URL воркера/ядра/мовних даних разом для самостійно розміщеного/офлайн OCR. Якщо ви вбудовуєте лише окремі мови OCR, також задайте `VITE_TESSERACT_AVAILABLE_LANGUAGES` тими самими кодами через кому, щоб інтерфейс пропонував лише встановлені мови, а непідтримувані вибори завершувалися описовою помилкою. Для повністю офлайн-створення PDF із пошуком також задайте `VITE_OCR_FONT_BASE_URL` як внутрішній каталог, що віддає вбудовані шрифти OCR.

Користувачі також можуть будь-коли перевизначити ці значення через **Додаткові налаштування** в інтерфейсі: перевизначення, збережені в браузері, мають пріоритет над значеннями середовища за замовчуванням.

### Розгортання в ізольованій мережі / офлайн

Для мереж без доступу до інтернету (державні установи, охорона здоров’я, фінанси тощо). URL-адреси WASM вбудовуються в JavaScript під час **збірки**, а самі файли WASM завантажує **браузер користувача** під час виконання. Тому все потрібно підготувати на машині з інтернетом, а потім перенести в ізольовану мережу.

#### Автоматичний скрипт (рекомендовано)

Скрипт `prepare-airgap.sh` автоматизує весь процес: завантажує пакети WASM, збирає образ Docker і створює самодостатній пакет зі скриптом налаштування.

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

Це створює каталог із пакетом:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Перенесіть пакет в ізольовану мережу через USB, внутрішнє сховище артефактів або інший схвалений спосіб. Потім запустіть вбудований скрипт налаштування:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Скрипт налаштування завантажує образ Docker, розпаковує файли WASM і за бажанням запускає контейнер.

**Параметри скрипта:**

| Прапорець                      | Опис                                                              | За замовчуванням                         |
| ------------------------------ | ----------------------------------------------------------------- | ---------------------------------------- |
| `--wasm-base-url <url>`        | Де внутрішньо розміщуватимуться WASM                              | _(обов’язково, запитується, якщо немає)_ |
| `--image-name <name>`          | Тег образу Docker                                                 | `bentopdf`                               |
| `--output-dir <path>`          | Каталог пакета на виході                                          | `./bentopdf-airgap-bundle`               |
| `--simple-mode`                | Увімкнути Simple Mode                                             | вимк.                                    |
| `--base-url <path>`            | Базовий URL підкаталогу (наприклад, `/pdf/`)                      | `/`                                      |
| `--language <code>`            | Мова інтерфейсу за замовчуванням (наприклад, `fr`, `de`)          | _(немає)_                                |
| `--brand-name <name>`          | Власна назва бренду                                               | _(немає)_                                |
| `--brand-logo <path>`          | Шлях до логотипа відносно `public/`                               | _(немає)_                                |
| `--footer-text <text>`         | Власний текст футера                                              | _(немає)_                                |
| `--ocr-languages <list>`       | Мови OCR для включення, через кому                                | `eng`                                    |
| `--list-ocr-languages`         | Вивести підтримувані коди й назви OCR та вийти                    | вимк.                                    |
| `--search-ocr-language <term>` | Пошук кодів OCR за назвою або абревіатурою                        | вимк.                                    |
| `--dockerfile <path>`          | Dockerfile для використання                                       | `Dockerfile`                             |
| `--skip-docker`                | Пропустити збірку й експорт Docker                                | вимк.                                    |
| `--skip-wasm`                  | Пропустити завантаження WASM (повторно використати наявні `.tgz`) | вимк.                                    |

Інтерактивний запит також приймає `list` для виводу повного списку підтримуваних кодів Tesseract і `search <term>` для пошуку збігів, наприклад `search german` або `search chi`.

::: warning Вимога одного походження
Файли WASM мають обслуговуватися з **того самого походження**, що й застосунок BentoPDF. Веб-воркери використовують `importScripts()`, який не може завантажувати скрипти з іншого походження. Наприклад, якщо BentoPDF працює на `https://internal.example.com`, базовий URL WASM також має бути `https://internal.example.com/wasm`.
:::

#### Ручні кроки

<details>
<summary>Якщо ви хочете зробити все вручну без скрипта</summary>

**Крок 1: Завантажте пакети WASM і OCR** (на машині з інтернетом)

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

**Крок 2: Зберіть образ Docker із внутрішніми URL**

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

**Крок 3: Експортуйте образ Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**Крок 4: Перенесіть в ізольовану мережу**

Скопіюйте через USB, внутрішнє сховище артефактів або інший схвалений спосіб передачі:

- `bentopdf.tar`: образ Docker
- П’ять пакетів `.tgz` WASM/OCR з кроку 1
- Каталог `tesseract-langdata/` з кроку 1
- Каталог `ocr-fonts/` з кроку 1

**Крок 5: Налаштуйте всередині ізольованої мережі**

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

Переконайтеся, що файли доступні за URL-адресами, налаштованими на кроці 2, зокрема `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` і `.../ocr/fonts`.

</details>

::: info Збираєте з вихідного коду замість Docker?
Задайте змінні в `.env.production` перед запуском `npm run build`:

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

### Розміщення власного WASM-проксі

Якщо потрібно віддавати файли WASM під AGPL із правильними заголовками CORS, можна розгорнути простий проксі. Приклад реалізації дивіться в [посібнику Cloudflare WASM Proxy](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md).

::: tip Навіщо розділення?
Таке розділення забезпечує:

- Чітку юридичну відповідність для комерційних користувачів
- Збереження ядра BentoPDF під його подвійною ліцензією (AGPL-3.0 / Commercial)
- Завантаження файлів WASM під час виконання, а не вбудовування у вихідний код
  :::

## Системні вимоги

| Вимога  | Мінімум                         |
| ------- | ------------------------------- |
| Сховище | ~100 МБ (ядро без модулів AGPL) |
| RAM     | 512 МБ                          |
| CPU     | Будь-який сучасний процесор     |

::: tip
BentoPDF є статичним сайтом: база даних чи серверна частина не потрібні!
:::
