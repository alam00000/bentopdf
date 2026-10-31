# Кіраўніцтва па самастойным размяшчэнні

BentoPDF можна размясціць на ўласнай інфраструктуры. Гэта кіраўніцтва апісвае розныя варыянты разгортвання.

## Хуткі старт з Docker / Podman

Самы хуткі спосаб размясціць BentoPDF самастойна:

> [!TIP]
> BentoPDF пастаўляецца ў дзвюх зборках:
>
> - **Зборка для самастойнага размяшчэння**: `ghcr.io/alam00000/bentopdf-simple:latest`. Усе інструменты PDF, **без** маркетынгавага афармлення (без hero-блока, FAQ, водгукаў, ніжняга калантытула). Выкарыстоўвайце яе для ўнутраных разгортванняў каманды або арганізацыі. Гэта **не** скарочаная "lite" версія.
> - **Камерцыйная зборка**: `ghcr.io/alam00000/bentopdf:latest`. Поўны маркетынгавы сайт, які выкарыстоўвае сам bentopdf.com і ўладальнікі камерцыйнай ліцэнзіі для публічных разгортванняў.
>
> Калі сумняваецеся, бярыце зборку для самастойнага размяшчэння.

> [!IMPORTANT]
> Пераўтварэнне офісных файлаў патрабуе `SharedArrayBuffer`, а значыць, праграма павінна быць ізаляванай паміж крыніцамі (cross-origin isolated) і раздавацца з бяспечнага кантэксту. Афіцыйны вобраз ужо адпраўляе патрэбныя загалоўкі COOP/COEP, але браўзеры ўсё роўна адключаюць `SharedArrayBuffer` на звычайных HTTP-адрасах лакальнай сеткі, напрыклад `http://192.168.x.x`.
>
> Выкарыстоўвайце `http://localhost` толькі для праверкі на той жа прыладзе. Калі карыстальнікі заходзяць у BentoPDF праз IP або імя хаста ў LAN, падключыце HTTPS.

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

Запускайце BentoPDF як сэрвіс systemd. Стварыце `~/.config/containers/systemd/bentopdf.container`:

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

Поўная дакументацыя па Quadlet ёсць у [кіраўніцтве па разгортванні з Docker](/be/self-hosting/docker).

## Зборка з зыходнага кода

```bash
# Clone and build
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf
npm install
npm run build

# The built files are in the `dist` folder
```

## Параметры канфігурацыі

### Зборка для самастойнага размяшчэння (Simple Mode)

Зборка для самастойнага размяшчэння (вобраз `bentopdf-simple`, таксама вядомы як Simple Mode) **функцыянальна ідэнтычная** камерцыйнай зборцы: усе інструменты PDF прысутнічаюць і працуюць аднолькава. Яна толькі хавае маркетынгавае афармленне, якое мае сэнс толькі на самім bentopdf.com або ў камерцыйным публічным разгортванні. **Гэта не скарочаная і не "lite" версія.**

**Што хавае зборка для самастойнага размяшчэння** (толькі касметыка, ніякія функцыі PDF не выдаляюцца):

- Панэль навігацыі, hero-блок, раздзел магчымасцей, FAQ, водгукі, ніжні калантытул
- Змяняе загаловак старонкі на "Інструменты PDF"

**Што застаецца ў зборцы для самастойнага размяшчэння** (усё, што сапраўды працуе з PDF):

