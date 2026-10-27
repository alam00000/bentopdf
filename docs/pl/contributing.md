# Współtworzenie

Dziękujemy za zainteresowanie współtworzeniem BentoPDF! Ten przewodnik pomoże Ci zacząć.

## Pierwsze kroki

### Wymagania wstępne

- Node.js 18+
- npm 9+
- Git

### Konfiguracja

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Struktura projektu

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

## Dodawanie nowego narzędzia

### Krok 1: Utwórz plik z logiką

Utwórz `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Krok 2: Utwórz stronę HTML

Utwórz `src/pages/your-tool.html` według istniejących szablonów narzędzi.

### Krok 3: Zarejestruj narzędzie

Dodaj do `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Krok 4: Dodaj do konfiguracji budowania

Dodaj stronę do `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Krok 5: Dodaj tłumaczenia

Dodaj wpisy do wszystkich plików językowych w `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Styl kodu

- Używaj TypeScript w całym nowym kodzie
- Trzymaj się istniejących wzorców, aby zachować spójność
- Uruchom `npm run format` przed zatwierdzeniem zmian
- Bez komentarzy w kodzie produkcyjnym (komentarze są usuwane podczas budowania)

## Proces Pull Requestów

1. Utwórz gałąź funkcji: `git checkout -b feature/your-feature`
2. Wprowadź zmiany
3. Dokładnie przetestuj: `npm run build`
4. Wyślij PR z czytelnym opisem

## Tłumaczenia

Zobacz [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md), aby dowiedzieć się, jak dodawać nowe języki.

## Umowa licencyjna współtwórcy

Zanim Twój PR zostanie scalony, musisz podpisać naszą umowę CLA:

- [Indywidualna CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [Korporacyjna CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Pomoc

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Społeczność na Discordzie](https://discord.gg/Bgq3Ay3f2w)

## Licencja

BentoPDF jest dostępny na dwóch licencjach:

- **AGPL-3.0** dla projektów open source, w których publicznie udostępniasz cały kod źródłowy
- **Licencja komercyjna** dla aplikacji własnościowych i zamkniętych: [Kup licencję dożywotnią za 79 USD](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Współtworząc projekt, zgadzasz się, że Twój wkład będzie objęty tymi warunkami licencji.
