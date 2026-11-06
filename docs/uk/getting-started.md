# Початок роботи

Ласкаво просимо до Pixel PDF! Цей посібник допоможе вам швидко розпочати.

## Що таке Pixel PDF?

Pixel PDF це безкоштовний PDF-набір інструментів з відкритим кодом, створений з урахуванням конфіденційності, який працює **повністю у вашому браузері**. Ваші файли ніколи не залишають пристрій: уся обробка відбувається локально за допомогою технології WebAssembly (WASM).

## Швидкий старт

### Варіант 1: використати онлайн-версію

Відвідайте [pixelpdf.com](https://www.pixelpdf.com), щоб скористатися Pixel PDF одразу, без встановлення.

### Варіант 2: розгорнути на власному сервері через Docker

> [!IMPORTANT]
> Конвертація офісних файлів потребує `SharedArrayBuffer`, для чого потрібні обидва заголовки:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - безпечний контекст
>
> `http://localhost` підходить для локального тестування, бо браузери вважають loopback надійним. `http://192.168.x.x` та інші LAN-адреси зазвичай не підходять, тому конвертація Word/Excel/PowerPoint з інших пристроїв вашої мережі вимагатиме HTTPS.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/mohammedalhinaki-cloud/pixel-pdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/mohammedalhinaki-cloud/Pixel-PDF/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> Pixel PDF постачається у двох збірках: **Self-Hosted build** (`pixelpdf-simple`, використана вище) для внутрішніх розгортань у командах і організаціях, та **Commercial build** (`pixelpdf:latest`), яку використовує сам pixelpdf.com і власники комерційної ліцензії для публічних розгортань. Обидві мають однакові PDF-інструменти, а Commercial build додає головний екран, FAQ, відгуки та футер pixelpdf.com. Якщо вагаєтеся, обирайте Self-Hosted build.

Потім відкрийте `http://localhost:3000` у браузері.

> [!NOTE]
> Якщо ви готуєте OCR-розгортання в ізольованому середовищі (air-gapped), окрім Tesseract worker, основного runtime та файлів traineddata, потрібно розмістити внутрішньо й шрифти текстового шару OCR. Повне налаштування описано в розділі [Самостійне розгортання](/uk/self-hosting/), зокрема `VITE_OCR_FONT_BASE_URL` і вбудований каталог `ocr-fonts/`.

### Варіант 3: зібрати з вихідного коду

```bash
# Clone the repository
git clone https://github.com/mohammedalhinaki-cloud/Pixel-PDF.git
cd pixelpdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Можливості коротко

| Категорія                  | Інструменти                                                        |
| -------------------------- | ------------------------------------------------------------------ |
| **Конвертація в PDF**      | Word, Excel, PowerPoint, зображення, Markdown, EPUB, MOBI та інші  |
| **Конвертація з PDF**      | JPG, PNG, текст, Excel, SVG та інші                                |
| **Редагування й анотації** | Підпис, виділення, редагування (redact), заповнення форм, штампи   |
| **Організація**            | Об’єднання, розділення, поворот, видалення сторінок, зміна порядку |
| **Оптимізація**            | Стиснення, відновлення, зведення (flatten), OCR                    |
| **Безпека**                | Шифрування, розшифрування, зняття обмежень                         |

## Підтримка браузерів

Pixel PDF найкраще працює в сучасних браузерах:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Наступні кроки

- [Переглянути всі інструменти](/uk/tools/)
- [Розгорнути Pixel PDF самостійно](/uk/self-hosting/)
- [Долучитися до проєкту](/uk/contributing)
