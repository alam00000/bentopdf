# Пачатак працы

Вітаем у BentoPDF! Гэта кіраўніцтва дапаможа вам хутка пачаць працу.

## Што такое BentoPDF?

BentoPDF гэта бясплатны набор інструментаў PDF з адкрытым зыходным кодам, арыентаваны на прыватнасць, які працуе **цалкам у вашым браўзеры**. Вашы файлы ніколі не пакідаюць вашу прыладу: уся апрацоўка адбываецца лакальна з дапамогай тэхналогіі WebAssembly (WASM).

## Хуткі старт

### Варыянт 1: Выкарыстоўвайце размешчаную версію

Наведайце [bentopdf.com](https://www.bentopdf.com), каб адразу карыстацца BentoPDF, без усталявання.

### Варыянт 2: Уласнае размяшчэнне з Docker

> [!IMPORTANT]
> Канвертацыя офісных файлаў патрабуе `SharedArrayBuffer`, для якога патрэбныя:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - бяспечны кантэкст
>
> `http://localhost` падыходзіць для лакальнага тэсціравання, бо браўзеры лічаць loopback давераным. `http://192.168.x.x` і іншыя IP-адрасы лакальнай сеткі звычайна не, таму канвертацыя Word/Excel/PowerPoint патрабуе HTTPS пры доступе з іншых прылад у вашай сетцы.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF пастаўляецца ў дзвюх зборках: **Self-Hosted build** (`bentopdf-simple`, выкарыстоўваецца вышэй) для ўнутраных, камандных і арганізацыйных разгортванняў, і **Commercial build** (`bentopdf:latest`), якую выкарыстоўвае сам bentopdf.com і ўладальнікі камерцыйнай ліцэнзіі для публічных разгортванняў. Абедзве маюць аднолькавыя інструменты PDF; Commercial build дадае галоўны блок, FAQ, водгукі і футэр bentopdf.com. Калі сумняваецеся, выкарыстоўвайце Self-Hosted build.

Затым адкрыйце `http://localhost:3000` у браўзеры.

> [!NOTE]
> Калі вы рыхтуеце ізаляванае (air-gapped) разгортванне OCR, вам трэба размясціць шрыфты тэкставага слоя OCR унутры сеткі ў дадатак да воркера Tesseract, асноўнага асяроддзя выканання і файлаў traineddata. Поўная наладка апісана ў раздзеле [Уласнае размяшчэнне](/be/self-hosting/), уключаючы `VITE_OCR_FONT_BASE_URL` і ўбудаваны каталог `ocr-fonts/`.

### Варыянт 3: Зборка з зыходнага кода

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Магчымасці коратка

| Катэгорыя                  | Інструменты                                                                  |
| -------------------------- | ---------------------------------------------------------------------------- |
| **Канвертаваць у PDF**     | Word, Excel, PowerPoint, відарысы, Markdown, EPUB, MOBI і іншае              |
| **Канвертаваць з PDF**     | JPG, PNG, тэкст, Excel, SVG і іншае                                          |
| **Рэдагаванне і анатацыі** | Подпіс, вылучэнне, рэдагаванне канфідэнцыйных даных, запаўненне форм, штампы |
| **Арганізацыя**            | Аб'яднанне, падзел, паварот, выдаленне старонак, змена парадку               |
| **Аптымізацыя**            | Сцісканне, аднаўленне, зглажванне, OCR                                       |
| **Бяспека**                | Шыфраванне, расшыфроўка, зняцце абмежаванняў                                 |

## Падтрымка браўзераў

BentoPDF лепш за ўсё працуе ў сучасных браўзерах:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Наступныя крокі

- [Агляд усіх інструментаў](/be/tools/)
- [Размясціць BentoPDF у сябе](/be/self-hosting/)
- [Зрабіць унёсак у праект](/be/contributing)
