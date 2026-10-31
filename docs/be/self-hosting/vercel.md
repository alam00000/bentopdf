# Разгортванне на Vercel

[Vercel](https://vercel.com) прапануе самы просты спосаб разгортвання статычных сайтаў.

## Разгортванне адным клікам

[![Разгарнуць з Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Ручное разгортванне

### Крок 1: Зрабіце форк рэпазіторыя

Зрабіце форк [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) у свой уліковы запіс GitHub.

### Крок 2: Імпарт у Vercel

1. Перайдзіце на [vercel.com/new](https://vercel.com/new)
2. Выберыце свой форк рэпазіторыя
3. Наладзьце праект:

| Налада           | Значэнне        |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Крок 3: Зменныя асяроддзя (неабавязкова)

Дадайце пры неабходнасці:

| Зменная                 | Апісанне                                                             |
| ----------------------- | -------------------------------------------------------------------- |
| `SIMPLE_MODE`           | Задайце `true` для мінімальнага інтэрфейсу                           |
| `VITE_BRAND_NAME`       | Уласная назва брэнда (замяняе "BentoPDF")                            |
| `VITE_BRAND_LOGO`       | Шлях да лагатыпа адносна `public/` (напрыклад, `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Уласны тэкст ніжняга калантытула/аўтарскага права                    |
| `VITE_DEFAULT_LANGUAGE` | Мова інтэрфейсу па змаўчанні (напрыклад, `fr`, `de`, `es`)           |

### Крок 4: Разгортванне

Націсніце "Deploy" і пачакайце завяршэння зборкі.

## Уласны дамен

1. Адкрыйце налады праекта
2. Перайдзіце ў "Domains"
3. Дадайце свой дамен
4. Наладзьце DNS паводле інструкцый

## Абмежаванні

::: warning Вялікія файлы
Бессерверныя функцыі Vercel маюць абмежаванне 50MB. Паколькі BentoPDF з'яўляецца статычным сайтам, гэта не павінна вас закрануць, але модулі WASM вялікія (каля 100MB агулам). Пераканайцеся, што яны раздаюцца з папкі `/public`.
:::

## Выпраўленне непаладак

### Перавышэнне часу зборкі

Калі зборка перавышае час чакання, паспрабуйце:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 404 пры абнаўленні старонкі

Дадайце `vercel.json` для маршрутызацыі SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Word/ODT/Excel у PDF не працуе

Пераўтварэнні LibreOffice WASM патрабуюць `SharedArrayBuffer`, для чаго на ўсіх старонках патрэбныя такія загалоўкі адказу:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Папярэдне сціснутым файлам `.wasm.gz` і `.data.gz` таксама патрэбны `Content-Encoding: gzip`, каб браўзер іх распакоўваў.

Дадайце гэта ў свой `vercel.json`:

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

Каб праверыць, адкрыйце кансоль DevTools і выканайце `console.log(window.crossOriginIsolated)`: павінна вярнуцца `true`.
