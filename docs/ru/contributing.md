# Участие в разработке

Спасибо за интерес к участию в разработке BentoPDF! Это руководство поможет вам начать.

## Начало работы

### Требования

- Node.js 18+
- npm 9+
- Git

### Настройка

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Структура проекта

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

## Добавление нового инструмента

### Шаг 1: создайте файл логики

Создайте `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Шаг 2: создайте HTML-страницу

Создайте `src/pages/your-tool.html` по образцу существующих шаблонов инструментов.

### Шаг 3: зарегистрируйте инструмент

Добавьте в `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Шаг 4: добавьте в конфигурацию сборки

Добавьте страницу в `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Шаг 5: добавьте переводы

Добавьте записи во все файлы локалей в `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Стиль кода

- Используйте TypeScript для всего нового кода
- Следуйте существующим шаблонам для единообразия
- Запускайте `npm run format` перед коммитом
- Без комментариев в рабочем коде (комментарии удаляются при сборке)

## Процесс отправки pull request

1. Создайте ветку для функции: `git checkout -b feature/your-feature`
2. Внесите изменения
3. Тщательно протестируйте: `npm run build`
4. Отправьте PR с понятным описанием

## Перевод

О добавлении новых языков читайте в [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md).

## Лицензионное соглашение контрибьютора

Прежде чем ваш PR будет принят, нужно подписать наше CLA:

- [Индивидуальное CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [Корпоративное CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Помощь

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Сообщество в Discord](https://discord.gg/Bgq3Ay3f2w)

## Лицензия

BentoPDF распространяется по двойной лицензии:

- **AGPL-3.0** для проектов с открытым исходным кодом, где вы публикуете весь свой исходный код
- **Коммерческая лицензия** для проприетарных приложений с закрытым кодом: [Получить бессрочную лицензию за $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Участвуя в разработке, вы соглашаетесь, что ваш вклад будет лицензирован на этих условиях.
