# Bijdragen

Bedankt voor je interesse in een bijdrage aan BentoPDF! Deze gids helpt je op weg.

## Aan de slag

### Vereisten

- Node.js 18+
- npm 9+
- Git

### Installatie

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Projectstructuur

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

## Een nieuwe tool toevoegen

### Stap 1: Maak het logicabestand

Maak `src/js/logic/your-tool-page.ts` aan:

```typescript
import { showLoader, hideLoader, showAlert } from '../ui.js';
import { state } from '../state.js';

document.addEventListener('DOMContentLoaded', () => {
  // Your tool logic here
});
```

### Stap 2: Maak de HTML-pagina

Maak `src/pages/your-tool.html` aan volgens de bestaande tooltemplates.

### Stap 3: Registreer de tool

Voeg toe aan `src/js/config/tools.ts`:

```typescript
{
  href: import.meta.env.BASE_URL + 'your-tool.html',
  name: 'Your Tool',
  icon: 'ph-icon-name',
  subtitle: 'Description of your tool.',
}
```

### Stap 4: Voeg toe aan de buildconfiguratie

Voeg de pagina toe aan `vite.config.ts`:

```typescript
'your-tool': resolve(__dirname, 'src/pages/your-tool.html'),
```

### Stap 5: Voeg vertalingen toe

Voeg items toe aan alle localebestanden in `public/locales/`:

```json
{
  "yourTool": {
    "name": "Your Tool",
    "subtitle": "Description"
  }
}
```

## Codestijl

- Gebruik TypeScript voor alle nieuwe code
- Volg bestaande patronen voor consistentie
- Voer `npm run format` uit voordat je commit
- Geen opmerkingen in productiecode (opmerkingen worden tijdens de build verwijderd)

## Pull request-proces

1. Maak een featurebranch: `git checkout -b feature/your-feature`
2. Breng je wijzigingen aan
3. Test grondig: `npm run build`
4. Dien een PR in met een duidelijke beschrijving

## Vertalen

Zie [TRANSLATION.md](https://github.com/alam00000/bentopdf/blob/main/TRANSLATION.md) voor het toevoegen van nieuwe talen.

## Contributor License Agreement

Voordat je PR kan worden samengevoegd, moet je onze CLA ondertekenen:

- [Individual CLA (ICLA)](https://github.com/alam00000/bentopdf/blob/main/ICLA.md)
- [Corporate CLA (CCLA)](https://github.com/alam00000/bentopdf/blob/main/CCLA.md)

## Hulp krijgen

- [GitHub Issues](https://github.com/alam00000/bentopdf/issues)
- [Discord-community](https://discord.gg/Bgq3Ay3f2w)

## Licentie

BentoPDF heeft een dubbele licentie:

- **AGPL-3.0** voor open-sourceprojecten waarbij je je volledige broncode openbaar deelt
- **Commerciële licentie** voor propriëtaire/closed-source toepassingen - [Levenslange licentie voor $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)

Door bij te dragen ga je ermee akkoord dat je bijdragen onder deze voorwaarden worden gelicentieerd.
