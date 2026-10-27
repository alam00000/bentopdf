# Удзел у распрацоўцы

Дзякуй за цікавасць да ўдзелу ў распрацоўцы BentoPDF! Гэта кіраўніцтва дапаможа вам пачаць.

## Пачатак працы

### Патрабаванні

- Node.js 18+
- npm 9+
- Git

### Наладка

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Структура праекта

```
bentopdf/
├── src/
│   ├── js/
│   │   ├── config/       # Tool definitions
│   │   ├── logic/        # Tool page logic
│   │   ├── utils/        # Shared utilities
│   │   └── ui.ts         # UI helpers
│   ├── pages/            # Tool HTML pages
│   └── css/              # Styles
├── public/
│   ├── locales/          # Translations
│   └── pymupdf-wasm/     # WASM modules
├── docs/                 # Documentation (VitePress)
└── scripts/              # Build scripts
```

## Даданне новага інструмента

### Крок 1: Стварыце файл логікі

Стварыце `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Крок 2: Стварыце HTML-старонку

Стварыце `src/pages/your-tool.html`, абапіраючыся на існуючыя шаблоны інструментаў.

### Крок 3: Зарэгіструйце інструмент

Дадайце ў `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Крок 4: Дадайце ў канфігурацыю зборкі

Дадайце старонку ў `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Крок 5: Дадайце пераклады

Дадайце запісы ва ўсе файлы лакалізацыі ў `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Стыль кода

- Выкарыстоўвайце TypeScript для ўсяго новага кода
- Прытрымлівайцеся існуючых шаблонаў для аднастайнасці
- Запускайце `npm run format` перад камітам
- Без каментарыяў у прадакшн-кодзе (каментарыі выдаляюцца падчас зборкі)

## Працэс Pull Request

1. Стварыце галіну для функцыі: `git checkout -b feature/your-feature`
2. Унясіце змены
3. Старанна пратэстуйце: `npm run build`
4. Адпраўце PR з зразумелым апісаннем

## Пераклад

Глядзіце [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md), каб даведацца, як дадаць новыя мовы.

## Ліцэнзійнае пагадненне ўдзельніка

Перш чым ваш PR можна будзе аб'яднаць, вам трэба падпісаць наша CLA:

- [Індывідуальнае CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [Карпаратыўнае CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Атрыманне дапамогі

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Супольнасць у Discord](https://discord.gg/Bgq3Ay3f2w)

## Ліцэнзія

BentoPDF мае падвойную ліцэнзію:

- **AGPL-3.0** для праектаў з адкрытым зыходным кодам, якія публічна дзеляцца ўсім сваім зыходным кодам
- **Камерцыйная ліцэнзія** для прапрыетарных праграм і праграм з закрытым кодам: [Атрымаць пажыццёвую ліцэнзію за $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Робячы ўнёсак, вы згаджаецеся, што ваш унёсак будзе ліцэнзаваны на гэтых умовах.
