# Prispievanie

Ďakujeme, že máte záujem prispievať do Pixel PDF! Táto príručka vám pomôže začať.

## Začíname

### Predpoklady

- Node.js 18+
- npm 9+
- Git

### Nastavenie

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/pixelpdf.git
cd pixelpdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Štruktúra projektu

```
pixelpdf/
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

## Pridanie nového nástroja

### Krok 1: Vytvorte súbor s logikou

Vytvorte `src/js/logic/your-tool-page.ts`:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Krok 2: Vytvorte HTML stránku

Vytvorte `src/pages/your-tool.html` podľa existujúcich šablón nástrojov.

### Krok 3: Zaregistrujte nástroj

Pridajte do `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Krok 4: Pridajte do konfigurácie buildu

Pridajte stránku do `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Krok 5: Pridajte preklady

Pridajte záznamy do všetkých jazykových súborov v `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Štýl kódu

- Pre všetok nový kód používajte TypeScript
- Dodržiavajte existujúce vzory pre konzistentnosť
- Pred odoslaním zmien spustite `npm run format`
- Žiadne komentáre v produkčnom kóde (komentáre sa pri builde odstraňujú)

## Postup pre pull request

1. Vytvorte vetvu funkcie: `git checkout -b feature/your-feature`
2. Vykonajte zmeny
3. Dôkladne otestujte: `npm run build`
4. Odošlite PR s jasným popisom

## Preklady

Pozrite si [TRANSLATION.md](https://github.com/mohammedalhinaki-cloud/Pixel-PDF/blob/main/TRANSLATION.md), kde nájdete postup pridania nových jazykov.

## Licenčná zmluva prispievateľa

Skôr než bude váš PR zlúčený, budete musieť podpísať našu CLA:

- [Individuálna CLA (ICLA)](https://github.com/mohammedalhinaki-cloud/Pixel-PDF/blob/main/ICLA.md)
- [Firemná CLA (CCLA)](https://github.com/mohammedalhinaki-cloud/Pixel-PDF/blob/main/CCLA.md)

## Pomoc

- [GitHub Issues](https://github.com/mohammedalhinaki-cloud/Pixel-PDF/issues)
- [Komunita na Discorde](https://discord.gg/Bgq3Ay3f2w)

## Licencia

Pixel PDF má duálnu licenciu:

- **AGPL-3.0** pre open-source projekty, v ktorých verejne zdieľate celý zdrojový kód
- **Komerčná licencia** pre proprietárne aplikácie so zatvoreným zdrojovým kódom - [Získajte doživotnú licenciu za $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Prispievaním súhlasíte s tým, že vaše príspevky budú licencované za týchto podmienok.
