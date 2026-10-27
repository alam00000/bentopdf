# Развертывание в Vercel

[Vercel](https://vercel.com) предлагает самый простой способ развертывания статических сайтов.

## Развертывание в один клик

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Ручное развертывание

### Шаг 1: Сделайте форк репозитория

Сделайте форк [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) в свой аккаунт GitHub.

### Шаг 2: Импортируйте в Vercel

1. Перейдите на [vercel.com/new](https://vercel.com/new)
2. Выберите свой форк репозитория
3. Настройте проект:

| Параметр         | Значение        |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Шаг 3: Переменные окружения (необязательно)

Добавьте их при необходимости:

| Переменная              | Описание                                                                |
| ----------------------- | ----------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Укажите `true` для минимального интерфейса                              |
| `VITE_BRAND_NAME`       | Свое название бренда (заменяет «BentoPDF»)                              |
| `VITE_BRAND_LOGO`       | Путь к логотипу относительно `public/` (например, `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Свой текст подвала и авторских прав                                     |
| `VITE_DEFAULT_LANGUAGE` | Язык интерфейса по умолчанию (например, `fr`, `de`, `es`)               |

### Шаг 4: Разверните

Нажмите «Deploy» и дождитесь завершения сборки.

## Собственный домен

1. Откройте настройки проекта
2. Перейдите в раздел «Domains»
3. Добавьте свой домен
4. Настройте DNS по инструкции

## Ограничения

::: warning Большие файлы
У serverless-функций Vercel есть ограничение в 50 МБ. Поскольку BentoPDF является статическим сайтом, это не должно вас затронуть, но модули WASM велики (около 100 МБ в сумме). Убедитесь, что они раздаются из папки `/public`.
:::

## Устранение неполадок

### Тайм-аут сборки

Если сборка завершается по тайм-ауту, попробуйте:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Ошибка 404 при обновлении страницы

Добавьте `vercel.json` для маршрутизации SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Конвертация Word/ODT/Excel в PDF не работает

Для конвертации через LibreOffice WASM нужен `SharedArrayBuffer`, а для него на всех страницах должны быть следующие заголовки ответа:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Предварительно сжатым файлам `.wasm.gz` и `.data.gz` также нужен заголовок `Content-Encoding: gzip`, чтобы браузер их распаковывал.

Добавьте это в свой `vercel.json`:

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

Для проверки откройте консоль DevTools и выполните `console.log(window.crossOriginIsolated)`: должно вернуться `true`.