- Усе інструменты PDF (аб'яднанне, падзел, рэдагаванне, подпіс, OCR, пераўтварэнне офісных файлаў і г.д.)
- Падтрымка ўласнага брэндынгу, уся канфігурацыя падчас зборкі і выканання

Камерцыйная зборка (`ghcr.io/alam00000/bentopdf:latest`) ляжыць у аснове самога bentopdf.com і выкарыстоўваецца ўладальнікамі камерцыйнай ліцэнзіі для публічных разгортванняў: яна дадае hero-блок, FAQ, водгукі і ніжні калантытул, якія не мелі б сэнсу ва ўнутраным інструменце.

Калі вы размяшчаеце BentoPDF для сваёй каманды, арганізацыі або як унутраны інструмент, бярыце зборку для самастойнага размяшчэння:

```bash
# Use the pre-built image (recommended)
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or build it yourself
SIMPLE_MODE=true npm run build
```

Падрабязнасці глядзіце ў [SIMPLE_MODE.md](https://github.com/alam00000/bentopdf/blob/main/SIMPLE_MODE.md).

### Камерцыйная зборка (публічныя разгортванні пад уласным брэндам)

Камерцыйная зборка (вобраз `bentopdf`, без суфікса `-simple`) ляжыць у аснове самога bentopdf.com. Яна ўключае поўны маркетынгавы сайт (hero-блок, магчымасці, FAQ, водгукі, ніжні калантытул) у дадатак да ўсіх інструментаў PDF. Выкарыстоўвайце гэтую зборку, калі хочаце **разгарнуць BentoPDF як публічны PDF-сэрвіс пад уласным брэндам**, напрыклад:

- Вы прапануеце BentoPDF як SaaS для канчатковых карыстальнікаў на сваім дамене
- Вам патрэбна поўная старонка (маркетынгавыя раздзелы + інструменты), а не толькі голы набор інструментаў
- Вы ўладальнік камерцыйнай ліцэнзіі і ўбудоўваеце BentoPDF у камерцыйны прадукт

**Запуск як ёсць** (брэндынг BentoPDF, зручна для папярэдняга прагляду зборкі):

```bash
docker run -p 3000:8080 ghcr.io/alam00000/bentopdf:latest
```

**Зборка з уласным брэндам** (тыповы камерцыйны сцэнарый):

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. All rights reserved." \
  -t acmepdf .

docker run -p 3000:8080 acmepdf
```

Усе іншыя параметры зборкі (`BASE_URL`, `VITE_DEFAULT_LANGUAGE`, `DISABLE_TOOLS`, перавызначэнні URL для WASM і г.д.) працуюць гэтак жа, як і ў зборцы для самастойнага размяшчэння.

::: warning Ліцэнзаванне
Выкарыстанне камерцыйнай зборкі дазволена паводле любога з двух варыянтаў ліцэнзіі BentoPDF:

- **AGPL-3.0** (бясплатна): дазволена, калі ваша разгортванне публікуе ўвесь свой зыходны код пад AGPL, уключаючы змены брэндынгу і звязаную бізнес-логіку.
- **Камерцыйная ліцэнзія** ($79 пажыццёва): патрэбна для закрытых / прапрыетарных разгортванняў, калі вы не адкрываеце код свайго форка з брэндынгам або бізнес-код.

Поўнае параўнанне глядзіце на [старонцы ліцэнзавання](https://www.bentopdf.com/licensing). Модулі WASM пад AGPL (PyMuPDF, Ghostscript, CoherentPDF) загружаюцца з CDN падчас выканання, таму яны не трапляюць у ваш вобраз і не змяняюць вашага ліцэнзійнага становішча.
:::

### Базавы URL

Разгортванне ў падкаталог:

```bash
BASE_URL=/pdf-tools/ npm run build
```

### Уласны брэндынг

Замяніце стандартны лагатып, назву і тэкст ніжняга калантытула BentoPDF на свае падчас зборкі:

| Зменная            | Апісанне                                          | Па змаўчанні                            |
| ------------------ | ------------------------------------------------- | --------------------------------------- |
| `VITE_BRAND_NAME`  | Назва брэнда ў загалоўку і ніжнім калантытуле     | `BentoPDF`                              |
| `VITE_BRAND_LOGO`  | Шлях да лагатыпа адносна `public/`                | `images/favicon-no-bg.svg`              |
| `VITE_FOOTER_TEXT` | Уласны тэкст ніжняга калантытула/аўтарскага права | `© 2026 BentoPDF. All rights reserved.` |

```bash
# Place your logo in public/, then build
VITE_BRAND_NAME="AcmePDF" \
VITE_BRAND_LOGO="images/acme-logo.svg" \
VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
npm run build
```

Або праз Docker:

```bash
docker build \
  --build-arg VITE_BRAND_NAME="AcmePDF" \
  --build-arg VITE_BRAND_LOGO="images/acme-logo.svg" \
  --build-arg VITE_FOOTER_TEXT="© 2026 Acme Corp. Internal use only." \
  -t acmepdf .
```

Брэндынг працуе і ў поўным рэжыме, і ў Simple Mode, і можа спалучацца з усімі іншымі параметрамі зборкі (`BASE_URL`, `SIMPLE_MODE`, `VITE_DEFAULT_LANGUAGE`).

### Адключэнне пэўных інструментаў

Хавайце асобныя інструменты з меркаванняў адпаведнасці патрабаванням або бяспекі. Адключаныя інструменты выдаляюцца з галоўнай старонкі, пошуку, спалучэнняў клавіш, канструктара працоўных працэсаў і недаступныя па прамым URL.

Ідэнтыфікатары інструментаў: гэта URL старонкі без `.html`. Адкрыйце любы інструмент і паглядзіце на URL (напрыклад, `edit-pdf`, `sign-pdf`, `encrypt-pdf`).

**Падчас зборкі** (убудоўваецца ў бандл):

```bash
DISABLE_TOOLS="edit-pdf,sign-pdf" npm run build
```

**Падчас выканання** (без перазборкі, падключыце `config.json`):

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

Абодва спосабы можна спалучаць: спісы аб'ядноўваюцца.

Таксама можна адключыць асобныя функцыі ў рэдактары PDF (напрыклад, рэдагаванне канфідэнцыйных даных), не адключаючы ўвесь інструмент, дадаўшы `editorDisabledCategories` у `config.json`. Поўны спіс катэгорый глядзіце ў [кіраўніцтве па Docker](/be/self-hosting/docker#адключэнне-функцыи-рэдактара).

## Кіраўніцтвы па разгортванні

Выберыце платформу:

- [Vercel](/be/self-hosting/vercel)
- [Netlify](/be/self-hosting/netlify)
- [Cloudflare Pages](/be/self-hosting/cloudflare)
- [AWS S3 + CloudFront](/be/self-hosting/aws)
- [Hostinger](/be/self-hosting/hostinger)
- [Nginx](/be/self-hosting/nginx)
- [Apache](/be/self-hosting/apache)
- [Docker](/be/self-hosting/docker)
- [Kubernetes](/be/self-hosting/kubernetes)
- [CORS-проксі](/be/self-hosting/cors-proxy) - патрэбны для лічбавых подпісаў

## Тыповыя праблемы

### Word / ODT / Excel / PowerPoint у PDF завісае (SharedArrayBuffer недаступны)

**Сімптом**: пераўтварэнні дакументаў на базе LibreOffice (Word, ODT, Excel, PowerPoint у PDF) завісаюць на ~55% або не пачынаюцца. У кансолі браўзера можа быць:

> `ReferenceError: SharedArrayBuffer is not defined`

…або `window.crossOriginIsolated` вяртае `false`, або кампіляцыя WASM паведамляе `expected magic word 00 61 73 6d, found 1f 8b 08 08`.

**Прычына**: LibreOffice WASM патрабуе `SharedArrayBuffer`, які браўзер уключае толькі калі старонка **ізаляваная паміж крыніцамі** І раздаецца з **бяспечнага кантэксту**. Гэта значыць, што павінны выконвацца дзве ўмовы:

1. Кожны адказ уключае абодва загалоўкі:
   - `Cross-Origin-Embedder-Policy: require-corp`
   - `Cross-Origin-Opener-Policy: same-origin`
2. Старонка раздаецца з `https://...` або `http://localhost`. Звычайны HTTP на IP лакальнай сеткі (напрыклад, `http://192.168.x.x`) НЕ лічыцца бяспечным: браўзеры адключаюць там `SharedArrayBuffer`.

Неадпаведнасць `00 61 73 6d / 1f 8b 08 08` з'яўляецца асобным сімптомам: у папярэдне сціснутых файлаў `.wasm.gz` / `.data.gz` няма загалоўка адказу `Content-Encoding: gzip`, таму браўзер атрымлівае сырыя байты gzip замест распакаванага WASM.

**Рашэнне**: дакладную канфігурацыю глядзіце ў кіраўніцтве для вашай платформы:

- [Nginx →](/be/self-hosting/nginx#word-odt-excel-у-pdf-не-працуе)
- [Apache →](/be/self-hosting/apache#word-odt-excel-у-pdf-не-працуе)
- [AWS S3 + CloudFront →](/be/self-hosting/aws#крок-3b-палітыка-загалоукау-адказу-абавязкова-для-libreoffice-wasm)
- [Cloudflare Pages →](/be/self-hosting/cloudflare#фаил-канфігурацыі) (файл `_headers`)
- [Netlify →](/be/self-hosting/netlify#word-odt-excel-у-pdf-спыняецца-на-55) (`netlify.toml`)
- [Vercel →](/be/self-hosting/vercel#word-odt-excel-у-pdf-не-працуе) (`vercel.json`)
- [Hostinger →](/be/self-hosting/hostinger#інструменты-libreoffice-не-працуюць) (`.htaccess`)
- [Kubernetes →](/be/self-hosting/kubernetes#як-пераканацца-што-загалоукі-sharedarraybuffer-працуюць-ingress-gateway)
- **Docker**: апрацоўваецца аўтаматычна ўбудаванай канфігурацыяй nginx, нічога рабіць не трэба.

**Праверка**: адкрыйце кансоль DevTools на любой старонцы BentoPDF і выканайце:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Калі старонка працуе праз HTTPS або `http://localhost` І абодва загалоўкі COEP/COOP ёсць у кожным адказе, абедзве праверкі праходзяць. Калі вы на `http://192.168.x.x` або іншым не-loopback HTTP-адрасе, падключыце HTTPS: выпраўлення толькі загалоўкамі няма.

### Файлы `.mjs` аддаюцца як `application/octet-stream`

**Сімптом**: Падпісаць PDF / Запаўненне форм / некаторыя іншыя інструменты паказваюць пусты праглядальнік або не загружаюцца. Кансоль браўзера паведамляе:

> `Failed to load module script: The server responded with a non-JavaScript MIME type of "application/octet-stream". Strict MIME type checking is enforced for module scripts per HTML spec.`

**Прычына**: у вашым вэб-серверы або зваротным проксі няма адпаведнасці MIME-тыпу для файлаў `.mjs` (убудаваны праглядальнік PDF пастаўляецца з ES-модулямі з гэтым пашырэннем). Многія стандартныя канфігурацыі сервераў па змаўчанні аддаюць `application/octet-stream` для невядомых пашырэнняў, а браўзеры адмаўляюцца выконваць такое як ES-модулі.

**Рашэнне**: дакладны фрагмент глядзіце ў кіраўніцтве для вашай платформы:

- [Nginx →](/be/self-hosting/nginx#падпісаць-pdf-або-запауненне-форм-паказвае-пусты-праглядальнік-памылка-mime-mjs)
- [Apache →](/be/self-hosting/apache#падпісаць-pdf-або-запоуніць-форму-pdf-паказвае-пусты-прагляднік-памылка-mime-mjs)
- [AWS S3 + CloudFront →](/be/self-hosting/aws#крок-2-зборка-і-загрузка) (глядзіце `aws s3 cp ... --include "*.mjs"`)
- [Kubernetes →](/be/self-hosting/kubernetes#памылкі-mime-тыпу-mjs-пусты-iframe-у-падпісаць-pdf-запауненне-форм)
- **Docker, Vercel, Netlify, Cloudflare Pages, Hostinger**: апрацоўваецца аўтаматычна, нічога рабіць не трэба.

**Праверка**: адкрыйце DevTools → укладка Network, знайдзіце няўдалы запыт `.mjs` і праверце загаловак адказу `Content-Type`. Ён павінен быць `application/javascript`. Калі ён усё яшчэ `application/octet-stream`, знешні зваротны проксі або CDN можа паўторна вызначаць тып: праверце кожны ўзровень ланцужка раздачы.

## Канфігурацыя WASM (кампаненты AGPL)

BentoPDF **не ўключае** ў свой зыходны код бібліятэкі апрацоўкі пад ліцэнзіяй AGPL, але **загадзя наладжвае URL CDN**, каб усе функцыі працавалі адразу, без ручной налады.

::: tip Без налад па змаўчанні
Пачынаючы з v2.0.0, модулі WASM загадзя наладжаны на загрузку з CDN jsDelivr праз зменныя асяроддзя. Усе пашыраныя функцыі працуюць адразу без налад з боку карыстальніка.
:::

| Кампанент       | Ліцэнзія | Функцыі                                                             |
| --------------- | -------- | ------------------------------------------------------------------- |
| **PyMuPDF**     | AGPL-3.0 | Пераўтварэнне EPUB/MOBI/FB2/XPS, выманне выяў, выманне табліц       |
| **Ghostscript** | AGPL-3.0 | Пераўтварэнне ў PDF/A, сцісканне, выраўноўванне нахілу, растраванне |
| **CoherentPDF** | AGPL-3.0 | Змест, далучэнні, аб'яднанне PDF з закладкамі                       |

### Зменныя асяроддзя па змаўчанні

Яны задаюцца ў `.env.production` і ўбудоўваюцца ў зборку:

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

### Перавызначэнне URL для WASM

Значэнні па змаўчанні можна перавызначыць падчас зборкі для ўласных разгортванняў:

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

Каб цалкам адключыць модуль (патрабуючы ручной налады карыстальнікам праз пашыраныя налады), задайце яго зменнай пусты радок.

Для OCR альбо пакіньце ўсе зменныя `VITE_TESSERACT_*` пустымі і выкарыстоўвайце стандартныя анлайн-рэсурсы, альбо задайце URL worker/core/lang разам для ўласнага або аўтаномнага OCR. Калі вы ўключаеце толькі пэўныя мовы OCR, таксама задайце `VITE_TESSERACT_AVAILABLE_LANGUAGES` з тымі ж кодамі праз коску, каб інтэрфейс прапаноўваў толькі ўсталяваныя мовы, а непадтрымліваемы выбар завяршаўся зразумелай памылкай. Для поўнасцю аўтаномнага выніку PDF з пошукам таксама задайце `VITE_OCR_FONT_BASE_URL` на ўнутраны каталог, які раздае ўбудаваныя шрыфты OCR.

Карыстальнікі таксама могуць у любы момант перавызначыць гэтыя значэнні праз **Пашыраныя налады** ў інтэрфейсе: перавызначэнні карыстальніка, захаваныя ў браўзеры, маюць прыярытэт над значэннямі асяроддзя.

### Ізаляванае / аўтаномнае разгортванне

Для сетак без доступу да інтэрнэту (дзяржаўныя, медыцынскія, фінансавыя і г.д.). URL для WASM убудоўваюцца ў JavaScript **падчас зборкі**, а самі файлы WASM спампоўвае **браўзер карыстальніка** падчас выканання. Таму ўсё трэба падрыхтаваць на машыне з інтэрнэтам, а потым перанесці ў ізаляваную сетку.

#### Аўтаматычны скрыпт (рэкамендуецца)

Уключаны скрыпт `prepare-airgap.sh` аўтаматызуе ўвесь працэс: спампоўвае пакеты WASM, збірае вобраз Docker і стварае самадастатковы пакет са скрыптом усталявання.

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

У выніку атрымаецца каталог пакета:

```
bentopdf-airgap-bundle/
  bentopdf.tar              # Docker image
  *.tgz                     # WASM packages (PyMuPDF, Ghostscript, CoherentPDF, Tesseract)
  tesseract-langdata/       # OCR traineddata files
  ocr-fonts/                # OCR text-layer font files
  setup.sh                  # Setup script for the air-gapped side
  README.md                 # Instructions
```

Перанясіце пакет у ізаляваную сетку праз USB, унутраны рэпазіторый артэфактаў або іншы дазволены спосаб. Затым запусціце ўключаны скрыпт усталявання:

```bash
cd bentopdf-airgap-bundle
bash setup.sh
```

Скрыпт загружае вобраз Docker, распакоўвае файлы WASM і пры жаданні запускае кантэйнер.

**Параметры скрыпта:**

| Сцяг                           | Апісанне                                                   | Па змаўчанні                           |
| ------------------------------ | ---------------------------------------------------------- | -------------------------------------- |
| `--wasm-base-url <url>`        | Дзе WASM будуць размешчаны ўнутры сеткі                    | _(абавязкова, запытваецца, калі няма)_ |
| `--image-name <name>`          | Тэг вобраза Docker                                         | `bentopdf`                             |
| `--output-dir <path>`          | Каталог выніковага пакета                                  | `./bentopdf-airgap-bundle`             |
| `--simple-mode`                | Уключыць Simple Mode                                       | выкл.                                  |
| `--base-url <path>`            | Базавы URL падкаталога (напрыклад, `/pdf/`)                | `/`                                    |
| `--language <code>`            | Мова інтэрфейсу па змаўчанні (напрыклад, `fr`, `de`)       | _(няма)_                               |
| `--brand-name <name>`          | Уласная назва брэнда                                       | _(няма)_                               |
| `--brand-logo <path>`          | Шлях да лагатыпа адносна `public/`                         | _(няма)_                               |
| `--footer-text <text>`         | Уласны тэкст ніжняга калантытула                           | _(няма)_                               |
| `--ocr-languages <list>`       | Мовы OCR для ўключэння ў пакет праз коску                  | `eng`                                  |
| `--list-ocr-languages`         | Вывесці падтрымліваемыя коды і назвы OCR і выйсці          | выкл.                                  |
| `--search-ocr-language <term>` | Пошук кодаў OCR па назве або скарачэнні                    | выкл.                                  |
| `--dockerfile <path>`          | Dockerfile для выкарыстання                                | `Dockerfile`                           |
| `--skip-docker`                | Прапусціць зборку і экспарт Docker                         | выкл.                                  |
| `--skip-wasm`                  | Прапусціць спампоўванне WASM (выкарыстаць існуючыя `.tgz`) | выкл.                                  |

Інтэрактыўны рэжым таксама прымае `list`, каб вывесці поўны спіс падтрымліваемых кодаў Tesseract, і `search <term>` для пошуку адпаведнасцей, напрыклад `search german` або `search chi`.

::: warning Патрабаванне аднаго паходжання
Файлы WASM павінны раздавацца з **таго ж паходжання (origin)**, што і праграма BentoPDF. Web Workers выкарыстоўваюць `importScripts()`, які не можа загружаць скрыпты з іншых паходжанняў. Напрыклад, калі BentoPDF працуе на `https://internal.example.com`, базавы URL для WASM таксама павінен быць `https://internal.example.com/wasm`.
:::

#### Ручныя крокі

<details>
<summary>Калі вы аддаеце перавагу рабіць усё ўручную без скрыпта</summary>

**Крок 1: Спампуйце пакеты WASM і OCR** (на машыне з інтэрнэтам)

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

**Крок 2: Збярыце вобраз Docker з унутранымі URL**

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

**Крок 3: Экспартуйце вобраз Docker**

```bash
docker save bentopdf -o bentopdf.tar
```

**Крок 4: Перанясіце ў ізаляваную сетку**

Скапіруйце праз USB, унутраны рэпазіторый артэфактаў або іншы дазволены спосаб:

- `bentopdf.tar`: вобраз Docker
- Пяць пакетаў WASM/OCR `.tgz` з кроку 1
- Каталог `tesseract-langdata/` з кроку 1
- Каталог `ocr-fonts/` з кроку 1

**Крок 5: Наладзьце ўнутры ізаляванай сеткі**

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

Пераканайцеся, што файлы даступныя па URL, наладжаных на кроку 2, уключаючы `.../ocr/worker.min.js`, `.../ocr/core`, `.../ocr/lang-data` і `.../ocr/fonts`.

</details>

::: info Збіраеце з зыходнага кода замест Docker?
Задайце зменныя ў `.env.production` перад запускам `npm run build`:

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

### Уласны проксі для WASM

Калі трэба раздаваць файлы WASM пад AGPL з правільнымі загалоўкамі CORS, можна разгарнуць просты проксі. Прыклад рэалізацыі ёсць у [кіраўніцтве па Cloudflare WASM Proxy](https://github.com/alam00000/bentopdf/blob/main/cloudflare/WASM-PROXY.md).

::: tip Чаму асобна?
Такое раздзяленне забяспечвае:

- Зразумелую юрыдычную адпаведнасць для камерцыйных карыстальнікаў
- Ядро BentoPDF застаецца пад двайной ліцэнзіяй (AGPL-3.0 / камерцыйная)
- Файлы WASM загружаюцца падчас выканання, а не ўключаюцца ў зыходны код
  :::

## Сістэмныя патрабаванні

| Патрабаванне | Мінімум                         |
| ------------ | ------------------------------- |
| Сховішча     | ~100 MB (ядро без модуляў AGPL) |
| RAM          | 512 MB                          |
| CPU          | Любы сучасны працэсар           |

::: tip
BentoPDF з'яўляецца статычным сайтам: ніякая база даных або бэкэнд-сервер не патрэбныя!
:::
