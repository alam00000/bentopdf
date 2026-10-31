# Участь у розробці

Дякуємо за інтерес до участі в розробці BentoPDF! Цей посібник допоможе вам почати.

## Початок роботи

### Вимоги

- Node.js 18+
- npm 9+
- Git

### Налаштування

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Структура проєкту

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

## Додавання нового інструмента

### Крок 1: створіть файл логіки

Створіть `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Крок 2: створіть HTML-сторінку

Створіть `src/pages/your-tool.html` за зразком наявних шаблонів інструментів.

### Крок 3: зареєструйте інструмент

Додайте до `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Крок 4: додайте до конфігурації збірки

Додайте сторінку до `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Крок 5: додайте переклади

Додайте записи до всіх файлів локалей у `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Стиль коду

- Використовуйте TypeScript для всього нового коду
- Дотримуйтеся наявних підходів для узгодженості
- Запускайте `npm run format` перед комітом
- Без коментарів у робочому коді (коментарі видаляються під час збірки)

## Процес pull request

1. Створіть гілку для функції: `git checkout -b feature/your-feature`
2. Внесіть зміни
3. Ретельно протестуйте: `npm run build`
4. Надішліть PR із чітким описом

## Переклад

Щоб додати нові мови, перегляньте [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md).

## Ліцензійна угода контриб'ютора

Перш ніж ваш PR буде злито, потрібно підписати нашу CLA:

- [Індивідуальна CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [Корпоративна CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Де отримати допомогу

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Спільнота в Discord](https://discord.gg/Bgq3Ay3f2w)

## Ліцензія

BentoPDF має подвійне ліцензування:

- **AGPL-3.0** для проєктів з відкритим кодом, де ви публічно ділитеся всім вихідним кодом
- **Комерційна ліцензія** для пропрієтарних застосунків із закритим кодом - [Отримати безстрокову ліцензію за $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Роблячи внесок, ви погоджуєтеся, що ваш внесок буде ліцензовано на цих умовах.
