# Розгортання у Vercel

[Vercel](https://vercel.com) пропонує найпростіше розгортання статичних сайтів.

## Розгортання в один клік

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Ручне розгортання

### Крок 1: Створіть форк репозиторію

Створіть форк [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) у своєму акаунті GitHub.

### Крок 2: Імпортуйте у Vercel

1. Перейдіть на [vercel.com/new](https://vercel.com/new)
2. Виберіть свій форк репозиторію
3. Налаштуйте проєкт:

| Параметр         | Значення        |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Крок 3: Змінні середовища (необов’язково)

Додайте їх за потреби:

| Змінна                  | Опис                                                                  |
| ----------------------- | --------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Встановіть `true` для мінімального інтерфейсу                         |
| `VITE_BRAND_NAME`       | Власна назва бренду (замінює "BentoPDF")                              |
| `VITE_BRAND_LOGO`       | Шлях до логотипа відносно `public/` (наприклад, `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Власний текст футера/авторських прав                                  |
| `VITE_DEFAULT_LANGUAGE` | Мова інтерфейсу за замовчуванням (наприклад, `fr`, `de`, `es`)        |

### Крок 4: Розгортання

Натисніть "Deploy" і дочекайтеся завершення збірки.

## Власний домен

1. Перейдіть до налаштувань проєкту
2. Відкрийте "Domains"
3. Додайте свій домен
4. Налаштуйте DNS відповідно до інструкцій

## Обмеження

::: warning Великі файли
Серверні функції Vercel мають ліміт 50 МБ. Оскільки BentoPDF є статичним сайтом, це не повинно вплинути на вас, але модулі WASM великі (загалом ~100 МБ). Переконайтеся, що вони віддаються з папки `/public`.
:::

## Усунення неполадок

### Тайм-аут збірки

Якщо збірка завершується за тайм-аутом, спробуйте:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Помилка 404 після оновлення сторінки

Додайте `vercel.json` для маршрутизації SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Не працює перетворення Word/ODT/Excel у PDF

Перетворення через LibreOffice WASM потребують `SharedArrayBuffer`, для якого на всіх сторінках потрібні такі заголовки відповіді:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Попередньо стиснуті файли `.wasm.gz` і `.data.gz` також потребують `Content-Encoding: gzip`, щоб браузер їх розпакував.

Додайте це до свого `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.wasm.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/wasm" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.data.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/octet-stream" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    }
  ]
}
```

Щоб перевірити, відкрийте консоль DevTools і виконайте `console.log(window.crossOriginIsolated)`: має повернутися `true`.
