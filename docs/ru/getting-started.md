# Начало работы

Добро пожаловать в BentoPDF! Это руководство поможет вам быстро начать работу.

## Что такое BentoPDF?

BentoPDF: бесплатный набор PDF-инструментов с открытым исходным кодом и упором на приватность, который работает **целиком в вашем браузере**. Ваши файлы никогда не покидают устройство: вся обработка выполняется локально с помощью WebAssembly (WASM).

## Быстрый старт

### Вариант 1: размещённая версия

Откройте [bentopdf.com](https://www.bentopdf.com) и пользуйтесь BentoPDF сразу, без установки.

### Вариант 2: самостоятельный хостинг в Docker

> [!IMPORTANT]
> Для конвертации файлов Office нужен `SharedArrayBuffer`, а для него требуется всё перечисленное:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - безопасный контекст
>
> `http://localhost` подходит для локального тестирования, так как браузеры считают loopback доверенным. `http://192.168.x.x` и другие адреса локальной сети обычно не считаются, поэтому для конвертации Word/Excel/PowerPoint с других устройств в вашей сети понадобится HTTPS.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF выпускается в двух сборках: **Self-Hosted** (`bentopdf-simple`, используется выше) для внутренних, командных и корпоративных развёртываний и **Commercial** (`bentopdf:latest`), которую использует сам bentopdf.com и владельцы коммерческой лицензии для публичных развёртываний. В обеих одинаковые PDF-инструменты, а Commercial добавляет главный экран, FAQ, отзывы и подвал bentopdf.com. Если сомневаетесь, берите сборку Self-Hosted.

Затем откройте `http://localhost:3000` в браузере.

> [!NOTE]
> Если вы готовите изолированное (air-gapped) развёртывание OCR, помимо воркера Tesseract, основного рантайма и файлов traineddata нужно разместить внутри сети и шрифты текстового слоя OCR. Полная настройка описана в разделе [Самостоятельный хостинг](/ru/self-hosting/), включая `VITE_OCR_FONT_BASE_URL` и поставляемый каталог `ocr-fonts/`.

### Вариант 3: сборка из исходников

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Возможности вкратце

| Категория              | Инструменты                                                           |
| ---------------------- | --------------------------------------------------------------------- |
| **Конвертация в PDF**  | Word, Excel, PowerPoint, изображения, Markdown, EPUB, MOBI и другое   |
| **Конвертация из PDF** | JPG, PNG, текст, Excel, SVG и другое                                  |
| **Правка и аннотации** | Подпись, выделение, скрытие данных, заполнение форм, штампы           |
| **Организация**        | Объединение, разделение, поворот, удаление страниц, изменение порядка |
| **Оптимизация**        | Сжатие, восстановление, сведение слоёв, OCR                           |
| **Безопасность**       | Шифрование, расшифровка, снятие ограничений                           |

## Поддержка браузеров

BentoPDF лучше всего работает в современных браузерах:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Дальнейшие шаги

- [Изучите все инструменты](/ru/tools/)
- [Разверните BentoPDF у себя](/ru/self-hosting/)
- [Участвуйте в проекте](/ru/contributing)
